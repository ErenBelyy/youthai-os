'use client';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/page-header';
import { Bot, Sparkles, Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from '@/components/ui/markdown';

const AGENT_NAMES_RO = {
  grant: { name:'Agent Granturi', tagline:'Scrie propuneri de finanțare complete, bugete și logframe-uri.' },
  presentation: { name:'Agent Prezentări', tagline:'Generează prezentări editabile pentru evenimente și donatori.' },
  research: { name:'Agent Cercetare', tagline:'Sintetizează rapoarte din documente și din web.' },
  social: { name:'Agent Social Media', tagline:'Creează campanii pe LinkedIn, Instagram, X și TikTok.' },
  opportunity: { name:'Agent Oportunități', tagline:'Personalizează Erasmus+, granturi și schimburi de tineret.' },
};

export default function AgentsPage({ params }) {
  const wsId = params.id;
  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [task, setTask] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ fetch('/api/agents').then(r=>r.json()).then(d=>setAgents(d.agents||[])); }, []);

  const ro = (a) => AGENT_NAMES_RO[a.key] || { name: a.name, tagline: a.tagline };

  const run = async () => {
    if (!selected || !task.trim()) return;
    setLoading(true); setOutput('');
    try {
      const r = await fetch('/api/ai/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          messages: [{ role:'user', content: task }],
          workspaceId: wsId, agentKey: selected.key
        })
      });
      const d = await r.json();
      setOutput(d.content || `⚠️ ${d.error || 'Fără răspuns'}`);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader icon={Bot} title="Agenți AI" subtitle="Specialiști AI pentru granturi, prezentări, cercetare, social media și oportunități." />
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {!selected ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((a, i)=>{ const r = ro(a); return (
              <motion.button key={a.key} onClick={()=>setSelected(a)} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="text-left group relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-5 hover:border-primary/40 hover:bg-card transition overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-brand-500/30 to-aurora-violet/30 blur-3xl opacity-0 group-hover:opacity-100 transition" />
                <div className="relative">
                  <div className="text-3xl">{a.emoji}</div>
                  <div className="mt-3 font-display font-semibold text-lg">{r.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{r.tagline}</div>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs text-primary"><Sparkles className="w-3 h-3" /> Lansează agent</div>
                </div>
              </motion.button>
            ); })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{selected.emoji}</div>
              <div className="flex-1">
                <div className="font-display text-xl font-bold">{ro(selected).name}</div>
                <div className="text-sm text-muted-foreground">{ro(selected).tagline}</div>
              </div>
              <button onClick={()=>{setSelected(null); setOutput(''); setTask('');}} className="text-sm px-3 py-2 rounded-lg border border-border hover:bg-accent">Schimbă agent</button>
            </div>
            <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-4">
              <textarea value={task} onChange={e=>setTask(e.target.value)} rows={4} placeholder={`Descrie sarcina pentru ${ro(selected).name}…`} className="w-full bg-transparent text-sm outline-none resize-none" />
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-muted-foreground">Context: spațiu · documente · proiecte</div>
                <button onClick={run} disabled={loading || !task.trim()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Rulează agent
                </button>
              </div>
            </div>
            {output && (
              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Rezultat</div>
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
