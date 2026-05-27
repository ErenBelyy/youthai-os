import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { repo, uuid, azureSqlConfigured } from '@/lib/db/client';
import { ensureSeed } from '@/lib/db/seed';
import { azureConfigured, chatCompletion } from '@/lib/ai/azure-openai';
import { searchConfigured, getSearchClient } from '@/lib/ai/azure-search';
import { buildSystem } from '@/lib/ai/prompts';

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}
const json = (data, status = 200) => cors(NextResponse.json(data, { status }));
export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })); }

async function getUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

async function getMembership(workspaceId, userId) {
  if (!userId) return null;
  const members = await repo('workspace_members').list({ workspaceId, userId });
  return members[0] || null;
}

function slugify(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `ws-${Date.now()}`;
}

const PALETTE = ['from-brand-500 to-aurora-cyan','from-aurora-violet to-aurora-rose','from-aurora-mint to-aurora-amber','from-aurora-amber to-aurora-rose','from-aurora-cyan to-aurora-violet'];
const EMOJIS = ['✨','🚀','🌟','🌍','🎯','💡','🔥','⚡','🌈','🦋'];

async function handle(request, { params }) {
  await ensureSeed();
  const { path = [] } = params;
  const route = '/' + path.join('/');
  const method = request.method;
  const url = new URL(request.url);
  const sp = url.searchParams;
  const user = await getUser();

  try {
    // Public health
    if (route === '/' && method === 'GET') {
      return json({ app: 'YouthAI OS', version: '1.0.0', time: new Date().toISOString(),
        azure: { openai: azureConfigured(), search: searchConfigured(), sql: azureSqlConfigured() } });
    }
    if (route === '/root' && method === 'GET') return json({ message: 'Hello World' });

    // All other routes need auth
    if (!user) return json({ error: 'unauthorized' }, 401);

    // ===== Workspaces (scoped to user) =====
    if (route === '/workspaces' && method === 'GET') {
      const memberships = await repo('workspace_members').list({ userId: user.id });
      const ids = memberships.map(m => m.workspaceId);
      const list = await Promise.all(ids.map(id => repo('workspaces').get(id)));
      const wsWithRole = list.filter(Boolean).map(w => ({ ...w, role: memberships.find(m => m.workspaceId === w.id)?.role }));
      return json({ workspaces: wsWithRole });
    }
    if (route === '/workspaces' && method === 'POST') {
      const body = await request.json();
      if (!body.name) return json({ error: 'Numele este obligatoriu' }, 400);
      let id = slugify(body.slug || body.name);
      const exists = await repo('workspaces').get(id);
      if (exists) id = `${id}-${Date.now().toString(36)}`;
      const ws = await repo('workspaces').create({
        id, name: body.name,
        tagline: body.tagline || 'Spațiu de lucru',
        emoji: body.emoji || EMOJIS[Math.floor(Math.random()*EMOJIS.length)],
        color: body.color || PALETTE[Math.floor(Math.random()*PALETTE.length)],
        ownerId: user.id,
      });
      await repo('workspace_members').create({ workspaceId: ws.id, userId: user.id, email: user.email.toLowerCase(), role: 'owner' });
      await repo('activities').create({ workspaceId: ws.id, type:'workspace.created', text:`Spațiul "${ws.name}" a fost creat`, actor:'user' });
      return json({ workspace: { ...ws, role: 'owner' } });
    }
    const wsGet = route.match(/^\/workspaces\/([^/]+)$/);
    if (wsGet && method === 'GET') {
      const m = await getMembership(wsGet[1], user.id);
      if (!m) return json({ error: 'forbidden' }, 403);
      const ws = await repo('workspaces').get(wsGet[1]);
      return ws ? json({ workspace: { ...ws, role: m.role } }) : json({ error:'Negăsit' }, 404);
    }

    // ===== Members =====
    const membersMatch = route.match(/^\/workspaces\/([^/]+)\/members$/);
    if (membersMatch && method === 'GET') {
      const wsId = membersMatch[1];
      const m = await getMembership(wsId, user.id);
      if (!m) return json({ error: 'forbidden' }, 403);
      const members = await repo('workspace_members').list({ workspaceId: wsId });
      return json({ members });
    }
    const memberOneMatch = route.match(/^\/workspaces\/([^/]+)\/members\/([^/]+)$/);
    if (memberOneMatch && method === 'DELETE') {
      const [, wsId, memberId] = memberOneMatch;
      const my = await getMembership(wsId, user.id);
      if (!my || (my.role !== 'owner' && my.role !== 'admin')) return json({ error: 'forbidden' }, 403);
      const target = await repo('workspace_members').get(memberId);
      if (target?.role === 'owner') return json({ error: 'Nu se poate elimina proprietarul' }, 400);
      await repo('workspace_members').remove(memberId);
      return json({ ok: true });
    }

    // ===== Invites =====
    const invMatch = route.match(/^\/workspaces\/([^/]+)\/invites$/);
    if (invMatch && method === 'GET') {
      const wsId = invMatch[1];
      const m = await getMembership(wsId, user.id);
      if (!m) return json({ error: 'forbidden' }, 403);
      const invites = await repo('invites').list({ workspaceId: wsId, status: 'pending' });
      return json({ invites });
    }
    if (invMatch && method === 'POST') {
      const wsId = invMatch[1];
      const my = await getMembership(wsId, user.id);
      if (!my || (my.role !== 'owner' && my.role !== 'admin')) return json({ error: 'forbidden' }, 403);
      const body = await request.json();
      const email = (body.email || '').toLowerCase().trim();
      if (!email) return json({ error: 'Email obligatoriu' }, 400);
      // If user already exists with this email + is already a member, no-op
      const existingUsers = await repo('users').list({ email });
      const existingUser = existingUsers[0];
      if (existingUser) {
        const existingMember = (await repo('workspace_members').list({ workspaceId: wsId, userId: existingUser.id }))[0];
        if (existingMember) return json({ error: 'Acest utilizator este deja membru' }, 409);
      }
      const existingInvite = (await repo('invites').list({ workspaceId: wsId, email, status: 'pending' }))[0];
      if (existingInvite) return json({ error: 'Există deja o invitație activă', invite: existingInvite });
      const token = uuid();
      const invite = await repo('invites').create({
        workspaceId: wsId, email, role: body.role || 'member',
        token, status: 'pending', invitedBy: user.id,
      });
      // If user already has an account, auto-add membership immediately
      if (existingUser) {
        await repo('workspace_members').create({ workspaceId: wsId, userId: existingUser.id, email, role: invite.role });
        await repo('invites').update(invite.id, { status: 'accepted', acceptedAt: new Date().toISOString(), acceptedBy: existingUser.id });
        await repo('activities').create({ workspaceId: wsId, type:'member.joined', text:`${email} a fost adăugat în spațiu`, actor: 'user' });
      } else {
        await repo('activities').create({ workspaceId: wsId, type:'invite.sent', text:`Invitație trimisă către ${email}`, actor: 'user' });
      }
      return json({ invite });
    }
    const invOneMatch = route.match(/^\/workspaces\/([^/]+)\/invites\/([^/]+)$/);
    if (invOneMatch && method === 'DELETE') {
      const [, wsId, inviteId] = invOneMatch;
      const my = await getMembership(wsId, user.id);
      if (!my || (my.role !== 'owner' && my.role !== 'admin')) return json({ error: 'forbidden' }, 403);
      await repo('invites').remove(inviteId);
      return json({ ok: true });
    }

    // ===== Projects =====
    if (route === '/projects' && method === 'GET') {
      const wsId = sp.get('workspaceId');
      if (wsId && !(await getMembership(wsId, user.id))) return json({ error: 'forbidden' }, 403);
      const projects = await repo('projects').list(wsId ? { workspaceId: wsId } : {}, { sort:{ createdAt:-1 } });
      return json({ projects });
    }
    if (route === '/projects' && method === 'POST') {
      const body = await request.json();
      const m = await getMembership(body.workspaceId, user.id);
      if (!m) return json({ error: 'forbidden' }, 403);
      const p = await repo('projects').create(body);
      await repo('activities').create({ workspaceId: p.workspaceId, type:'project.created', text:`Proiectul "${p.name}" a fost creat`, actor: user.email });
      return json({ project: p });
    }

    // ===== Grants =====
    if (route === '/grants' && method === 'GET') {
      const wsId = sp.get('workspaceId');
      if (wsId && !(await getMembership(wsId, user.id))) return json({ error: 'forbidden' }, 403);
      const grants = await repo('grants').list(wsId ? { workspaceId: wsId } : {}, { sort:{ createdAt:-1 } });
      return json({ grants });
    }
    if (route === '/grants' && method === 'POST') {
      const body = await request.json();
      const m = await getMembership(body.workspaceId, user.id);
      if (!m) return json({ error: 'forbidden' }, 403);
      const g = await repo('grants').create(body);
      await repo('activities').create({ workspaceId: g.workspaceId, type:'grant.drafted', text:`Grantul "${g.title}" a fost schițat`, actor: 'ai' });
      return json({ grant: g });
    }

    // ===== Opportunities (global, read-only) =====
    if (route === '/opportunities' && method === 'GET') {
      const opps = await repo('opportunities').list({}, { sort:{ match:-1 } });
      return json({ opportunities: opps });
    }

    // ===== Agents =====
    if (route === '/agents' && method === 'GET') {
      const agents = await repo('agents').list({});
      return json({ agents });
    }

    // ===== Documents =====
    if (route === '/documents' && method === 'GET') {
      const wsId = sp.get('workspaceId');
      if (wsId && !(await getMembership(wsId, user.id))) return json({ error: 'forbidden' }, 403);
      const docs = await repo('documents').list(wsId ? { workspaceId: wsId } : {}, { sort:{ createdAt:-1 } });
      const slim = docs.map(({ content, ...rest }) => ({ ...rest, hasContent: !!content }));
      return json({ documents: slim });
    }
    if (route === '/documents' && method === 'POST') {
      const body = await request.json();
      const m = await getMembership(body.workspaceId, user.id);
      if (!m) return json({ error: 'forbidden' }, 403);
      const d = await repo('documents').create(body);
      await repo('activities').create({ workspaceId: d.workspaceId, type:'doc.uploaded', text:`Document încărcat: ${d.name}`, actor: user.email });
      return json({ document: d });
    }
    const docPatch = route.match(/^\/documents\/([^/]+)$/);
    if (docPatch && (method === 'PATCH' || method === 'GET')) {
      const doc = await repo('documents').get(docPatch[1]);
      if (!doc) return json({ error:'Negăsit' }, 404);
      const m = await getMembership(doc.workspaceId, user.id);
      if (!m) return json({ error: 'forbidden' }, 403);
      if (method === 'GET') return json({ document: doc });
      const body = await request.json();
      const updated = await repo('documents').update(docPatch[1], body);
      return json({ document: updated });
    }

    // ===== Knowledge / Search =====
    if (route === '/knowledge/search' && method === 'GET') {
      const q = sp.get('q') || '';
      const wsId = sp.get('workspaceId');
      if (wsId && !(await getMembership(wsId, user.id))) return json({ error: 'forbidden' }, 403);
      if (searchConfigured()) {
        try {
          const client = getSearchClient();
          const results = [];
          for await (const r of (await client.search(q, { top: 10 })).results) {
            results.push({ id: r.document.id, name: r.document.name || r.document.title, snippet: (r.document.content || '').slice(0, 240), score: r.score });
          }
          return json({ results, source:'azure-search' });
        } catch (e) { /* fall through */ }
      }
      const docs = await repo('documents').list(wsId ? { workspaceId: wsId } : {});
      const lower = q.toLowerCase();
      const results = docs
        .filter(d => (d.name||'').toLowerCase().includes(lower) || (d.content||'').toLowerCase().includes(lower) || (d.summary||'').toLowerCase().includes(lower))
        .map(d => {
          const text = d.content || d.summary || '';
          const idx = text.toLowerCase().indexOf(lower);
          const snippet = idx >= 0 ? text.slice(Math.max(0, idx-60), idx+200) : (d.summary || '').slice(0, 200);
          return { id: d.id, name: d.name, snippet };
        });
      return json({ results, source:'local' });
    }

    // ===== Activities =====
    if (route === '/activities' && method === 'GET') {
      const wsId = sp.get('workspaceId');
      const filter = {};
      if (wsId) {
        if (!(await getMembership(wsId, user.id))) return json({ error: 'forbidden' }, 403);
        filter.workspaceId = wsId;
      } else {
        const memberships = await repo('workspace_members').list({ userId: user.id });
        const ids = memberships.map(m => m.workspaceId);
        if (ids.length === 0) return json({ activities: [] });
        const all = await repo('activities').list({}, { sort:{ createdAt:-1 } });
        const limit = Math.min(parseInt(sp.get('limit') || '20'), 100);
        return json({ activities: all.filter(a => ids.includes(a.workspaceId)).slice(0, limit) });
      }
      const limit = Math.min(parseInt(sp.get('limit') || '20'), 100);
      const activities = await repo('activities').list(filter, { sort:{ createdAt:-1 }, limit });
      return json({ activities });
    }

    // ===== Stats =====
    if (route === '/stats' && method === 'GET') {
      const wsId = sp.get('workspaceId');
      if (wsId && !(await getMembership(wsId, user.id))) return json({ error: 'forbidden' }, 403);
      const f = wsId ? { workspaceId: wsId } : {};
      const [projects, grants, documents, opportunities] = await Promise.all([
        repo('projects').list(f),
        repo('grants').list(f),
        repo('documents').list(f),
        repo('opportunities').list({}),
      ]);
      return json({ projects: projects.length, grants: grants.length, documents: documents.length, opportunities: opportunities.length });
    }

    // ===== AI Chat =====
    if (route === '/ai/chat' && method === 'POST') {
      const body = await request.json();
      const { messages = [], workspaceId, agentKey } = body;
      if (workspaceId && !(await getMembership(workspaceId, user.id))) return json({ error: 'forbidden' }, 403);
      if (!azureConfigured()) {
        return json({
          error: 'AZURE_OPENAI_NOT_CONFIGURED',
          content: '⚠️ **Azure OpenAI nu este configurat.**\n\nAdaugă în `/app/.env`:\n\n```\nAZURE_OPENAI_ENDPOINT=https://RESURSA-TA.openai.azure.com/\nAZURE_OPENAI_API_KEY=...\nAZURE_OPENAI_CHAT_DEPLOYMENT=gpt-4o\n```\n\nApoi restartează serverul. Toate modulele AI folosesc Azure OpenAI.'
        });
      }
      const ws = workspaceId ? await repo('workspaces').get(workspaceId) : null;
      const sys = buildSystem({ workspace: ws, agentKey });
      const fullMessages = [{ role:'system', content: sys }, ...messages];
      try {
        const resp = await chatCompletion({ messages: fullMessages, temperature: 0.5 });
        const content = resp.choices?.[0]?.message?.content || '';
        if (workspaceId) {
          await repo('activities').create({ workspaceId, type:'ai.chat', text:`AI ${agentKey || 'asistent'} a răspuns`, actor:'ai' });
        }
        return json({ content });
      } catch (e) {
        console.error('AI error:', e);
        return json({ error: e.message || 'Cererea AI a eșuat' }, 200);
      }
    }

    return json({ error: `Ruta ${route} nu a fost găsită` }, 404);
  } catch (error) {
    console.error('API Error:', error);
    return json({ error: 'Eroare internă', detail: error.message }, 500);
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
