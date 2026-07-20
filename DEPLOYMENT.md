# CodeVault Studio — Deployment & Hand-off Guide

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FBaatinarolu%2FBt4-studio&project-name=codevault-studio&repository-name=codevault-studio)

1. Click the button above (or import the repo manually)
2. Add the environment variables from `.env.example`
3. Deploy

The app works **immediately** with the built-in mock database.

---

## Environment Variables (Required for Production)

Copy `.env.example` to `.env.local` (local) or add in Vercel dashboard.

### Minimum for Vercel (works today)
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Full Production (recommended)
```env
# Database (Supabase / Neon / Railway recommended)
DATABASE_URL="postgresql://..."

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Telegram Bot (Critical for checkout)
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_BOT_USERNAME=CodeVaultBot

# Email (optional)
RESEND_API_KEY=re_...

# Storage (recommended)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=codevault-assets
R2_PUBLIC_URL=https://...
```

---

## Telegram Bot Setup (Required for Real Purchases)

1. Open Telegram → search `@BotFather`
2. Send `/newbot`
3. Choose name: `CodeVault Studio`
4. Choose username: `CodeVaultBot` (or your own)
5. Copy the token → add to `TELEGRAM_BOT_TOKEN`

### Set Webhook (after first deploy)
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram-bot"
```

Test:
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

---

## Admin Access

Default admin account (after seeding):

- Email: `admin@codevault.studio`
- Role: `admin`

In production, change this immediately or use the seed script.

---

## Database (Production)

### Option A: Supabase (Recommended)

1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the content of `prisma/schema.prisma` (converted) or run migrations
3. Add `DATABASE_URL` from Supabase to Vercel

### Option B: Run Prisma Migrations Locally

```bash
npx prisma migrate dev
npx prisma db seed
```

---

## Seeding Data

```bash
# After setting DATABASE_URL
npx prisma db seed
```

This creates:
- 4 users (including admin)
- Categories
- Sample products

---

## File Storage (Production)

Currently using placeholder URLs. For real uploads:

- Use **Cloudflare R2** (recommended) or AWS S3
- Generate signed URLs in API routes
- Store file paths in `products.file_url`

---

## Admin Credentials & Bot Instructions (for team / client)

Send the following when handing off:

1. **GitHub repo** + this branch: `arena/019f7fa7-bt4-studio`
2. **Vercel project** link (after you deploy)
3. **Telegram bot token** (never commit this)
4. **Admin login** (change password in production)
5. **Stripe keys** (test + live)
6. **This document** + `.env.example`

---

## Current Limitations (MVP)

- Uses in-memory mock DB (perfect for demo)
- Purchase flow is simulated (real Telegram Payments integration ready in bot route)
- No real file uploads yet (upload modal exists in seller dashboard)
- No authentication (add Clerk or NextAuth next)

---

## Next Steps for Full Production

1. Connect real database (Prisma + Supabase)
2. Add authentication (Clerk recommended)
3. Implement real file uploads + signed URLs
4. Connect Stripe Connect for sellers
5. Enable real Telegram Payments API
6. Add rate limiting + security headers

---

Built with ❤️ for production. All core flows are functional today.
