'use client';
import { useEffect, useRef, useState } from 'react';
import PageHeader from '@/components/ui/page-header';
import ReactMarkdown from '@/components/ui/markdown';
import { MessageSquare, Send, Sparkles, Loader2, Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorkspace } from '@/app/providers';

const SUGGESTIONS = [
  'Draft an Erasmus+ KA2 proposal on digital civic skills',
  'Summarize key trends in Moldovan youth participation',
  'Create a 10-slide deck pitching our climate program',
  'Find 5 Erasmus+ exchanges for 18-25y in EU this fall',
];

export default function ChatPage({ params }) {
  const wsId = params.id;
  const { current } = useWorkspace();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentKey, setAgentKey] = useState(null);
  const [agents, setAgents] = useState([]);
  const scrollRef = useRef(null);

  useEffect(()=>{ fetch('/api/agents').then(r=>r.json()).then(d=>setAgents(d.agents||[])); }, []);
  useEffect(()=>{ scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior:'smooth' }); }, [messages, loading]);

  const send = async (text) => {
    const t = text ?? input;
    if (!t.trim() || loading) return;
    const userMsg = { role:'user', content: t };
    const next = [...messages, userMsg];
    setMessages(next); setInput(''); setLoading(true);
    try {
      const r = await fetch('/api/ai/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: next, workspaceId: wsId, agentKey })
      });
      const d = await r.json();
      setMessages(m => [...m, { role:'assistant', content: d.content || `⚠️ ${d.error || 'No response'}` }]);
    } catch (e) {
      setMessages(m => [...m, { role:'assistant', content:'Network error.' }]);
    } finally { setLoading(false); }
  };

  const currentAgent = agents.find(a => a.key === agentKey);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <PageHeader
        icon={MessageSquare}
        title={currentAgent ? `${currentAgent.emoji} ${currentAgent.name}` : 'AI Chat'}
        subtitle={currentAgent?.tagline || `Grounded in the ${current?.name || 'workspace'} context. Streaming with Azure OpenAI.`}
        actions={
          <select value={agentKey || ''} onChange={e=>setAgentKey(e.target.value || null)} className="text-sm rounded-lg border border-border bg-card px-3 py-2">
            <option value="">General assistant</option>
            {agents.map(a => <option key={a.key} value={a.key}>{a.emoji} {a.name}</option>)}
          </select>
        }
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {messages.length === 0 && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="text-center py-10">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 via-aurora-violet to-aurora-cyan items-center justify-center shadow-xl shadow-brand-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="mt-4 text-2xl font-display font-bold">How can I help today?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Pick a starter or ask anything.</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUGGESTIONS.map((s, i)=>(
                  <button key={i} onClick={()=>send(s)} className="text-left rounded-xl border border-border bg-card/60 hover:bg-card hover:border-primary/30 transition p-3 text-sm">
                    <Sparkles className="w-3.5 h-3.5 text-primary inline mr-2" />
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {messages.map((m, i)=>(
            <motion.div key={i} initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role==='user'?'bg-secondary':'bg-gradient-to-br from-brand-500 to-aurora-violet text-white'}`}>
                {m.role==='user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-muted-foreground mb-1">{m.role==='user' ? 'You' : (currentAgent?.name || 'YouthAI')}</div>
                <div className={`rounded-2xl px-4 py-3 text-sm ${m.role==='user' ? 'bg-secondary inline-block' : 'bg-card border border-border'}`}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Thinking…</div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur-xl p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-2">
            <textarea
              value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if (e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } }}
              rows={1} placeholder="Message YouthAI…"
              className="flex-1 bg-transparent text-sm outline-none px-2 py-2 resize-none max-h-[180px]"
            />
            <button onClick={()=>send()} disabled={loading} className="shrink-0 p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-center text-[10px] text-muted-foreground">YouthAI OS · Azure OpenAI · contextualized to {current?.name || 'your workspace'}</div>
        </div>
      </div>
    </div>
  );
}
