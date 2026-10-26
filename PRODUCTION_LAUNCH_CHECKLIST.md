# 🚀 ElectroStore AI — Production Launch Checklist (Late-2026 Spec)

## 📌 Executive Architecture Summary
- **Framework & Runtime**: Next.js 16.4.3 LTS (Turbopack, App Router, React 19 Compiler active, top-level `reactCompiler: true`).
- **Network Boundary Security**: Strictly NO `middleware.ts`. All route protection enforced via `src/proxy.ts` exporting `proxy()`.
- **Validation**: Zod 4.6.7 Ahead-of-Time (AOT) compiled schemas (`z.compile({ jitless: true })`) on high-throughput ingest and Server Actions.
- **Database & Search**: Mongoose 9.11.2 with MongoDB 8.0+/9.0 native `$rankFusion` combining `$vectorSearch` (3072 dims, weight: 0.7) and `$search` (weight: 0.3).
- **Authentication**: Better Auth 1.7.7+ with MongoDB adapter, Passkeys (WebAuthn), 2FA, Stripe customer auto-sync, and native `node:crypto` scrypt.
- **AI Agentic Layer**: Vercel AI SDK v7.0.138+ with OpenAI GPT-5.4 (`reasoningEffort: 'low' | 'medium'`), GPT-5.4-nano intent routing, and approved tool gates.
- **Payments & Fulfillment**: Stripe Embedded Checkout (`ui_mode: 'embedded'`) with Mongoose ACID transactional inventory reservations and stock rollback on webhook expiration.
- **Observability**: OpenTelemetry standard spans wired through `src/instrumentation.ts`.

---

## 🔒 1. Security & Authentication Audit
- [x] **Zero Middleware Legacy**: Verified no `middleware.ts` exists. Protected routes (`/account/*`, `/checkout`, `/admin/*`) routed via `src/proxy.ts`.
- [x] **FIDO2 / WebAuthn Passkeys**: Configured in Better Auth client & server.
- [x] **Two-Factor Authentication (2FA)**: TOTP backup and authentication verification UI at `/two-factor`.
- [x] **Role-Based Access Control (RBAC)**: Admin routes strictly restricted to `'admin' | 'superadmin'` roles.
- [x] **Signed Media Ingestion**: Cloudinary uploads signed via `/api/cloudinary/sign` endpoint.
- [x] **Stripe Webhook Signatures**: Raw body verification with `STRIPE_WEBHOOK_SECRET` on all incoming events.

---

## 🔍 2. Search & AI Guardrails
- [x] **Native `$rankFusion`**: Hybrid search pipeline combines vector and lexical stages inside MongoDB Atlas engine. Zero client-side RRF math.
- [x] **Vector Dimensions**: 3072 floats generated via `openai.embedding('text-embedding-3-large')` with `select: false` projection.
- [x] **State-Mutating AI Gates**: `addToCart` tool call strictly requires user approval before state modification.
- [x] **Zero Price Hallucination**: AI assistant pulls real-time pricing and stock exclusively from Mongoose documents.
- [x] **Resumable Streams**: Stream continuation enabled via AI SDK v7.

---

## 💳 3. Payments & ACID Transactions
- [x] **Stock Reservation**: Inventory decrements executed inside `mongoSession.withTransaction()` before Stripe session generation.
- [x] **Embedded Checkout**: `@stripe/react-stripe-js` Embedded Checkout Provider with client secret handshake.
- [x] **Expiration Rollback**: `checkout.session.expired` webhook handler automatically restores inventory on abandoned sessions.
- [x] **Official PDF Invoices**: `@react-pdf/renderer` generates compliant downloadable invoices at `/api/orders/[id]/invoice`.

---

## 🧪 4. Closed-Loop Test Verification
- [x] **TypeScript Compliance**: `tsc --noEmit` exits with code 0 (ZERO errors).
- [x] **Turbopack Build**: `next build` compiles all 29 routes cleanly.
- [x] **Vitest Unit Suite**: Cart calculations, free shipping threshold, and discount formulas verified.
- [x] **AI Evals Suite**: Multi-product comparison limits, parameter schemas, and search parameter validators verified.
