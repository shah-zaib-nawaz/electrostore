import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export type UserRole = 'customer' | 'admin' | 'superadmin';

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string;
  emailVerified: boolean;
  stripeCustomerId?: string;
}

export interface AuthSession {
  user: AuthSessionUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return null;
    }

    return session as unknown as AuthSession;
  } catch (error) {
    console.error('Failed to get auth session:', error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }

  return session;
}

export async function requireAdmin(): Promise<AuthSession> {
  const session = await requireAuth();

  if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
    throw new Error('FORBIDDEN: Admin privileges required');
  }

  return session;
}
