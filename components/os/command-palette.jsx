'use client';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from '@/components/ui/command';
import { MODULES } from '@/lib/constants/modules';
import { useWorkspace } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus, MessageSquare, FileText, HandCoins } from 'lucide-react';

export default function CommandPalette({ open, setOpen }) {
  const { workspaces, current, switchWorkspace, currentId } = useWorkspace();
  const router = useRouter();
  const wsId = currentId || 'jef-moldova';

  const go = (path) => { router.push(path); setOpen(false); };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Ask AI, jump to a module, switch workspace…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="AI Actions">
          <CommandItem onSelect={()=>go(`/workspace/${wsId}/chat`)}>
            <MessageSquare className="mr-2 w-4 h-4" /> Open AI Chat
          </CommandItem>
          <CommandItem onSelect={()=>go(`/workspace/${wsId}/agents`)}>
            <Sparkles className="mr-2 w-4 h-4" /> Launch an AI Agent
          </CommandItem>
          <CommandItem onSelect={()=>go(`/workspace/${wsId}/grants?new=1`)}>
            <HandCoins className="mr-2 w-4 h-4" /> Draft a new grant proposal
          </CommandItem>
          <CommandItem onSelect={()=>go(`/workspace/${wsId}/documents`)}>
            <FileText className="mr-2 w-4 h-4" /> Upload & summarize a document
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Modules">
          {MODULES.map(m => (
            <CommandItem key={m.key} onSelect={()=>go(m.href(wsId))}>
              <m.icon className="mr-2 w-4 h-4" /> {m.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Workspaces">
          {workspaces.map(w => (
            <CommandItem key={w.id} onSelect={()=>{ switchWorkspace(w.id); go(`/workspace/${w.id}`); }}>
              <span className="mr-2">{w.emoji}</span> {w.name}
            </CommandItem>
          ))}
          <CommandItem onSelect={()=>go('/dashboard')}>
            <Plus className="mr-2 w-4 h-4" /> Back to OS Dashboard
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
