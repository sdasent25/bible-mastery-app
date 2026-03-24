create table if not exists public.friendships (
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  friend_display text,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);

alter table public.friendships enable row level security;

drop policy if exists "Users can read own friendships" on public.friendships;
create policy "Users can read own friendships"
on public.friendships
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own friendships" on public.friendships;
create policy "Users can insert own friendships"
on public.friendships
for insert
to authenticated
with check (auth.uid() = user_id);
