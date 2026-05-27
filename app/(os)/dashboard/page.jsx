'use client';
import { useWorkspace } from '@/app/providers';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, FolderKanban, HandCoins, FileText, Bot, TrendingUp, Activity, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { workspaces, current, switchWorkspace } = useWorkspace();
  const [stats, setStats] = useState({ projects:0, grants:0, documents:0, opportunities:0 });
  const [activities, setActivities] = useState([]);

  useEffect(()=>{
    fetch('/api/stats').then(r=>r.json()).then(setStats).catch(()=>{});
    fetch('/api/activities?limit=8').then(r=>r.json()).then(d=>setActivities(d.activities||[])).catch(()=>{});
  }, []);

  return (
    <div className="aurora-bg min-h-full">
      <div className="relative z-10 px-6 md:px-10 pt-10 pb-20 max-w-7xl mx-auto">
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur-xl px-3 py-1 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-aurora-mint animate-pulse" />
            YouthAI OS · v1.0 · Azure-powered
          </div>
          <h1 className="mt-5 text-4xl md:text-6xl font-display font-bold tracking-tight text-balance">
            The AI Operating System for the <span className="gradient-text">Youth Ecosystem</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
            Run your NGO from a single workspace. Generate grants, design programs, summarize documents,
            match opportunities and orchestrate AI agents — all powered by Azure OpenAI.
          </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Active projects" value={stats.projects} icon={FolderKanban} accent="from-brand-500 to-aurora-cyan" />
          <StatCard label="Live grants" value={stats.grants} icon={HandCoins} accent="from-aurora-violet to-aurora-rose" />
          <StatCard label="Documents indexed" value={stats.documents} icon={FileText} accent="from-aurora-mint to-aurora-cyan" />
          <StatCard label="Opportunities matched" value={stats.opportunities} icon={Sparkles} accent="from-aurora-amber to-aurora-rose" />
        </div>

        <div className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Your workspaces</h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            {workspaces.map((w, idx) => (
              <motion.div key={w.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: idx*0.05}}>
                <Link href={`/workspace/${w.id}`} onClick={()=>switchWorkspace(w.id)} className="group relative block rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-5 hover:border-primary/40 hover:bg-card transition overflow-hidden">
                  <div className={cn('absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br opacity-40 blur-3xl group-hover:opacity-60 transition', w.color)} />
                  <div className="relative flex items-start gap-3">
                    <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br text-xl', w.color)}>
                      <span className="drop-shadow">{w.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-semibold text-lg">{w.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{w.tagline}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Quick actions</h3>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              <QuickAction wsId={current?.id} href="/chat" icon={Bot} title="Talk to AI" subtitle="Ask anything" />
              <QuickAction wsId={current?.id} href="/grants?new=1" icon={HandCoins} title="Draft a grant" subtitle="With Grant Agent" />
              <QuickAction wsId={current?.id} href="/presentations?new=1" icon={FileText} title="Make a deck" subtitle="Auto slides" />
              <QuickAction wsId={current?.id} href="/opportunities" icon={Sparkles} title="Find opportunities" subtitle="Erasmus+ & more" />
              <QuickAction wsId={current?.id} href="/documents" icon={FileText} title="Summarize a doc" subtitle="Upload PDF" />
              <QuickAction wsId={current?.id} href="/agents" icon={Bot} title="Launch agent" subtitle="5 specialists" />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Recent activity</h3>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <ul className="mt-3 space-y-3">
              {activities.length === 0 && <li className="text-xs text-muted-foreground">No activity yet.</li>}
              {activities.map((a)=>(
                <li key={a.id} className="flex items-start gap-2 text-sm">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="truncate">{a.text}</div>
                    <div className="text-[10px] text-muted-foreground">{a.workspaceId} · {new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-4 overflow-hidden">
      <div className={cn('absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br blur-3xl opacity-30', accent)} />
      <div className="relative flex items-center gap-3">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br', accent)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-2xl font-display font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ wsId, href, icon: Icon, title, subtitle }) {
  const path = wsId ? `/workspace/${wsId}${href}` : '/dashboard';
  return (
    <Link href={path} className="group rounded-xl border border-border bg-background/60 hover:bg-accent/40 hover:border-primary/40 px-3 py-3 transition flex items-start gap-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/20 to-aurora-violet/20 border border-primary/20 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        <div className="text-[10px] text-muted-foreground truncate">{subtitle}</div>
      </div>
    </Link>
  );
}
