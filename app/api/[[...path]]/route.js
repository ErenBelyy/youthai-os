import { NextResponse } from 'next/server';
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

async function handle(request, { params }) {
  await ensureSeed();
  const { path = [] } = params;
  const route = '/' + path.join('/');
  const method = request.method;
  const url = new URL(request.url);
  const sp = url.searchParams;

  try {
    // Root / health
    if (route === '/' && method === 'GET') {
      return json({
        app: 'YouthAI OS',
        version: '1.0.0',
        time: new Date().toISOString(),
        azure: {
          openai: azureConfigured(),
          search: searchConfigured(),
          sql: azureSqlConfigured(),
        },
      });
    }
    if (route === '/root' && method === 'GET') return json({ message: 'Hello World' });

    // ===== Workspaces =====
    if (route === '/workspaces' && method === 'GET') {
      const ws = await repo('workspaces').list({}, { sort: { createdAt: 1 } });
      return json({ workspaces: ws });
    }
    if (route === '/workspaces' && method === 'POST') {
      const body = await request.json();
      if (!body.name) return json({ error: 'name is required' }, 400);
      const palette = ['from-brand-500 to-aurora-cyan','from-aurora-violet to-aurora-rose','from-aurora-mint to-aurora-amber','from-aurora-amber to-aurora-rose'];
      const ws = await repo('workspaces').create({
        id: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),
        name: body.name,
        tagline: body.tagline || 'Custom workspace',
        emoji: body.emoji || '✨',
        color: body.color || palette[Math.floor(Math.random()*palette.length)],
      });
      await repo('activities').create({ workspaceId: ws.id, type:'workspace.created', text:`Workspace "${ws.name}" created`, actor:'system' });
      return json({ workspace: ws });
    }
    const wsMatch = route.match(/^\/workspaces\/([^/]+)$/);
    if (wsMatch && method === 'GET') {
      const ws = await repo('workspaces').get(wsMatch[1]);
      return ws ? json({ workspace: ws }) : json({ error:'Not found' }, 404);
    }

    // ===== Projects =====
    if (route === '/projects' && method === 'GET') {
      const filter = {}; if (sp.get('workspaceId')) filter.workspaceId = sp.get('workspaceId');
      const projects = await repo('projects').list(filter, { sort:{ createdAt:-1 } });
      return json({ projects });
    }
    if (route === '/projects' && method === 'POST') {
      const body = await request.json();
      const p = await repo('projects').create(body);
      await repo('activities').create({ workspaceId: p.workspaceId, type:'project.created', text:`Project "${p.name}" created`, actor:'user' });
      return json({ project: p });
    }

    // ===== Grants =====
    if (route === '/grants' && method === 'GET') {
      const filter = {}; if (sp.get('workspaceId')) filter.workspaceId = sp.get('workspaceId');
      const grants = await repo('grants').list(filter, { sort:{ createdAt:-1 } });
      return json({ grants });
    }
    if (route === '/grants' && method === 'POST') {
      const body = await request.json();
      const g = await repo('grants').create(body);
      await repo('activities').create({ workspaceId: g.workspaceId, type:'grant.drafted', text:`Grant "${g.title}" drafted`, actor:'ai' });
      return json({ grant: g });
    }

    // ===== Opportunities =====
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
      const filter = {}; if (sp.get('workspaceId')) filter.workspaceId = sp.get('workspaceId');
      const docs = await repo('documents').list(filter, { sort:{ createdAt:-1 } });
      // strip content from list view
      const slim = docs.map(({ content, ...rest }) => ({ ...rest, hasContent: !!content }));
      return json({ documents: slim });
    }
    if (route === '/documents' && method === 'POST') {
      const body = await request.json();
      const d = await repo('documents').create(body);
      await repo('activities').create({ workspaceId: d.workspaceId, type:'doc.uploaded', text:`Uploaded ${d.name}`, actor:'user' });
      return json({ document: d });
    }
    const docPatch = route.match(/^\/documents\/([^/]+)$/);
    if (docPatch && method === 'PATCH') {
      const body = await request.json();
      const d = await repo('documents').update(docPatch[1], body);
      return json({ document: d });
    }
    if (docPatch && method === 'GET') {
      const d = await repo('documents').get(docPatch[1]);
      return d ? json({ document: d }) : json({ error:'Not found' }, 404);
    }

    // ===== Knowledge / Search =====
    if (route === '/knowledge/search' && method === 'GET') {
      const q = sp.get('q') || '';
      const wsId = sp.get('workspaceId');
      // Try Azure AI Search if configured
      if (searchConfigured()) {
        try {
          const client = getSearchClient();
          const results = [];
          for await (const r of (await client.search(q, { top: 10 })).results) {
            results.push({ id: r.document.id, name: r.document.name || r.document.title, snippet: (r.document.content || '').slice(0, 240), score: r.score });
          }
          return json({ results, source:'azure-search' });
        } catch (e) {
          // fall through to local
        }
      }
      // Local fallback
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
      const filter = {}; if (sp.get('workspaceId')) filter.workspaceId = sp.get('workspaceId');
      const limit = Math.min(parseInt(sp.get('limit') || '20'), 100);
      const activities = await repo('activities').list(filter, { sort:{ createdAt:-1 }, limit });
      return json({ activities });
    }

    // ===== Stats =====
    if (route === '/stats' && method === 'GET') {
      const wsId = sp.get('workspaceId');
      const f = wsId ? { workspaceId: wsId } : {};
      const [projects, grants, documents, opportunities] = await Promise.all([
        repo('projects').list(f),
        repo('grants').list(f),
        repo('documents').list(f),
        repo('opportunities').list(wsId ? { workspaceId:'global' } : {}),
      ]);
      return json({ projects: projects.length, grants: grants.length, documents: documents.length, opportunities: opportunities.length });
    }

    // ===== AI Chat =====
    if (route === '/ai/chat' && method === 'POST') {
      const body = await request.json();
      const { messages = [], workspaceId, agentKey } = body;
      if (!azureConfigured()) {
        return json({
          error: 'AZURE_OPENAI_NOT_CONFIGURED',
          content: '⚠️ **Azure OpenAI is not configured.**\n\nAdd the following to `/app/.env`:\n\n```\nAZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.openai.azure.com/\nAZURE_OPENAI_API_KEY=...\nAZURE_OPENAI_CHAT_DEPLOYMENT=gpt-4o\n```\n\nThen restart the server. All YouthAI OS modules use Azure OpenAI for generation.'
        });
      }
      const ws = workspaceId ? await repo('workspaces').get(workspaceId) : null;
      const sys = buildSystem({ workspace: ws, agentKey });
      const fullMessages = [{ role:'system', content: sys }, ...messages];
      try {
        const resp = await chatCompletion({ messages: fullMessages, temperature: 0.5 });
        const content = resp.choices?.[0]?.message?.content || '';
        if (workspaceId) {
          await repo('activities').create({ workspaceId, type:'ai.chat', text:`AI ${agentKey || 'assistant'} responded`, actor:'ai' });
        }
        return json({ content });
      } catch (e) {
        console.error('AI error:', e);
        return json({ error: e.message || 'AI request failed' }, 200);
      }
    }

    return json({ error: `Route ${route} not found` }, 404);
  } catch (error) {
    console.error('API Error:', error);
    return json({ error: 'Internal server error', detail: error.message }, 500);
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
