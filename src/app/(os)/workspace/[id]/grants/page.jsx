'use client';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/page-header';
import { HandCoins, Sparkles, Loader2, X } from 'lucide-react';
import ReactMarkdown from '@/components/ui/markdown';
import { toast } from 'sonner';

const STATUS_RO = { drafting:'în schiță', submitted:'depus', approved:'aprobat', rejected:'respins' };

export default function GrantsPage({ params }) {
  const wsId = params.id;
  const [grants, setGrants] = useState([]);
  const [drafterOpen, setDrafterOpen] = useState(false);
  const [brief, setBrief] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  const load = ()=> fetch(`/api/grants?workspaceId=${wsId}`).then(r=>r.json()).then(d=>setGrants(d.grants||[]));
  useEffect(()=>{ load(); }, [wsId]);

  const draftGrant = async () => {
    if (!brief.trim()) return;
    setLoading(true); setDraft('');
    try {
      const r = await fetch('/api/ai/chat', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: [{ role:'user', content: brief }], workspaceId: wsId, agentKey:'grant' }) });
      const d = await r.json();
      setDraft(d.content || `⚠️ ${d.error || 'Fără răspuns'}`);
    } finally { setLoading(false); }
  };

  const saveAsGrant = async () => {
    if (!draft) return;
    const titleMatch = draft.match(/^#\s+(.+)$|^##\s*Titlu[\s\S]*?\n(.+)/m);
    const title = (titleMatch && (titleMatch[1] || titleMatch[2]))?.trim() || brief.slice(0,80);
    const r = await fetch('/api/grants', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ workspaceId: wsId, title, funder:'De stabilit', amount:0, currency:'EUR', deadline:'', status:'drafting', match:90, draft }) });
    if (r.ok) { toast.success('Grant salvat'); setDrafterOpen(false); setBrief(''); setDraft(''); load(); }
  };

  return (
    <div>
      <PageHeader icon={HandCoins} title="Granturi" subtitle="Scrie, gestionează și depune propuneri de finanțare — cu Agentul de Granturi."
        actions={<button onClick={()=>setDrafterOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm"><Sparkles className="w-4 h-4" /> Schiță AI</button>} />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {grants.map(g => (
            <div key={g.id} className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{g.funder}</div>
                  <div className="font-display font-semibold mt-0.5">{g.title}</div>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-aurora-violet/10 text-aurora-violet border border-aurora-violet/20">{STATUS_RO[g.status] || g.status}</span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <div><span className="text-foreground font-medium">{g.currency} {Number(g.amount).toLocaleString('ro-RO')}</span></div>
                <div>Deadline: <span className="text-foreground">{g.deadline || '—'}</span></div>
                <div className="ml-auto inline-flex items-center gap-1"><Sparkles className="w-3 h-3 text-primary" /> {g.match||0}% potrivire</div>
              </div>
            </div>
          ))}
          {grants.length === 0 && <div className="text-sm text-muted-foreground">Niciun grant încă. Generează unul cu AI.</div>}
        </div>
      </div>

      {drafterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /><span className="font-display font-semibold">Agent Granturi</span></div>
              <button onClick={()=>setDrafterOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto scrollbar-thin">
              <textarea value={brief} onChange={e=>setBrief(e.target.value)} rows={3} placeholder="Descrie proiectul, finanțatorul, grupul țintă, bugetul estimat…" className="w-full bg-secondary rounded-xl p-3 text-sm outline-none resize-none" />
              <button onClick={draftGrant} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generează propunere
              </button>
              {draft && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <ReactMarkdown>{draft}</ReactMarkdown>
                </div>
              )}
            </div>
            {draft && (
              <div className="p-3 border-t border-border flex justify-end gap-2">
                <button onClick={()=>setDraft('')} className="text-sm px-3 py-2 rounded-lg hover:bg-accent">Renunță</button>
                <button onClick={saveAsGrant} className="text-sm px-3 py-2 rounded-lg bg-primary text-primary-foreground">Salvează grant</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
