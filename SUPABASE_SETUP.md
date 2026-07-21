# BT4 Studio — Supabase Setup (One-time)

Everything below is ready. You only need to do this **once** in the Supabase dashboard.

## 1. Real Telegram credentials (already in .env.local)
```env
TELEGRAM_BOT_TOKEN=8862600842:AAG3FnAUkItxfEnd8jsyOWanXmxWl4vvhQU
TELEGRAM_STORAGE_CHANNEL_ID=-1004404120934
ADMIN_TELEGRAM_ID=8337048108
```

**Important**: Your bot must be an **administrator** in the private channel `-1004404120934`.

## 2. Run this SQL in Supabase (REQUIRED)

1. Go to your Supabase project: https://supabase.com/dashboard/project/dgijnmnsnejhutqdzadd
2. Click **SQL Editor** (left sidebar)
3. Click **New query**
4. Copy **everything** below and paste it
5. Click **Run**

```sql
-- =====================================================
-- BT4 STUDIO — SUPABASE NATIVE SETUP
-- Copy & paste the entire block below
-- =====================================================

create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  username text unique,
  display_name text,
  avatar text,
  bio text,
  is_verified boolean default false,
  role text default 'BUYER' check (role in ('BUYER', 'SELLER', 'ADMIN')),
  telegram_id text unique,
  telegram_username text,
  password_hash text,
  is_seller_approved boolean default false,
  payout_wallet text,
  currency text default 'USD',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (
    id,
    email,
    username,
    display_name,
    avatar,
    role,
    telegram_id,
    telegram_username
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'BUYER'),
    new.raw_user_meta_data->>'telegram_id',
    new.raw_user_meta_data->>'telegram_username'
  )
  on conflict (id) do update set
    email = excluded.email,
    username = coalesce(excluded.username, public.users.username),
    display_name = coalesce(excluded.display_name, public.users.display_name),
    avatar = coalesce(excluded.avatar, public.users.avatar),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

grant usage on schema public to authenticated;
grant all on public.users to authenticated;
```

After running successfully you should see "Success. No rows returned" (or similar).

## 3. (Recommended) Set your bot webhook

Once your site is deployed (or using ngrok for local), set the webhook:

```bash
# Replace YOUR_DOMAIN with your actual URL
curl -X POST "https://api.telegram.org/bot8862600842:AAG3FnAUkItxfEnd8jsyOWanXmxWl4vvhQU/setWebhook" \
  -d "url=https://YOUR_DOMAIN/api/telegram-bot"
```

For local testing you can use ngrok.

## 4. How the flow now works (fully wired)

1. Seller uploads → file is sent to your channel `-1004404120934` via `sendDocument`
2. `telegramFileId` is saved in the `products` table
3. Buyer purchases → goes to Telegram bot
4. Admin confirms payment in `/admin/orders`
5. **Automatic delivery**: the bot forwards the exact file using the stored `telegramFileId` to the buyer

All code changes are already committed and pushed to this branch.

## 5. Test it

- Sign up (new users will get a row in `public.users` thanks to the trigger)
- Upload a product as seller (file goes to Telegram channel)
- Buy it
- Go to admin panel → confirm the order
- Buyer should receive the file in Telegram automatically

You're done. No local commands required from your side except pasting the SQL above.
