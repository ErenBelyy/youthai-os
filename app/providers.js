'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { createContext, useContext, useEffect, useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
});

const WorkspaceContext = createContext(null);
export const useWorkspace = () => useContext(WorkspaceContext);

function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/workspaces').then(r => r.json()).then(data => {
      setWorkspaces(data.workspaces || []);
      const saved = typeof window !== 'undefined' ? localStorage.getItem('ws_current') : null;
      const def = (data.workspaces || []).find(w => w.id === saved) || (data.workspaces || [])[0];
      if (def) setCurrentId(def.id);
      setLoading(false);
    }).catch(()=>setLoading(false));
  }, []);

  const switchWorkspace = (id) => {
    setCurrentId(id);
    if (typeof window !== 'undefined') localStorage.setItem('ws_current', id);
  };

  const current = workspaces.find(w => w.id === currentId) || null;
  const refresh = async () => {
    const r = await fetch('/api/workspaces'); const d = await r.json();
    setWorkspaces(d.workspaces || []);
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, current, currentId, switchWorkspace, loading, refresh }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <WorkspaceProvider>
          {children}
          <Toaster theme="system" richColors closeButton position="top-right" />
        </WorkspaceProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
