import { spawn } from 'child_process';

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey || apiKey.includes('mock')) {
  console.error('❌ Valid STRIPE_SECRET_KEY not found in .env.local');
  process.exit(1);
}

console.log('⚡ Starting Stripe webhook listener for localhost:3000/api/webhooks/stripe...');

const child = spawn(
  'stripe',
  [
    'listen',
    '--api-key',
    apiKey,
    '--forward-to',
    'localhost:3000/api/webhooks/stripe',
    '--events',
    'checkout.session.completed,checkout.session.expired',
  ],
  { stdio: 'inherit', shell: true }
);

child.on('exit', (code) => {
  console.log(`Stripe CLI listener exited with code ${code}`);
});
