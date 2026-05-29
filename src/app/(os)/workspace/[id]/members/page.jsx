'use client';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/page-header';
import { Users, Mail, Loader2, Send, Copy, Check, Trash2 } from 'lucide-react';
import { useWorkspace } from '@/app/providers';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

const ROLE_RO = { owner:'proprietar', admin:'admin', editor:'editor', member:'membru' };

export default function MembersPage({ params }) {
  const wsId = params.id;
  const { current } = useWorkspace();
  const { data: session } = useSession();
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const load = async () => {
    const [m, i] = await Promise.all([
      fetch(`/api/workspaces/${wsId}/members`).then(r=>r.json()),
      fetch(`/api/workspaces/${wsId}/invites`).then(r=>r.json()),
    ]);
    setMembers(m.members || []);
    setInvites(i.invites || []);
  };
  useEffect(()=>{ load(); }, [wsId]);

  const myRole = members.find(m => m.email?.toLowerCase() === session?.user?.email?.toLowerCase())?.role;
  const canInvite = myRole === 'owner' || myRole === 'admin';

  const invite = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const r = await fetch(`/api/workspaces/${wsId}/invites`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, role }) });
    const d = await r.json();
    setLoading(false);
    if (r.ok) { toast.success(`Invitație trimisă către ${email}`); setEmail(''); load(); }
    else toast.error(d.error || 'Eroare');
  };

  const revoke = async (inviteId) => {
    await fetch(`/api/workspaces/${wsId}/invites/${inviteId}`, { method:'DELETE' });
    load();
  };

  const remove = async (memberId) => {
    await fetch(`/api/workspaces/${wsId}/members/${memberId}`, { method:'DELETE' });
    load();
  };

  const copyLink = (token, inviteId) => {
    const link = `${window.location.origin}/signin?invite=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(inviteId);
    setTimeout(()=>setCopiedId(null), 1500);
    toast.success('Link copiat');
  };

  return (
    <div>
      <PageHeader icon={Users} title="Membri" subtitle={`Gestionează membrii și invitațiile pentru ${current?.name || 'acest spațiu'}.`} />
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        {canInvite && (
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold">Invită prin email</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&invite()} placeholder="membru@email.com" className="flex-1 bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none" />
              <select value={role} onChange={e=>setRole(e.target.value)} className="bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none">
                <option value="member">Membru</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={invite} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Invită
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-display font-semibold">Membri ({members.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-aurora-violet flex items-center justify-center text-white text-sm font-medium">{(m.email || '?').slice(0,2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{m.email}</div>
                  <div className="text-[11px] text-muted-foreground">A intrat la {new Date(m.createdAt).toLocaleDateString('ro-RO')}</div>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{ROLE_RO[m.role] || m.role}</span>
                {canInvite && m.role !== 'owner' && (
                  <button onClick={()=>remove(m.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                )}
              </div>
            ))}
            {members.length === 0 && <div className="px-4 py-6 text-sm text-muted-foreground text-center">Niciun membru încă.</div>}
          </div>
        </div>

        {invites.length > 0 && (
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-display font-semibold">Invitații în așteptare ({invites.length})</h3>
            </div>
            <div className="divide-y divide-border">
              {invites.map(inv => (
                <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"><Mail className="w-4 h-4 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{inv.email}</div>
                    <div className="text-[11px] text-muted-foreground">Invitat la {new Date(inv.createdAt).toLocaleDateString('ro-RO')} · {ROLE_RO[inv.role] || inv.role}</div>
                  </div>
                  {canInvite && (
                    <>
                      <button onClick={()=>copyLink(inv.token, inv.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs hover:bg-accent text-muted-foreground hover:text-foreground">
                        {copiedId === inv.id ? <Check className="w-3 h-3 text-aurora-mint" /> : <Copy className="w-3 h-3" />} Copiază link
                      </button>
                      <button onClick={()=>revoke(inv.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
