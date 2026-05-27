import { LayoutDashboard, MessageSquare, FolderKanban, FileText, Presentation, HandCoins, Sparkles, Bot, BookOpen, Users, Bell } from 'lucide-react';

export const MODULES = [
  { key:'dashboard', label:'Dashboard', icon: LayoutDashboard, href: (w) => `/workspace/${w}` },
  { key:'chat', label:'AI Chat', icon: MessageSquare, href: (w) => `/workspace/${w}/chat` },
  { key:'agents', label:'Agents', icon: Bot, href: (w) => `/workspace/${w}/agents` },
  { key:'projects', label:'Projects', icon: FolderKanban, href: (w) => `/workspace/${w}/projects` },
  { key:'documents', label:'Documents', icon: FileText, href: (w) => `/workspace/${w}/documents` },
  { key:'knowledge', label:'Knowledge', icon: BookOpen, href: (w) => `/workspace/${w}/knowledge` },
  { key:'presentations', label:'Presentations', icon: Presentation, href: (w) => `/workspace/${w}/presentations` },
  { key:'grants', label:'Grants', icon: HandCoins, href: (w) => `/workspace/${w}/grants` },
  { key:'opportunities', label:'Opportunities', icon: Sparkles, href: (w) => `/workspace/${w}/opportunities` },
  { key:'members', label:'Members', icon: Users, href: (w) => `/workspace/${w}/members` },
];
