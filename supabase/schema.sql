-- Lumanova database schema
-- Run this entire file in the Supabase SQL Editor (Project → SQL Editor → New query)

-- ============================================================
-- 1. TABLES
-- ============================================================

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  age integer,
  ethnicity text check (
    ethnicity in (
      'south_asian', 'east_asian', 'latino', 'african',
      'middle_eastern', 'southeast_asian', 'mixed', 'other'
    )
  ),
  goals text[] check (
    goals <@ array['skincare', 'grooming', 'fitness', 'confidence', 'sleep', 'style']
  ),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  storage_path text not null,
  photo_type text not null check (photo_type in ('baseline', 'day_30', 'day_60', 'day_90')),
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  plan_json jsonb not null,
  day_started date not null default current_date,
  current_day integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  date date not null default current_date,
  habits_completed text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_checkin_date date
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  badge_key text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, badge_key)
);

-- One cached line per user per calendar day — see lib/daily-coach-line.ts.
-- Written at most once per (user_id, date); read on every page load after
-- that instead of ever calling the model again for the same day.
create table if not exists public.daily_coach_lines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  date date not null,
  content text not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Pre-launch email capture — public site only ever inserts here, never
-- reads. Not linked to auth.users; a waitlist signup is not an account.
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create index if not exists photos_user_id_idx on public.photos (user_id);
create index if not exists plans_user_id_idx on public.plans (user_id);
create index if not exists daily_checkins_user_id_idx on public.daily_checkins (user_id);
create unique index if not exists daily_checkins_user_date_idx on public.daily_checkins (user_id, date);
create index if not exists chat_messages_user_id_idx on public.chat_messages (user_id);
create index if not exists achievements_user_id_idx on public.achievements (user_id);
create index if not exists daily_coach_lines_user_id_idx on public.daily_coach_lines (user_id);

-- Defensive: if chat_messages/achievements already exist in this project
-- (created outside this file, e.g. via the dashboard table editor) without
-- an ON DELETE CASCADE foreign key, this repoints them at one so account
-- deletion actually cascades to these tables too. Safe to re-run.
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'chat_messages') then
    alter table public.chat_messages drop constraint if exists chat_messages_user_id_fkey;
    alter table public.chat_messages
      add constraint chat_messages_user_id_fkey
      foreign key (user_id) references public.users (id) on delete cascade;
  end if;

  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'achievements') then
    alter table public.achievements drop constraint if exists achievements_user_id_fkey;
    alter table public.achievements
      add constraint achievements_user_id_fkey
      foreign key (user_id) references public.users (id) on delete cascade;
  end if;
end $$;

-- ============================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.photos enable row level security;
alter table public.plans enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.streaks enable row level security;
alter table public.daily_coach_lines enable row level security;
alter table public.waitlist enable row level security;

-- users: row id IS the user's own id
create policy "Users can view own row" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own row" on public.users
  for update using (auth.uid() = id);

-- photos
create policy "Users can view own photos" on public.photos
  for select using (auth.uid() = user_id);

create policy "Users can insert own photos" on public.photos
  for insert with check (auth.uid() = user_id);

create policy "Users can update own photos" on public.photos
  for update using (auth.uid() = user_id);

create policy "Users can delete own photos" on public.photos
  for delete using (auth.uid() = user_id);

-- plans
create policy "Users can view own plans" on public.plans
  for select using (auth.uid() = user_id);

create policy "Users can insert own plans" on public.plans
  for insert with check (auth.uid() = user_id);

create policy "Users can update own plans" on public.plans
  for update using (auth.uid() = user_id);

-- daily_checkins
create policy "Users can view own checkins" on public.daily_checkins
  for select using (auth.uid() = user_id);

create policy "Users can insert own checkins" on public.daily_checkins
  for insert with check (auth.uid() = user_id);

create policy "Users can update own checkins" on public.daily_checkins
  for update using (auth.uid() = user_id);

-- streaks
create policy "Users can view own streak" on public.streaks
  for select using (auth.uid() = user_id);

create policy "Users can insert own streak" on public.streaks
  for insert with check (auth.uid() = user_id);

create policy "Users can update own streak" on public.streaks
  for update using (auth.uid() = user_id);

-- daily_coach_lines: written once per day server-side (the user's own
-- session, not the admin client — see lib/daily-coach-line.ts), so it needs
-- the same auth.uid() insert/select policies as everything else here. No
-- update/delete policy: a day's line is never edited after it's written.
create policy "Users can view own daily coach lines" on public.daily_coach_lines
  for select using (auth.uid() = user_id);

create policy "Users can insert own daily coach lines" on public.daily_coach_lines
  for insert with check (auth.uid() = user_id);

-- waitlist: public can add their own email, but never read the list back
-- (no select policy at all — RLS default-denies select for anon/authenticated).
create policy "Anyone can join the waitlist" on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

-- ============================================================
-- 3. AUTO-CREATE public.users ROW ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
