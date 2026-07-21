-- =====================================================
-- BT4 STUDIO — SUPABASE NATIVE SETUP (Run in SQL Editor)
-- =====================================================
-- This creates the public.users table synced from auth.users
-- + the trigger that auto-creates a profile on signup.
-- Also adds any extra columns used by the app.

-- 1. Create / extend public.users table (matches Prisma + app needs)
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

-- 2. Enable RLS (recommended)
alter table public.users enable row level security;

-- Basic policies (adjust as needed for your app)
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- 3. Trigger function to sync auth.users → public.users
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
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
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

-- 4. Attach the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. (Optional) Backfill existing auth users (run once)
-- insert into public.users (id, email, username, role)
-- select id, email, split_part(email,'@',1), 'BUYER'
-- from auth.users
-- on conflict (id) do nothing;

-- 6. Grant usage to authenticated role
grant usage on schema public to authenticated;
grant all on public.users to authenticated;

-- Done. After running, new signups via Supabase Auth will automatically create rows in public.users
-- with role = BUYER (can be promoted to SELLER/ADMIN later).

comment on table public.users is 'Synced user profiles from Supabase Auth + extra BT4 fields';
comment on function public.handle_new_user() is 'Auto-creates public.users row on auth.users insert (BT4 Studio)';