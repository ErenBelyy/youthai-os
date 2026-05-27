'use client';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/page-header';
import { FileText, Upload, Sparkles, Loader2, X } from 'lucide-react';
import ReactMarkdown from '@/components/ui/markdown';
import { toast } from 'sonner';

export default function DocumentsPage({ params }) {
  const wsId = params.id;
  const [docs, setDocs] = useState([]);
  const [openDoc, setOpenDoc] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  const load = ()=> fetch(`/api/documents?workspaceId=${wsId}`).then(r=>r.json()).then(d=>setDocs(d.documents||[]));
  useEffect(()=>{ load(); }, [wsId]);

  const upload = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const text = await f.text().catch(()=> '');
    const r = await fetch('/api/documents', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ workspaceId: wsId, name: f.name, size: f.size, type: f.type, content: text.slice(0, 30000) }) });
    if (r.ok) { toast.success('Document încărcat'); load(); }
  };

  const summarize = async (doc) => {
    setSummarizing(true);
    try {
      const full = await fetch(`/api/documents/${doc.id}`).then(r=>r.json());
      const content = full.document?.content || doc.content || '';
      const r = await fetch('/api/ai/chat', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: [{ role:'user', content: `Rezumă documentul în 5 bullets în română, apoi listează 3 acțiuni de întreprins. Conținut:\n\n${content}` }], workspaceId: wsId }) });
      const d = await r.json();
      await fetch(`/api/documents/${doc.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ summary: d.content }) });
      setOpenDoc({ ...doc, summary: d.content });
      load();
    } finally { setSummarizing(false); }
  };

  return (
    <div>
      <PageHeader icon={FileText} title="Documente" subtitle="Încarcă PDF-uri și note. Indexare pentru căutare semantică. Rezumate AI."
        actions={
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm cursor-pointer">
            <Upload className="w-4 h-4" /> Încarcă
            <input type="file" className="hidden" onChange={upload} accept=".txt,.md,.pdf,.docx" />
          </label>
        } />
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {docs.map(d=>(
            <button key={d.id} onClick={()=>setOpenDoc(d)} className="text-left rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-4 hover:border-primary/40 transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500/20 to-aurora-cyan/20 border border-primary/20 flex items-center justify-center"><FileText className="w-4 h-4 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{d.name}</div>
                  <div className="text-[11px] text-muted-foreground">{Math.round((d.size||0)/1024)} KB · {new Date(d.createdAt).toLocaleDateString('ro-RO')}</div>
                </div>
              </div>
              {d.summary && <div className="mt-3 text-xs text-muted-foreground line-clamp-3">{d.summary.replace(/[#*`]/g,'').slice(0,180)}…</div>}
            </button>
          ))}
          {docs.length === 0 && <div className="text-sm text-muted-foreground">Niciun document încă.</div>}
        </div>
      </div>
      {openDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="font-display font-semibold truncate">{openDoc.name}</div>
              <button onClick={()=>setOpenDoc(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {openDoc.summary ? <ReactMarkdown>{openDoc.summary}</ReactMarkdown>
                : <p className="text-sm text-muted-foreground">Fără rezumat încă. Generează unul cu AI.</p>}
            </div>
            <div className="p-3 border-t border-border flex justify-end">
              <button onClick={()=>summarize(openDoc)} disabled={summarizing} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
                {summarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} {openDoc.summary?'Re-rezumare':'Rezumă cu AI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
