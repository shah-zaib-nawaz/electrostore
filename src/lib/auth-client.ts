'use client';

import { createAuthClient } from 'better-auth/react';
import { adminClient, twoFactorClient } from 'better-auth/client/plugins';
import { passkeyClient } from '@better-auth/passkey/client';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://ai-electrostore.vercel.app'),
  plugins: [
    adminClient(),
    twoFactorClient(),
    passkeyClient(),
  ],
});

export const { useSession, signIn, signOut, signUp } = authClient;
