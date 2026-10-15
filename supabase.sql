-- Supabase SQL Editor에서 한 번 실행하세요.
create table if not exists public.life_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  home_id text not null default 'original',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.life_settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.life_records enable row level security;
alter table public.life_settings enable row level security;
alter table public.life_records force row level security;
alter table public.life_settings force row level security;

do $$ begin
  create policy "owners manage their records" on public.life_records
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "owners manage their settings" on public.life_settings
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
exception when duplicate_object then null;
end $$;

grant select, insert, update, delete on public.life_records to authenticated;
grant select, insert, update, delete on public.life_settings to authenticated;

create index if not exists life_records_owner_home_updated
on public.life_records (user_id, home_id, updated_at desc);
