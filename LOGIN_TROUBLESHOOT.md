# BT4 Studio Login Troubleshooting

## Current Status (after latest fixes)

- ✅ Telegram tab now has a working endpoint (no more 404)
- ✅ Email login/signup now shows **real Supabase error messages**
- ✅ Added fallback to create `public.users` row on login/signup
- ✅ `.env.local` is correct for **local** development

---

## Most Likely Causes of Your Errors (in order)

### 1. You have NOT run the SQL trigger yet (MOST COMMON)

The app **requires** the `public.users` table + trigger.

**What to do right now:**

1. Go to: https://supabase.com/dashboard/project/dgijnmnsnejhutqdzadd/sql
2. New Query
3. Paste the **entire** content of `scripts/supabase-setup.sql`
4. Run it

After running, try creating a new account via the **Sign Up** tab.

---

### 2. You are testing on Vercel (production), not locally

**Important:**

- `.env.local` is **only used locally** (`npm run dev`)
- **Vercel completely ignores** `.env.local`
- On Vercel you **must** add the variables in the dashboard:

**Go to Vercel → Your Project → Settings → Environment Variables**

Add these (copy from your `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=https://dgijnmnsnejhutqdzadd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.dgijnmnsnejhutqdzadd:123Baatin..@...
DIRECT_URL=postgresql://postgres.dgijnmnsnejhutqdzadd:123Baatin..@...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TELEGRAM_BOT_TOKEN=8862600842:AAG3FnAUkItxfEnd8jsyOWanXmxWl4vvhQU
TELEGRAM_STORAGE_CHANNEL_ID=-1004404120934
ADMIN_TELEGRAM_ID=8337048108
```

After adding them → Redeploy.

---

### 3. Telegram Login

**Telegram is intentionally not fully implemented yet.**

- The "Telegram" tab will now show a clear message:  
  `"Telegram login is not available yet. Please use Email & Password below."`

**Use the Email & Password tab** for now.

Real Telegram Login Widget + bot auth can be added later.

---

### 4. Email Login / Signup Errors

Common real errors you will now see:

- "Invalid login credentials" → Account doesn't exist yet. Use **Sign Up** tab first.
- "Email not confirmed" → Go to Supabase → Authentication → Users and confirm the user manually (or enable auto-confirm in settings for testing).
- "relation public.users does not exist" → You didn't run the SQL.

After signup, the code now tries to create the profile row automatically.

---

## Recommended Test Flow (do this)

1. Run the SQL in Supabase (step 1 above)
2. (If on Vercel) add the env vars + redeploy
3. Go to `/auth/signin`
4. Click **Sign Up** tab
5. Create an account with a real email + strong password
6. After success, switch to **Email & Password** tab and login with the same credentials
7. You should be logged in and redirected

---

## How to see the real error

Open browser DevTools (F12) → Console tab while trying to login.

Also check Supabase Dashboard → Logs (Authentication or Database).

---

## Still stuck?

Reply with the **exact error message** you see (from toast or console) and whether you are testing:
- Locally (`npm run dev`)
- On Vercel (deployed URL)

We can fix it from there.

---

**Latest commit on your branch:** `d2ee203` (contains the login fixes)
