create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  due_date date,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists tasks_user_status_created_idx
  on public.tasks (user_id, is_completed, created_at desc);

create or replace function public.set_task_timestamps()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());

  if new.is_completed and (tg_op = 'INSERT' or old.is_completed = false) then
    new.completed_at = timezone('utc', now());
  elsif new.is_completed = false then
    new.completed_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists set_task_timestamps on public.tasks;
create trigger set_task_timestamps
before insert or update on public.tasks
for each row execute function public.set_task_timestamps();

alter table public.tasks enable row level security;

drop policy if exists "Users can view their own tasks" on public.tasks;
create policy "Users can view their own tasks"
on public.tasks for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can create their own tasks" on public.tasks;
create policy "Users can create their own tasks"
on public.tasks for insert
to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
on public.tasks for update
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks"
on public.tasks for delete
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

grant select, insert, update, delete on public.tasks to authenticated;
