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
      <PageHeader icon={BookOpen} title="Knowledge" subtitle="Semantic search across your indexed documents — powered by Azure AI Search." gradient="from-aurora-mint to-aurora-cyan" />
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/60 backdrop-blur-xl px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter' && search()} placeholder="Search documents, policies, strategies…" className="flex-1 bg-transparent text-sm outline-none" />
          <button onClick={search} disabled={loading} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs">{loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}</button>
        </div>
        {results.length === 0 && !loading && <div className="text-sm text-muted-foreground">Type a query and press Enter. Configure Azure AI Search for full vector search.</div>}
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
