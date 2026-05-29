'use client';
import { useState } from 'react';
import PageHeader from '@/components/ui/page-header';
import { BookOpen, Search, Loader2 } from 'lucide-react';

export default function KnowledgePage({ params }) {
  const wsId = params.id;
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    const r = await fetch(`/api/knowledge/search?q=${encodeURIComponent(q)}&workspaceId=${wsId}`);
    const d = await r.json();
    setResults(d.results || []);
    setLoading(false);
  };

  return (
    <div>
      <PageHeader icon={BookOpen} title="Cunoștințe" subtitle="Căutare semantică în documentele tale indexate — bazată pe Azure AI Search." gradient="from-aurora-mint to-aurora-cyan" />
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/60 backdrop-blur-xl px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter' && search()} placeholder="Caută documente, politici, strategii…" className="flex-1 bg-transparent text-sm outline-none" />
          <button onClick={search} disabled={loading} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs">{loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Caută'}</button>
        </div>
        {results.length === 0 && !loading && <div className="text-sm text-muted-foreground">Scrie o interogare și apasă Enter. Configurează Azure AI Search pentru căutare vectorială.</div>}
        <div className="space-y-2">
          {results.map(r => (
            <div key={r.id} className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-4">
              <div className="font-medium text-sm">{r.name}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-3">{r.snippet}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
