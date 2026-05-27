'use client';
import { Search, Bell, Sun, Moon, Command, LogOut, User as UserIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import CommandPalette from './command-palette';
import { useWorkspace } from '@/app/providers';
import { useSession, signOut } from 'next-auth/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(()=>{ setMounted(true); }, []);

  useEffect(()=>{
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(o=>!o); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const initials = (session?.user?.name || session?.user?.email || '?').split(/[\s@.]+/).filter(Boolean).slice(0,2).map(s=>s[0].toUpperCase()).join('');

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/60 backdrop-blur-xl flex items-center px-6 gap-4">
      <div className="flex-1 flex items-center gap-3">
        <button onClick={()=>setOpen(true)} className="group flex items-center gap-2 w-full max-w-[480px] rounded-lg border border-border bg-card/50 hover:bg-card px-3 py-2 text-sm text-muted-foreground transition">
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Caută în YouthAI OS…</span>
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
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-aurora-violet flex items-center justify-center text-white text-xs font-medium">{initials || 'YA'}</button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-1.5">
            <div className="px-2 py-1.5">
              <div className="text-sm font-medium truncate">{session?.user?.name || 'Utilizator'}</div>
              <div className="text-[11px] text-muted-foreground truncate">{session?.user?.email}</div>
            </div>
            <div className="border-t border-border my-1" />
            <button onClick={()=>signOut({ callbackUrl: '/signin' })} className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent text-muted-foreground hover:text-foreground">
              <LogOut className="w-3.5 h-3.5" /> Deconectare
            </button>
          </PopoverContent>
        </Popover>
      </div>
      <CommandPalette open={open} setOpen={setOpen} />
    </header>
  );
}
