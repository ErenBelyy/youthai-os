'use client';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
});

const WorkspaceContext = createContext(null);
export const useWorkspace = () => useContext(WorkspaceContext);

function WorkspaceProvider({ children }) {
  const { data: session, status } = useSession();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (status !== 'authenticated') { setWorkspaces([]); setLoading(false); return; }
    const r = await fetch('/api/workspaces');
    const d = await r.json();
    const list = d.workspaces || [];
    setWorkspaces(list);
    const saved = typeof window !== 'undefined' ? localStorage.getItem('ws_current') : null;
    const def = list.find(w => w.id === saved) || list[0];
    if (def) setCurrentId(def.id); else setCurrentId(null);
    setLoading(false);
  };

  useEffect(() => {
    if (status === 'loading') return;
    setLoading(true);
    refresh();
  }, [status]);

  const switchWorkspace = (id) => {
    setCurrentId(id);
    if (typeof window !== 'undefined') localStorage.setItem('ws_current', id);
  };

  const current = workspaces.find(w => w.id === currentId) || null;

  return (
    <WorkspaceContext.Provider value={{ workspaces, current, currentId, switchWorkspace, loading, refresh, session, status }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <QueryClientProvider client={queryClient}>
          <WorkspaceProvider>
            {children}
            <Toaster theme="system" richColors closeButton position="top-right" />
          </WorkspaceProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
