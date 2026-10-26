import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { admin, twoFactor } from 'better-auth/plugins';
import { passkey } from '@better-auth/passkey';
import { stripe } from '@better-auth/stripe';
import Stripe from 'stripe';
import { env } from '@/lib/env';
import { MongoClient } from 'mongodb';
import { sendWelcomeEmail } from '@/lib/email';

// Initialize dedicated MongoDB client for Better Auth
const mongoClient = new MongoClient(env.MONGODB_URI);
const db = mongoClient.db();

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia' as any,
});

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.NEXT_PUBLIC_APP_URL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'customer',
        required: true,
      },
      phone: {
        type: 'string',
        required: false,
      },
      stripeCustomerId: {
        type: 'string',
        required: false,
      },
    },
  },
  plugins: [
    admin({
      defaultRole: 'customer',
      adminRoles: ['admin', 'superadmin'],
      roles: {
        customer: {},
        admin: {},
        superadmin: {},
      } as any,
    }),
    twoFactor({
      issuer: 'ElectroStore AI',
    }),
    passkey({
      rpName: 'ElectroStore AI',
      rpID: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: !env.STRIPE_SECRET_KEY.includes('mock'),
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            if (user?.email) {
              await sendWelcomeEmail({ to: user.email, name: user.name || 'Shopper' });
            }
          } catch (e) {
            console.error('[BetterAuth] Welcome email error:', e);
          }
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          // Hook to merge guest cart into user cart when session starts
          try {
            console.log(`[BetterAuth] Session created for user ${session.userId}. Cart merge hook triggered.`);
          } catch (e) {
            console.error('[BetterAuth] Cart merge error:', e);
          }
        },
      },
    },
  },
});
