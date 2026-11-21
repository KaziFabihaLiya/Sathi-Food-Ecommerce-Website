# Shathi Foods — Pure Ghee E-Commerce Platform

A production-ready Next.js 16 (App Router) e-commerce web application for **Shathi Foods**, handcrafted for pure cow's milk and cream ghee with Cash on Delivery (COD) across Bangladesh.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with brand color variables and `@theme` configuration
- **Typography**: Google Fonts via `next/font/google` (`Fraunces` for headings, `Inter` for body)
- **Database & ORM**: PostgreSQL with [Prisma ORM 6](https://www.prisma.io/)
- **Authentication**: [Auth.js (NextAuth v5 beta)](https://authjs.dev/) with Credentials provider and JWT session strategy
- **Image Hosting**: [Cloudinary](https://cloudinary.com/) with server-side buffer upload and automated cleanup
- **Transactional Email**: [Nodemailer](https://nodemailer.com/) with responsive HTML order confirmation templates
- **Validation**: [Zod](https://zod.dev/)

---

## Getting Started

### 1. Prerequisites

- **Node.js**: v20 or later (v22 / v24 recommended)
- **Package Manager**: `npm`
- **PostgreSQL**: A running instance (local, Supabase, Neon, AWS RDS, etc.)

### 2. Installation

Clone or open the repository directory and install dependencies:

```bash
npm install
```

### 3. Environment Variables Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in your values (see [Environment Variables Reference](#environment-variables-reference) below).

### 4. Database Setup & Seeding

1. **Deploy Migrations**: Apply the Prisma schema migration to your database:
   ```bash
   npx prisma migrate deploy
   ```

2. **Seed Initial Catalog & Admin**:
   ```bash
   npm run db:seed
   ```
   This inserts:
   - **Gold Ghee** (500g, ৳999, stock: 48)
   - **Silk Ghee** (500g, ৳999, stock: 100)
   - **Gold + Silk Combo** (1000g, ৳1998, stock: 50)
   - **Admin User** with credentials from `ADMIN_EMAIL` and `ADMIN_PASSWORD` (hashed with bcrypt).

3. *(Optional)* **Seed Demo Orders**:
   ```bash
   npm run seed:demo
   ```

### 5. Running Locally

Start the development server on port 3000:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) to log into the admin dashboard.

---

## Environment Variables Reference

### Production Required Variables

The following variables **must be set** in production (e.g. in your Vercel Project Settings):

| Variable | Description | Example / Note |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string with SSL | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `AUTH_SECRET` | 32+ character random secret for JWT encryption | Generate with `openssl rand -base64 33` |
| `ADMIN_EMAIL` | Superadmin email for login | `admin@shathifoods.com` |
| `ADMIN_PASSWORD` | Superadmin initial password (used during seed) | Strong alphanumeric password |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account Cloud Name | `shathi-foods` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `abCdEfGhIjKlMnOpQrStUvWxYz` |
| `SMTP_HOST` | Outgoing SMTP host | `smtp.resend.com` / `smtp.gmail.com` |
| `SMTP_PORT` | Outgoing SMTP port | `587` (STARTTLS) or `465` (SSL) |
| `SMTP_USER` | SMTP username | `resend` / your email address |
| `SMTP_PASS` | SMTP password / API token / App Password | SMTP API key or app password |
| `ORDER_NOTIFY_EMAIL` | Destination mailbox for new order notifications | `orders@shathifoods.com` |
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL of the site | `https://shathifoods.com` |
| `NEXT_PUBLIC_WHATSAPP` | Customer care WhatsApp number (country code without `+`) | `8801805080012` |
| `NEXT_PUBLIC_FACEBOOK_URL` | Official Facebook Page URL | `https://facebook.com/shathifoods` |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Official Instagram Profile URL | `https://instagram.com/shathifoods` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Customer support email displayed publicly | `support@shathifoods.com` |

---

## Deploying to Vercel

### Step 1: Push Code to GitHub / Git Provider

Commit all changes to your repository and push to GitHub, GitLab, or Bitbucket.

### Step 2: Import Project into Vercel

1. Log in to [Vercel](https://vercel.com/) and click **"Add New..."** &rarr; **"Project"**.
2. Select your repository and click **"Import"**.
3. Framework Preset: **Next.js** (detected automatically).
4. Root Directory: `./` (leave default).

### Step 3: Configure Build & Install Commands

The build script in `package.json` is configured as:
```json
"scripts": {
  "build": "prisma migrate deploy && next build",
  "postinstall": "prisma generate"
}
```
- During `npm install` on Vercel, `postinstall` generates the Prisma Client.
- During build, `prisma migrate deploy && next build` automatically applies any pending database migrations before compiling the Next.js assets.

### Step 4: Add Environment Variables

In the **Environment Variables** section of the Vercel project configuration, add all variables listed in the [Production Required Variables](#production-required-variables) table above.

> [!TIP]
> If using serverless PostgreSQL providers like Neon or Supabase, use the pooled connection string for `DATABASE_URL` with `?sslmode=require&pgbouncer=true`.

### Step 5: Deploy & Seed Production

1. Click **Deploy**.
2. Once deployed, run the initial production seed. You can run this locally pointing to the production database:
   ```bash
   DATABASE_URL="your-production-database-url" npm run db:seed
   ```
   Or trigger it via the Vercel CLI:
   ```bash
   vercel env pull .env.production.local
   npx dotenv -e .env.production.local -- npm run db:seed
   ```

---

## Key Features & Architecture

### 1. Order Protection & Business Rules
- **One Atomic Transaction**: Customer upsert, sequential invoice generation (`INV-YYYY-XXXX`), order/item snapshot creation, and inventory decrement occur within a single database transaction (`prisma.$transaction`).
- **Honeypot Protection**: An invisible `website` field traps spam bots, returning a fake 201 response without database writes.
- **Rate Limiting**: Public order placement is rate-limited to 5 requests per minute per IP.
- **Stock Integrity**: Orders snapshot product names and unit prices at time of purchase. Editing or hiding products never alters past order history.
- **Inventory Transitions**:
  - Marking an order as `CANCELLED` automatically restocks the items to inventory.
  - Re-activating a `CANCELLED` order checks available inventory and decrements stock again (rejecting if stock is insufficient).

### 2. Admin Security
- **Auth.js v5**: JWT session strategy with credentials authentication.
- **Brute-Force Lockout**: 5 failed login attempts lock the account for 15 minutes (`lockedUntil = now + 15m`).
- **Middleware Protection**: All `/admin/*` pages and `/api/admin/*` APIs are protected by middleware, redirecting unauthenticated pages to `/admin/login` and returning `401 Unauthorized` for API routes.

### 3. SEO & Metadata
- **Dynamic Sitemap**: Generated at `/sitemap.xml` via `src/app/sitemap.ts`.
- **Robots Rules**: Configured at `/robots.txt` via `src/app/robots.ts`, allowing `/` and `/order` while protecting `/admin/` and `/api/`.
- **OpenGraph & Twitter Cards**: Configured in `src/app/layout.tsx`.
- **Image Optimization**: Remote patterns configured in `next.config.ts` for Cloudinary CDN (`res.cloudinary.com`).

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma              # PostgreSQL database models
│   ├── migrations/                # Migration history
│   ├── seed.ts                    # Production catalog & admin seed
│   └── seed-demo.ts               # Demo customer & order seed
├── public/
│   └── images/                    # Local image assets
├── src/
│   ├── app/
│   │   ├── (store)/               # Public storefront routes
│   │   │   ├── page.tsx           # Homepage
│   │   │   └── order/page.tsx     # Dedicated order page
│   │   ├── admin/                 # Protected admin dashboard routes
│   │   │   ├── login/page.tsx     # Admin login
│   │   │   ├── products/page.tsx  # Product catalogue management
│   │   │   ├── reviews/page.tsx   # Customer review management
│   │   │   └── orders/[id]/       # Order detail & printable invoice
│   │   ├── api/                   # REST API route handlers
│   │   ├── robots.ts              # Robots.txt generator
│   │   └── sitemap.ts             # Sitemap.xml generator
│   ├── components/
│   │   ├── admin/                 # Admin panel UI components
│   │   └── store/                 # Storefront UI components
│   ├── lib/
│   │   ├── api.ts                 # Client API fetch wrapper
│   │   ├── auth.ts                # Route handler authentication helpers
│   │   ├── cloudinary.ts          # Cloudinary upload & delete utilities
│   │   ├── config.ts              # Site constants & currency helpers
│   │   ├── date.ts                # Asia/Dhaka timezone helpers
│   │   ├── mail.ts                # Nodemailer order notification
│   │   ├── prisma.ts              # PrismaClient singleton
│   │   ├── rate-limit.ts          # In-memory IP rate limiter
│   │   └── types.ts               # Shared TypeScript interfaces
│   ├── auth.ts                    # Auth.js v5 credentials provider
│   ├── auth.config.ts             # Edge-compatible Auth.js config
│   └── middleware.ts              # Route protection middleware
├── API.md                         # Detailed API documentation
├── next.config.ts                 # Next.js configuration & image domains
└── package.json
```

---

## License

Private & Proprietary — Shathi Foods. All rights reserved.
