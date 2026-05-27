'use client';
import { useWorkspace } from '@/app/providers';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { workspaces, switchWorkspace, refresh, loading } = useWorkspace();
  const { data: session } = useSession();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    const r = await fetch('/api/workspaces', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name }) });
    const d = await r.json();
    setBusy(false);
    if (r.ok && d.workspace?.id) {
      toast.success('Spațiu de lucru creat');
      await refresh();
      switchWorkspace(d.workspace.id);
      router.push(`/workspace/${d.workspace.id}`);
    } else toast.error(d.error || 'Eroare');
  };

  return (
    <div className="aurora-bg min-h-full">
      <div className="relative z-10 px-6 md:px-10 pt-10 pb-20 max-w-6xl mx-auto">
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur-xl px-3 py-1 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-aurora-mint animate-pulse" />
              Autentificat ca {session?.user?.email}
            </div>
            <button onClick={()=>signOut({ callbackUrl: '/signin' })} className="text-xs text-muted-foreground hover:text-foreground">Deconectare</button>
          </div>
          <h1 className="mt-5 text-4xl md:text-5xl font-display font-bold tracking-tight text-balance">
            Bine ai venit la <span className="gradient-text">YouthAI OS</span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground max-w-2xl">
            Spațiile de lucru sunt locul în care echipele colaborează la granturi, programe, documente și agenți AI. Creează-l pe primul sau deschide unul existent.
          </p>
        </motion.div>

        {loading ? (
          <div className="mt-10 flex items-center justify-center py-12 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Se încarcă spațiile…</div>
        ) : workspaces.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-card/40 backdrop-blur-xl p-10 text-center">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 via-aurora-violet to-aurora-cyan items-center justify-center shadow-xl shadow-brand-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold">Creează primul tău spațiu de lucru</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">Un spațiu de lucru este centrul de comandă al organizației tale — granturi, proiecte, agenți AI și membri trăiesc aici.</p>
            {!creating ? (
              <button onClick={()=>setCreating(true)} className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"><Plus className="w-4 h-4" /> Creează spațiu nou</button>
            ) : (
              <div className="mt-6 max-w-md mx-auto space-y-2">
                <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&create()} placeholder="Numele organizației sau al echipei" className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none" autoFocus />
                <div className="flex gap-2 justify-center">
                  <button onClick={()=>setCreating(false)} className="text-sm px-4 py-2.5 rounded-xl hover:bg-accent">Anulează</button>
                  <button onClick={create} disabled={busy} className="inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-primary text-primary-foreground">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Creează</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mt-8 flex items-center justify-between">
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Spațiile tale</h2>
              {!creating && (
                <button onClick={()=>setCreating(true)} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><Plus className="w-3.5 h-3.5" /> Spațiu nou</button>
              )}
            </div>
            {creating && (
              <div className="mt-3 rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-4 flex items-center gap-2">
                <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&create()} placeholder="Numele spațiului" className="flex-1 bg-secondary rounded-xl px-3 py-2 text-sm outline-none" autoFocus />
                <button onClick={create} disabled={busy} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl bg-primary text-primary-foreground">{busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Creează</button>
                <button onClick={()=>{setCreating(false); setName('');}} className="text-sm px-3 py-2 rounded-xl hover:bg-accent">Anulează</button>
              </div>
            )}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {workspaces.map((w, idx) => (
                <motion.div key={w.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: idx*0.05}}>
                  <Link href={`/workspace/${w.id}`} onClick={()=>switchWorkspace(w.id)} className="group relative block rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-5 hover:border-primary/40 hover:bg-card transition overflow-hidden">
                    <div className={cn('absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br opacity-40 blur-3xl group-hover:opacity-60 transition', w.color)} />
                    <div className="relative flex items-start gap-3">
                      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br text-xl', w.color)}>
                        <span className="drop-shadow">{w.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-semibold text-lg truncate">{w.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">{w.tagline || 'Spațiu de lucru'}</div>
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{w.role === 'owner' ? 'proprietar' : w.role === 'admin' ? 'admin' : w.role === 'editor' ? 'editor' : 'membru'}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
