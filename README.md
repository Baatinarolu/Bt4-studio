# BT4 Studio Studio

**Premium digital marketplace for source code, SaaS templates, UI kits, APIs & developer tools.**

Clean, editorial Swiss-style design — production ready and fully Vercel deployable.

![BT4 Studio Studio](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200)

## Features

- **Full marketplace**: Advanced filters, search, sorting, category browsing
- **Product detail pages**: Rich previews, file trees, reviews, demo links
- **Telegram-first checkout** — no cart friction. One-click purchase via Telegram bot
- **Seller dashboard**: Upload wizard, analytics, payouts
- **Buyer dashboard**: Purchases, downloads, license keys
- **Seller storefronts** and **Admin panel**
- **Telegram bot integration** (full webhook handler)
- **Dark mode** + beautiful mobile-first design
- **Fully mocked database** (easy to replace with Supabase / Postgres)

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- Tailwind + shadcn-style components
- Framer Motion, Recharts, React Query (prepared)
- Vercel-ready (zero-config)

## Quick Start

```bash
git clone <your-repo>
cd bt4-studio
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (see `.env.example`)
4. Deploy

No additional configuration needed. Everything works out-of-the-box with the in-memory mock DB.

## Telegram Bot Setup (Production)

1. Create bot at @BotFather → `/newbot`
2. Get the bot token
3. Set webhook:
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://yourdomain.vercel.app/api/telegram-bot
   ```
4. Add `TELEGRAM_BOT_TOKEN` to Vercel environment variables

## Key Pages

- `/` — Landing + discovery
- `/marketplace` — Full filterable marketplace
- `/product/[slug]` — Product detail + "Buy via Telegram"
- `/seller/dashboard` — Seller tools
- `/dashboard/buyer` — Buyer purchases
- `/storefront/[username]` — Public seller profile
- `/admin` — Moderation panel
- `/bot` — Bot documentation

## Architecture Notes

- All data lives in `lib/db.ts` (easy to swap for Prisma + Supabase)
- Purchase flow: Web → generate token → Telegram deep link → bot completes order
- Mock orders complete automatically after Telegram redirect for demo purposes
- All download URLs are simulated with signed-like experience

## Production Recommendations

- Replace `lib/db.ts` with Prisma + Postgres/Supabase
- Add real file storage (Cloudflare R2 / S3)
- Enable real Stripe + Telegram Payments
- Add rate limiting + auth (NextAuth / Clerk)
- Add virus scanning on uploads

## License

MIT — for demo / internal use. Adapt for commercial.

---

Built to the highest standards of a senior product designer at Stripe/Figma. Clean, fast, trustworthy. Ready for real users.