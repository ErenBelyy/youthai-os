import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { repo, uuid } from '/src/lib/db/client';

async function acceptPendingInvites(user) {
  const invitesRepo = repo('invites');
  const membersRepo = repo('workspace_members');
  const actRepo = repo('activities');
  const pending = await invitesRepo.list({ email: user.email.toLowerCase(), status: 'pending' });
  for (const inv of pending) {
    await membersRepo.create({ workspaceId: inv.workspaceId, userId: user.id, email: user.email.toLowerCase(), role: inv.role || 'member' });
    await invitesRepo.update(inv.id, { status: 'accepted', acceptedAt: new Date().toISOString(), acceptedBy: user.id });
    await actRepo.create({ workspaceId: inv.workspaceId, type: 'member.joined', text: `${user.name || user.email} joined the workspace`, actor: 'user' });
  }
}

export const authOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'youthai-dev-secret-change-me',
  pages: { signIn: '/signin' },
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();
        const usersRepo = repo('users');
        const users = await usersRepo.list({ email });
        const user = users[0];
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
        })]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      const email = user.email.toLowerCase();
      const usersRepo = repo('users');
      const existing = (await usersRepo.list({ email }))[0];
      if (!existing) {
        const created = await usersRepo.create({
          id: uuid(),
          email,
          name: user.name || email.split('@')[0],
          image: user.image || null,
          provider: account?.provider || 'credentials',
        });
        user.id = created.id;
        await acceptPendingInvites(created);
      } else {
        user.id = existing.id;
        await acceptPendingInvites(existing);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
  },
};

import { getServerSession } from 'next-auth';
export async function auth() { return getServerSession(authOptions); }

const handler = NextAuth(authOptions);
export { handler as nextAuthHandler };
