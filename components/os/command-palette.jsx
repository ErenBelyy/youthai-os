'use client';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from '@/components/ui/command';
import { MODULES } from '@/lib/constants/modules';
import { useWorkspace } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { Sparkles, Home, MessageSquare, FileText, HandCoins } from 'lucide-react';

export default function CommandPalette({ open, setOpen }) {
  const { workspaces, switchWorkspace, currentId } = useWorkspace();
  const router = useRouter();
  const wsId = currentId;

  const go = (path) => { router.push(path); setOpen(false); };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Întreabă AI, navighează sau schimbă spațiul…" />
      <CommandList>
        <CommandEmpty>Niciun rezultat.</CommandEmpty>
        {wsId && (
          <>
            <CommandGroup heading="Acțiuni AI">
              <CommandItem onSelect={()=>go(`/workspace/${wsId}/chat`)}>
                <MessageSquare className="mr-2 w-4 h-4" /> Deschide Chat AI
              </CommandItem>
              <CommandItem onSelect={()=>go(`/workspace/${wsId}/agents`)}>
                <Sparkles className="mr-2 w-4 h-4" /> Lansează un agent AI
              </CommandItem>
              <CommandItem onSelect={()=>go(`/workspace/${wsId}/grants`)}>
                <HandCoins className="mr-2 w-4 h-4" /> Scrie o propunere de grant
              </CommandItem>
              <CommandItem onSelect={()=>go(`/workspace/${wsId}/documents`)}>
                <FileText className="mr-2 w-4 h-4" /> Încarcă și rezumă un document
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Module">
              {MODULES.map(m => (
                <CommandItem key={m.key} onSelect={()=>go(m.href(wsId))}>
                  <m.icon className="mr-2 w-4 h-4" /> {m.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        <CommandGroup heading="Spații de lucru">
          {workspaces.map(w => (
            <CommandItem key={w.id} onSelect={()=>{ switchWorkspace(w.id); go(`/workspace/${w.id}`); }}>
              <span className="mr-2">{w.emoji}</span> {w.name}
            </CommandItem>
          ))}
          <CommandItem onSelect={()=>go('/dashboard')}>
            <Home className="mr-2 w-4 h-4" /> Înapoi la panoul principal
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
