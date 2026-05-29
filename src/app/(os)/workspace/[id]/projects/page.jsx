'use client';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/page-header';
import { FolderKanban, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_RO = { planning:'planificare', active:'activ', drafting:'în schiță', done:'finalizat' };

export default function ProjectsPage({ params }) {
  const wsId = params.id;
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name:'', description:'' });
  const [loading, setLoading] = useState(false);

  const load = ()=> fetch(`/api/projects?workspaceId=${wsId}`).then(r=>r.json()).then(d=>setProjects(d.projects||[]));
  useEffect(()=>{ load(); }, [wsId]);

  const create = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    const r = await fetch('/api/projects', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, workspaceId: wsId, status:'planning', progress:0, members:1 }) });
    setLoading(false);
    if (r.ok) { toast.success('Proiect creat'); setOpen(false); setForm({ name:'', description:'' }); load(); }
  };

  return (
    <div>
      <PageHeader icon={FolderKanban} title="Proiecte" subtitle="Programe, inițiative și campanii."
        actions={<button onClick={()=>setOpen(o=>!o)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm"><Plus className="w-4 h-4" /> Proiect nou</button>} />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-4">
        {open && (
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-4 space-y-2">
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Numele proiectului" className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none" />
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Descriere" rows={2} className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={()=>setOpen(false)} className="text-sm px-3 py-2 rounded-lg hover:bg-accent">Anulează</button>
              <button onClick={create} disabled={loading} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-primary text-primary-foreground">{loading && <Loader2 className="w-3 h-3 animate-spin" />} Creează</button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.map(p => (
            <div key={p.id} className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.description}</div>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{STATUS_RO[p.status] || p.status}</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-aurora-cyan" style={{width:`${p.progress||0}%`}} /></div>
              <div className="mt-2 text-[11px] text-muted-foreground flex justify-between"><span>{p.progress||0}% finalizat</span><span>{p.members||0} membri</span></div>
            </div>
          ))}
          {projects.length === 0 && <div className="text-sm text-muted-foreground">Niciun proiect încă. Creează primul proiect.</div>}
        </div>
      </div>
    </div>
  );
}
