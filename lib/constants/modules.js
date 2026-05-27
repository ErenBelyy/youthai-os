import { LayoutDashboard, MessageSquare, FolderKanban, FileText, Presentation, HandCoins, Sparkles, Bot, BookOpen, Users } from 'lucide-react';

export const MODULES = [
  { key:'dashboard', label:'Panou principal', icon: LayoutDashboard, href: (w) => `/workspace/${w}` },
  { key:'chat', label:'Chat AI', icon: MessageSquare, href: (w) => `/workspace/${w}/chat` },
  { key:'agents', label:'Agenți AI', icon: Bot, href: (w) => `/workspace/${w}/agents` },
  { key:'projects', label:'Proiecte', icon: FolderKanban, href: (w) => `/workspace/${w}/projects` },
  { key:'documents', label:'Documente', icon: FileText, href: (w) => `/workspace/${w}/documents` },
  { key:'knowledge', label:'Cunoștințe', icon: BookOpen, href: (w) => `/workspace/${w}/knowledge` },
  { key:'presentations', label:'Prezentări', icon: Presentation, href: (w) => `/workspace/${w}/presentations` },
  { key:'grants', label:'Granturi', icon: HandCoins, href: (w) => `/workspace/${w}/grants` },
  { key:'opportunities', label:'Oportunități', icon: Sparkles, href: (w) => `/workspace/${w}/opportunities` },
  { key:'members', label:'Membri', icon: Users, href: (w) => `/workspace/${w}/members` },
];
