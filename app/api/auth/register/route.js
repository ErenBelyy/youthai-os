import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { repo, uuid } from '@/lib/db/client';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    if (!email || !password || password.length < 6) return NextResponse.json({ error: 'Email and password (min 6 chars) required' }, { status: 400 });
    const usersRepo = repo('users');
    const lower = email.toLowerCase().trim();
    const existing = (await usersRepo.list({ email: lower }))[0];
    if (existing && existing.passwordHash) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 10);
    let user;
    if (existing) user = await usersRepo.update(existing.id, { name: name || existing.name, passwordHash });
    else user = await usersRepo.create({ id: uuid(), email: lower, name: name || lower.split('@')[0], passwordHash, provider: 'credentials' });
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Registration failed' }, { status: 500 });
  }
}
