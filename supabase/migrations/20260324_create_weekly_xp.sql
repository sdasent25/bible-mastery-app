create table if not exists public.weekly_xp (
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  xp integer not null default 0,
  user_display text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

alter table public.weekly_xp enable row level security;

drop policy if exists "Authenticated users can read weekly leaderboard" on public.weekly_xp;
create policy "Authenticated users can read weekly leaderboard"
on public.weekly_xp
for select
to authenticated
using (true);

drop policy if exists "Users can insert own weekly xp" on public.weekly_xp;
create policy "Users can insert own weekly xp"
on public.weekly_xp
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own weekly xp" on public.weekly_xp;
create policy "Users can update own weekly xp"
on public.weekly_xp
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
