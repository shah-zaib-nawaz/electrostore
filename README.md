# ⚡ ElectroStore AI — Next-Generation Hardware & Electronics Store

> An enterprise-grade, AI-first e-commerce platform built with **Next.js 16.4**, **React 19**, **MongoDB Atlas ($rankFusion)**, **Mongoose 9.11**, **Better Auth 1.7**, **Stripe Embedded Checkout**, and **Vercel AI SDK v7**.

---

## 🌟 Overview

**ElectroStore AI** is a state-of-the-art e-commerce storefront engineered for high-performance computing hardware, flagship GPUs, OLED displays, and developer workstations. It combines a cinematic storefront with real-time AI sales engineering, biometric passkey authentication, and transactional payments.

---

## 🛠 Tech Stack

| Domain | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16.4](https://nextjs.org/) | App Router, Turbopack, React 19 Compiler (`reactCompiler: true`) |
| **Authentication** | [Better Auth 1.7](https://www.better-auth.com/) | Native MongoDB Adapter, Passkeys (WebAuthn/FIDO2), 2FA TOTP, RBAC |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) & [Mongoose 9.11](https://mongoosejs.com/) | ACID Transactions, `$rankFusion` Hybrid Search, Strict Schema Validation |
| **AI Concierge** | [Vercel AI SDK v7](https://sdk.vercel.ai/) | OpenAI GPT-5.4 & GPT-5.4-nano, Multi-turn streaming, 7 custom server tools |
| **Payments** | [Stripe](https://stripe.com/) | Embedded Checkout (`ui_mode: 'embedded'`), Local Webhook Listener |
| **Emails** | [Resend](https://resend.com/) & [React Email](https://react.email/) | Transactional order confirmation receipts and welcome onboarding |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & [Sonner](https://sonner.emilkowal.ski/) | Dark/Light theme, Radix UI primitives, Lucide icons |
| **Testing** | [Vitest](https://vitest.dev/) | Unit test suite & AI evaluation guardrails |

---

## ✨ Key Features

### 🛒 1. Flagship Storefront & Catalog
- **Faceted Product Browsing:** Filter by category, brand, price spectrum, and stock availability with zero layout shifts.
- **Interactive Product Detail Pages (PDP):** Multi-angle studio gallery thumbnails, dynamic specs matrix, verified reviews, and real-time inventory alerts.
- **Dynamic Cart Drawer & Sheet:** Sliding slide-over drawer with free express shipping progress bar, promo code validation (`ELECTRO10`, `SAVE25`), and WCAG 44px touch targets.
- **Wishlist & History:** Dedicated saved hardware dashboard with 1-click cart migration.

### 🤖 2. ElectroBot AI Concierge
- **Hardware Architecture Consultant:** Context-aware sales engineering answering deep technical questions (e.g., PCIe 5.1 PSU requirements, 4K 240Hz OLED HDR curves).
- **Hybrid Atlas Search ($rankFusion):** Real-time vector search (3072-dimensional embeddings) combined with full-text lexical search.
- **Zero-Hallucination Guardrails:** AI answers and comparisons pull strictly from verified MongoDB documents.
- **Human-in-the-Loop (HITL) Cart Gate:** State-altering operations (adding items to cart) require explicit interactive user approval cards.

### 💳 3. Payments & ACID Inventory Guarantee
- **Stripe Embedded Checkout:** Seamless in-page checkout flow supporting credit cards, Apple Pay, Google Pay, and Link.
- **Atomic Stock Reservation:** Mongoose transactions decrement inventory *before* initiating Stripe sessions.
- **Auto-Restoration Webhooks:** Abandoned or expired Stripe checkout sessions automatically roll back reserved stock.
- **Downloadable PDF Invoices:** Automated receipt generation via `@react-pdf/renderer` at `/api/orders/[id]/invoice`.

### 🔐 4. Zero-Middleware Security & Authentication
- **Next.js `src/proxy.ts` Architecture:** Strictly eliminates legacy `middleware.ts` in accordance with Next.js 16 conventions.
- **FIDO2 / WebAuthn Passkeys:** Passwordless biometric login alongside traditional email and password.
- **Two-Factor Authentication (2FA):** Time-based One-Time Password (TOTP) QR code enrollment and verification.
- **Role-Based Access Control (RBAC):** Separate customer accounts and administrative dashboards (`admin`, `superadmin`).

### 📦 5. Admin Operations Console (`/admin`)
- **Product Management:** Complete catalog CRUD, inventory adjustments, and specifications editor.
- **Order Management:** Real-time fulfillment status updates, tracking numbers, and automated customer notifications.
- **Marketing & Coupons:** Create and manage percentage-based and fixed-dollar promotional vouchers.
- **Real-Time Analytics:** Sales revenue charts, average order value (AOV), and customer registration metrics via Recharts.

---

## 📁 Repository Structure

```
ai-electrostore/
├── .agents/                    # Agentic rules, MCP configurations & skill definitions
├── public/
│   ├── images/
│   │   ├── banners/           # Hero showcases & promotional banners
│   │   ├── brand/             # Vector brand emblems & bot avatars
│   │   ├── collections/       # Category collection thumbnails
│   │   └── products/          # 175 local high-res product studio shots
├── scripts/
│   ├── create-admin.ts        # CLI utility to grant admin privileges
│   ├── run-provision-indexes.ts # MongoDB Atlas search index builder
│   ├── seed.ts                # Database seed script for 35 products
│   └── stripe-listen.ts       # Stripe CLI local webhook tunnel
├── src/
│   ├── actions/               # Authenticated Server Actions (Checkout, Admin)
│   ├── app/                   # Next.js 16 App Router (Storefront, Auth, Admin, APIs)
│   ├── components/
│   │   ├── admin/             # Admin console tables, forms & sidebar
│   │   ├── ai/                # ElectroBot AI concierge widget
│   │   ├── cart/              # Cart slide-over sheet & checkout buttons
│   │   ├── layout/            # Header, Footer, Theme toggle, Storefront shell
│   │   ├── search/            # CommandSearch (Ctrl+K) modal
│   │   ├── storefront/        # Product cards, buy boxes, gallery, reviews
│   │   └── ui/                # Core primitives (Button, Badge, Sheet, Dialog)
│   ├── emails/                # React Email transactional templates
│   ├── lib/                   # Database connection, auth config, email sender
│   ├── proxy.ts               # Next.js 16 network boundary route protection
│   ├── server/                # Mongoose models, AI tools, hybrid search DAL
│   ├── store/                 # Zustand persistent cart & wishlist stores
│   └── types/                 # TypeScript domain contracts
└── tests/
    ├── evals/                 # Vitest AI evaluation tests & guardrails
    └── unit/                  # Shopping cart calculations & search tests
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v22.x` or `v24.x`
- **Package Manager**: `pnpm` (v9+)
- **Database**: MongoDB Atlas Cluster (v8.0+ or v9.0+)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/shah-zaib-nawaz/electrostore.git
cd electrostore

# Install dependencies
pnpm install
```

### 3. Environment Variables
Create a `.env.local` file in the project root:
```env
# Database
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-electrostore?retryWrites=true&w=majority"

# Authentication (Better Auth)
BETTER_AUTH_SECRET="your-32-character-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Transactional Email (Resend)
RESEND_API_KEY="re_..."

# AI Engine (Vercel AI SDK)
OPENAI_API_KEY="sk-..."
```

### 4. Database Seed & Index Provisioning
```bash
# Populate catalog with 35 flagship hardware products, brands, and categories
pnpm seed

# Provision MongoDB Atlas search definitions
pnpm provision:indexes
```

### 5. Running the Application
```bash
# Start Turbopack development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Local Stripe Webhook Forwarding
In a separate terminal, forward webhook events to your local server:
```bash
pnpm stripe:listen
```

---

## 🧪 Testing & Verification

```bash
# Run unit tests and AI evaluation suite
pnpm test

# Run TypeScript type check
pnpm typecheck

# Run production build
pnpm build
```

---

## 📜 Scripts Reference

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Starts development server on port 3000 with Turbopack |
| `pnpm build` | Compiles optimized production bundle |
| `pnpm test` | Executes Vitest test suite and AI guardrail evals |
| `pnpm typecheck` | Validates TypeScript with zero type errors |
| `pnpm seed` | Seeds database with 35 products, categories, and brands |
| `pnpm provision:indexes`| Deploys Atlas vector & keyword search index definitions |
| `pnpm create-admin` | Promotes or creates an administrative account |
| `pnpm stripe:listen` | Runs Stripe CLI listener to forward webhooks locally |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
