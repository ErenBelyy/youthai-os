'use client';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/page-header';
import { Sparkles, Filter } from 'lucide-react';

export default function OpportunitiesPage({ params }) {
  const [opps, setOpps] = useState([]);
  const [filter, setFilter] = useState('all');
  useEffect(()=>{ fetch('/api/opportunities').then(r=>r.json()).then(d=>setOpps(d.opportunities||[])); }, []);
  const cats = ['all', 'Training', 'Grant', 'Hackathon', 'Volunteering', 'Youth Exchange'];
  const list = filter === 'all' ? opps : opps.filter(o => o.category === filter);

  return (
    <div>
      <PageHeader icon={Sparkles} title="Opportunities" subtitle="Erasmus+, EYF, hackathons, exchanges — personalized for your workspace." gradient="from-aurora-amber to-aurora-rose" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {cats.map(c => (
            <button key={c} onClick={()=>setFilter(c)} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition ${filter===c?'bg-primary text-primary-foreground border-primary':'border-border hover:bg-accent'}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map(o => (
            <div key={o.id} className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-4 hover:border-primary/40 transition">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-aurora-mint/10 text-aurora-mint border border-aurora-mint/20">{o.category}</span>
                <span className="inline-flex items-center gap-1 text-xs text-primary"><Sparkles className="w-3 h-3" />{o.match}% match</span>
              </div>
              <div className="mt-2 font-display font-semibold text-[15px] leading-snug">{o.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{o.org} · {o.country}</div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Deadline: <span className="text-foreground">{o.deadline}</span></span>
                <button className="text-primary hover:underline">Apply →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
