'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OsShell from '@/components/os/os-shell';
import { Loader2 } from 'lucide-react';

export default function Layout({ children }) {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/signin');
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  return <OsShell>{children}</OsShell>;
}
