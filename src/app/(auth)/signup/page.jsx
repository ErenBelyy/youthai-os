'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    const r = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password }) });
    const d = await r.json();
    if (!r.ok) { setErr(d.error || 'Eroare la înregistrare'); setLoading(false); return; }
    const s = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (s?.error) setErr('Cont creat, dar autentificarea a eșuat.');
    else { toast.success('Cont creat cu succes'); router.push('/dashboard'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 aurora-bg relative">
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 via-aurora-violet to-aurora-cyan items-center justify-center shadow-xl shadow-brand-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold">Creează cont <span className="gradient-text">YouthAI OS</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">Spațiile de lucru se creează după autentificare</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-xl p-6 shadow-xl">
          <button onClick={()=>signIn('google', { callbackUrl: '/dashboard' })} className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background hover:bg-accent px-4 py-2.5 text-sm font-medium transition">
            <svg className="w-4 h-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 4.7 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.6 15 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.7 29.5 4 24 4 16.3 4 9.7 8.4 6.3 14.1z"/><path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.3 35 26.8 36 24 36c-5.3 0-9.7-2.6-11.3-7l-6.6 5.1C9.5 39.5 16.1 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l6.3 5.3c-.4.4 6.4-4.7 6.4-14.2 0-1.2-.1-2.3-.4-3.5z"/></svg>
            Continuă cu Google
          </button>
          <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> sau <div className="flex-1 h-px bg-border" />
          </div>
          <form onSubmit={handle} className="space-y-3">
            <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary">
              <User className="w-4 h-4 text-muted-foreground" />
              <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Numele tău" className="flex-1 bg-transparent text-sm outline-none" />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@exemplu.com" className="flex-1 bg-transparent text-sm outline-none" />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <input type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Parolă (min. 6 caractere)" className="flex-1 bg-transparent text-sm outline-none" />
            </label>
            {err && <div className="flex items-center gap-2 text-xs text-destructive"><AlertCircle className="w-3.5 h-3.5" /> {err}</div>}
            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Creează cont
            </button>
          </form>
          <div className="mt-5 text-center text-xs text-muted-foreground">
            Ai deja cont? <Link href="/signin" className="text-primary hover:underline">Autentifică-te</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
