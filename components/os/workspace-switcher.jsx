'use client';
import { useWorkspace } from '@/app/providers';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function WorkspaceSwitcher() {
  const { workspaces, current, switchWorkspace, refresh } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const router = useRouter();

  const create = async () => {
    if (!name.trim()) return;
    const r = await fetch('/api/workspaces', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name }) });
    const d = await r.json();
    await refresh();
    setName(''); setCreating(false); setOpen(false);
    if (d.workspace?.id) { switchWorkspace(d.workspace.id); router.push(`/workspace/${d.workspace.id}`); }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-full flex items-center gap-2 rounded-lg border border-sidebar-border bg-card/40 hover:bg-card/80 px-2.5 py-2 text-left transition">
          <div className={cn('w-7 h-7 rounded-md flex items-center justify-center text-sm bg-gradient-to-br', current?.color || 'from-brand-500 to-aurora-cyan')}>
            <span className="text-white drop-shadow">{current?.emoji || '\u2728'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{current?.name || 'Select workspace'}</div>
            <div className="text-[10px] text-muted-foreground truncate">{current?.tagline || 'No workspace selected'}</div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-1.5" align="start">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5">Workspaces</div>
        <div className="space-y-0.5 max-h-[260px] overflow-y-auto scrollbar-thin">
          {workspaces.map(w => (
            <button key={w.id} onClick={()=>{ switchWorkspace(w.id); setOpen(false); router.push(`/workspace/${w.id}`); }} className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition text-left">
              <div className={cn('w-7 h-7 rounded-md flex items-center justify-center text-sm bg-gradient-to-br', w.color)}>
                <span className="text-white">{w.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{w.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{w.tagline}</div>
              </div>
              {current?.id === w.id && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          ))}
        </div>
        <div className="border-t border-border mt-1 pt-1">
          {creating ? (
            <div className="p-1.5 space-y-1.5">
              <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter' && create()} placeholder="Organization name…" className="w-full bg-secondary px-2 py-1.5 rounded text-sm outline-none focus:ring-2 focus:ring-primary" autoFocus />
              <div className="flex gap-1.5">
                <button onClick={create} className="flex-1 text-xs bg-primary text-primary-foreground rounded px-2 py-1.5">Create</button>
                <button onClick={()=>setCreating(false)} className="text-xs rounded px-2 py-1.5 hover:bg-accent">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setCreating(true)} className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent text-sm text-muted-foreground">
              <Plus className="w-3.5 h-3.5" /> New workspace
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
