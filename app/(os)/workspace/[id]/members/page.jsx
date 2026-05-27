'use client';
import PageHeader from '@/components/ui/page-header';
import { Users } from 'lucide-react';
import { useWorkspace } from '@/app/providers';

const seedMembers = [
  { name:'Alex Bivol', role:'Owner', email:'alex@youthai.os' },
  { name:'Maria Dragu', role:'Admin', email:'maria@youthai.os' },
  { name:'Ion Popescu', role:'Editor', email:'ion@youthai.os' },
  { name:'Diana Ursu', role:'Viewer', email:'diana@youthai.os' },
];

export default function MembersPage() {
  const { current } = useWorkspace();
  return (
    <div>
      <PageHeader icon={Users} title="Members" subtitle={`Manage roles and permissions for ${current?.name || 'this workspace'}.`} />
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl divide-y divide-border">
          {seedMembers.map((m, i)=>(
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-aurora-violet flex items-center justify-center text-white text-sm font-medium">{m.name.split(' ').map(s=>s[0]).join('')}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.email}</div>
              </div>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
