'use client';
import { useState } from 'react';
import PageHeader from '@/components/ui/page-header';
import { Presentation, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from '@/components/ui/markdown';

export default function PresentationsPage({ params }) {
  const wsId = params.id;
  const [topic, setTopic] = useState('');
  const [slides, setSlides] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setSlides('');
    try {
      const r = await fetch('/api/ai/chat', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: [{ role:'user', content: `Generate a 10-slide pitch deck about: ${topic}` }], workspaceId: wsId, agentKey:'presentation' }) });
      const d = await r.json();
      setSlides(d.content || `⚠️ ${d.error || 'No response'}`);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader icon={Presentation} title="Presentations" subtitle="Generate editable slide decks for donors, events and trainings." gradient="from-aurora-violet to-aurora-rose" />
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-4">
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-4">
          <textarea value={topic} onChange={e=>setTopic(e.target.value)} rows={3} placeholder="Topic, audience, tone, key messages…" className="w-full bg-secondary rounded-xl p-3 text-sm outline-none resize-none" />
          <div className="flex justify-end mt-2">
            <button onClick={generate} disabled={loading || !topic.trim()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate slides
            </button>
          </div>
        </div>
        {slides && (
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Deck outline</div>
            <ReactMarkdown>{slides}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
