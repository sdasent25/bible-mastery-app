create table if not exists public.program_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  program_id text not null,
  current_segment_index integer not null default 0,
  completed boolean not null default false,
  bonus_awarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, program_id)
);

alter table public.program_progress enable row level security;

drop policy if exists "Users can read own program progress" on public.program_progress;
create policy "Users can read own program progress"
on public.program_progress
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own program progress" on public.program_progress;
create policy "Users can insert own program progress"
on public.program_progress
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own program progress" on public.program_progress;
create policy "Users can update own program progress"
on public.program_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);