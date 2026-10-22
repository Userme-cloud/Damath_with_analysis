-- DAMATH MathLab: trainer monitoring, privacy-by-default.
-- Run once in Supabase SQL Editor. Requires Auth -> Anonymous Sign-ins enabled.
-- Then create one trainer email/password account in Authentication -> Users.
-- Finally replace TRAINER_EMAIL below and run its INSERT separately.

create table if not exists public.damath_trainers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.damath_players (
  player_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  grade text not null default '',
  consent_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table if not exists public.damath_sessions (
  id uuid primary key,
  player_id uuid not null references public.damath_players(player_id) on delete cascade,
  mode text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  last_activity_at timestamptz not null default now(),
  target_questions int not null default 20 check (target_questions between 1 and 100),
  answered int not null default 0 check (answered >= 0),
  correct int not null default 0 check (correct >= 0),
  total_seconds numeric not null default 0 check (total_seconds >= 0),
  points int not null default 0,
  best_streak int not null default 0,
  operation_stats jsonb not null default '{}'::jsonb,
  finish_reason text not null default ''
);
create index if not exists damath_sessions_player_idx on public.damath_sessions(player_id,started_at desc);
create index if not exists damath_sessions_recent_idx on public.damath_sessions(started_at desc);

create schema if not exists damath_private;
revoke all on schema damath_private from public, anon;
grant usage on schema damath_private to authenticated;
create or replace function damath_private.is_trainer()
returns boolean language sql stable security definer
set search_path = ''
as $trainer$
  select (select auth.uid()) is not null
    and coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) = false
    and exists (select 1 from public.damath_trainers where user_id = (select auth.uid()));
$trainer$;
revoke all on function damath_private.is_trainer() from public, anon;
grant execute on function damath_private.is_trainer() to authenticated;
create or replace function public.damath_is_trainer()
returns boolean language sql stable security invoker
set search_path = ''
as $wrapper$
  select damath_private.is_trainer();
$wrapper$;
revoke all on function public.damath_is_trainer() from public, anon;
grant execute on function public.damath_is_trainer() to authenticated;

alter table public.damath_trainers enable row level security;
alter table public.damath_players enable row level security;
alter table public.damath_sessions enable row level security;

-- No API policies for damath_trainers. Admins manage it through SQL Editor.
-- Anonymous signed-in players may only write/read their own records.
-- Trainers must be registered authenticated (non-anonymous) users.
drop policy if exists "players own view" on public.damath_players;
drop policy if exists "trainer player view" on public.damath_players;
drop policy if exists "player or trainer read" on public.damath_players;
create policy "player or trainer read" on public.damath_players for select to authenticated
using (player_id = (select auth.uid()) or (select damath_private.is_trainer()));
drop policy if exists "players register consent" on public.damath_players;
create policy "players register consent" on public.damath_players for insert to authenticated
with check (player_id = (select auth.uid()) and ((select auth.jwt())->>'is_anonymous')::boolean = true);
drop policy if exists "players update own" on public.damath_players;
create policy "players update own" on public.damath_players for update to authenticated
using (player_id = (select auth.uid()) and ((select auth.jwt())->>'is_anonymous')::boolean = true)
with check (player_id = (select auth.uid()) and ((select auth.jwt())->>'is_anonymous')::boolean = true);

drop policy if exists "player session read" on public.damath_sessions;
drop policy if exists "trainer session read" on public.damath_sessions;
drop policy if exists "player or trainer read" on public.damath_sessions;
create policy "player or trainer read" on public.damath_sessions for select to authenticated
using (player_id = (select auth.uid()) or (select damath_private.is_trainer()));
drop policy if exists "player session create" on public.damath_sessions;
create policy "player session create" on public.damath_sessions for insert to authenticated
with check (player_id = (select auth.uid()) and ((select auth.jwt())->>'is_anonymous')::boolean = true);
drop policy if exists "player session update" on public.damath_sessions;
create policy "player session update" on public.damath_sessions for update to authenticated
using (player_id = (select auth.uid()) and ((select auth.jwt())->>'is_anonymous')::boolean = true)
with check (player_id = (select auth.uid()) and ((select auth.jwt())->>'is_anonymous')::boolean = true);

revoke all on public.damath_trainers from public, anon, authenticated;
grant select,insert,update on public.damath_players to authenticated;
grant select,insert,update on public.damath_sessions to authenticated;

-- AFTER creating the trainer user in Authentication -> Users:
-- insert into public.damath_trainers(user_id)
-- select id from auth.users where email = 'TRAINER_EMAIL@example.com'
-- on conflict (user_id) do nothing;
