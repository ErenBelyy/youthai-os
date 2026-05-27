'use client';
import Sidebar from './sidebar';
import Topbar from './topbar';
import FloatingAI from './floating-ai';

export default function OsShell({ children }) {
  return (
    <div className="flex min-h-screen bg-background relative">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-[0.03] dark:opacity-[0.06]" />
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 min-w-0 relative">{children}</main>
      </div>
      <FloatingAI />
    </div>
  );
}
