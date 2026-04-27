alter table public.quest_questions enable row level security;

drop policy if exists "Allow read access to quest questions" on public.quest_questions;
create policy "Allow read access to quest questions"
on public.quest_questions
for select
using (true);
