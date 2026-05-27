'use client';
import { Search, Bell, Sun, Moon, Command } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import CommandPalette from './command-palette';
import { useWorkspace } from '@/app/providers';

export default function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const { current } = useWorkspace();

  useEffect(()=>{ setMounted(true); }, []);

  useEffect(()=>{
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(o=>!o); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/60 backdrop-blur-xl flex items-center px-6 gap-4">
      <div className="flex-1 flex items-center gap-3">
        <button onClick={()=>setOpen(true)} className="group flex items-center gap-2 w-full max-w-[480px] rounded-lg border border-border bg-card/50 hover:bg-card px-3 py-2 text-sm text-muted-foreground transition">
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Search YouthAI OS…</span>
          <kbd className="ml-2 hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-muted/40">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-aurora-rose" />
        </button>
        {mounted && (
          <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition">
            {theme==='dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-aurora-violet flex items-center justify-center text-white text-xs font-medium">YA</div>
      </div>
      <CommandPalette open={open} setOpen={setOpen} />
    </header>
  );
}
