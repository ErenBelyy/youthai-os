'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MODULES } from '@/lib/constants/modules';
import { useWorkspace } from '@/app/providers';
import WorkspaceSwitcher from './workspace-switcher';
import { Sparkles, Settings, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { currentId } = useWorkspace();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const wsId = currentId || 'jef-moldova';

  return (
    <aside className={cn(
      'relative z-30 h-screen sticky top-0 shrink-0 border-r border-sidebar-border bg-sidebar/80 backdrop-blur-2xl flex flex-col transition-[width] duration-300',
      collapsed ? 'w-[72px]' : 'w-[260px]'
    )}>
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 via-aurora-violet to-aurora-cyan flex items-center justify-center shadow-lg shadow-brand-500/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[15px] leading-tight">YouthAI <span className="gradient-text">OS</span></div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Civic Operating System</div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="p-3 border-b border-sidebar-border">
          <WorkspaceSwitcher />
        </div>
      )}

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-0.5">
        {MODULES.map((m) => {
          const href = m.href(wsId);
          const active = pathname === href || (pathname.startsWith(href) && href !== `/workspace/${wsId}`);
          const Icon = m.icon;
          return (
            <Link key={m.key} href={href} className={cn(
              'group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all',
              active ? 'bg-sidebar-accent text-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
            )}>
              {active && (
                <motion.span layoutId="sidebar-active" className="absolute inset-y-1 left-0 w-0.5 rounded-r-full bg-gradient-to-b from-brand-500 via-aurora-violet to-aurora-cyan" />
              )}
              <Icon className={cn('w-4 h-4 shrink-0', active && 'text-primary')} />
              {!collapsed && <span className="truncate">{m.label}</span>}
              {!collapsed && m.key === 'chat' && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">AI</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <Link href="/settings" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        )}
        <button onClick={()=>setCollapsed(c=>!c)} className="ml-auto p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition">
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
