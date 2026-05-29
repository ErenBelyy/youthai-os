'use client';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWorkspace } from '@/app/providers';
import ReactMarkdown from '@/components/ui/markdown';

export default function FloatingAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role:'assistant', content:'Salut! Sunt asistentul YouthAI OS. Întreabă-mă orice despre granturi, proiecte sau oportunități pentru spațiul tău de lucru.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const { current } = useWorkspace();

  useEffect(()=>{ scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior:'smooth' }); }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role:'user', content: input };
    setMessages(m => [...m, userMsg]);
    setInput(''); setLoading(true);
    try {
      const r = await fetch('/api/ai/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: [...messages, userMsg], workspaceId: current?.id })
      });
      const d = await r.json();
      setMessages(m => [...m, { role:'assistant', content: d.content || d.error || 'Fără răspuns.' }]);
    } catch (e) {
      setMessages(m => [...m, { role:'assistant', content: 'Eroare la conectarea cu AI. Configurează Azure OpenAI în .env.' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <motion.button
        onClick={()=>setOpen(o=>!o)}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 via-aurora-violet to-aurora-cyan shadow-xl shadow-brand-500/40 flex items-center justify-center text-white"
      >
        {open ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y:20, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20, scale:0.95 }}
            className="fixed bottom-24 right-6 z-40 w-[400px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-8rem)] rounded-2xl glass-strong shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 h-12 border-b border-border">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-aurora-violet flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Asistent YouthAI</div>
                <div className="text-[10px] text-muted-foreground">{current?.name || 'Global'}</div>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.map((m,i)=>(
                <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${m.role==='user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Se gândește…</div>}
            </div>
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-2 py-1.5">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && send()} placeholder="Întreabă orice…" className="flex-1 bg-transparent text-sm outline-none" />
                <button onClick={send} disabled={loading} className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
