'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/page-header';
import { LayoutDashboard, ArrowRight, FolderKanban, HandCoins, FileText, Sparkles, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WorkspaceHome({ params }) {
  const wsId = params.id;
  const [ws, setWs] = useState(null);
  const [stats, setStats] = useState({ projects:0, grants:0, documents:0, opportunities:0 });
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(()=>{
    fetch(`/api/workspaces/${wsId}`).then(r=>r.json()).then(d=>setWs(d.workspace));
    fetch(`/api/stats?workspaceId=${wsId}`).then(r=>r.json()).then(setStats);
    fetch(`/api/activities?workspaceId=${wsId}&limit=10`).then(r=>r.json()).then(d=>setActivities(d.activities||[]));
    fetch(`/api/projects?workspaceId=${wsId}`).then(r=>r.json()).then(d=>setProjects(d.projects||[]));
  }, [wsId]);

  return (
    <div>
      <PageHeader
        icon={LayoutDashboard}
        title={ws ? `${ws.emoji} ${ws.name}` : 'Spațiu de lucru'}
        subtitle={ws?.tagline || 'Se încarcă…'}
        actions={
          <Link href={`/workspace/${wsId}/chat`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90">
            <MessageSquare className="w-4 h-4" /> Deschide Chat AI
          </Link>
        }
      />
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Proiecte" value={stats.projects} icon={FolderKanban} />
          <Stat label="Granturi" value={stats.grants} icon={HandCoins} />
          <Stat label="Documente" value={stats.documents} icon={FileText} />
          <Stat label="Oportunități" value={stats.opportunities} icon={Sparkles} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Proiecte active</h3>
              <Link href={`/workspace/${wsId}/projects`} className="text-xs text-primary inline-flex items-center gap-1 hover:underline">Toate proiectele <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="mt-3 space-y-2">
              {projects.length === 0 && <p className="text-sm text-muted-foreground">Niciun proiect încă.</p>}
              {projects.map(p => (
                <motion.div key={p.id} whileHover={{ x: 2 }} className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500/20 to-aurora-violet/20 border border-primary/20 flex items-center justify-center">
                    <FolderKanban className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{p.description}</div>
                  </div>
                  <div className="w-28 text-right">
                    <div className="text-[10px] text-muted-foreground">{p.status}</div>
                    <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-500 to-aurora-cyan" style={{ width: `${p.progress||0}%` }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-5">
            <h3 className="font-display font-semibold">Activitate recentă</h3>
            <ul className="mt-3 space-y-3">
              {activities.length === 0 && <li className="text-xs text-muted-foreground">Fără activitate încă.</li>}
              {activities.map(a => (
                <li key={a.id} className="flex items-start gap-2 text-sm">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="truncate">{a.text}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(a.createdAt).toLocaleString('ro-RO')}</div>
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

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-xl font-display font-bold">{value}</div>
      </div>
    </div>
  );
}
