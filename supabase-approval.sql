begin;
create schema if not exists hq_private;
revoke all on schema hq_private from public;
create table if not exists hq_private.members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null check (status in ('pending','approved','rejected')),
  requested_at timestamptz not null default now()
);
create table if not exists hq_private.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists hq_private.initialized (singleton boolean primary key check (singleton));

alter table hq_private.members enable row level security;
alter table hq_private.admins enable row level security;
alter table hq_private.initialized enable row level security;
-- Run first while public signup is disabled.

do $$
begin
  if not exists (select 1 from hq_private.initialized) then
    insert into hq_private.members (user_id,status)
    select id,'approved' from auth.users on conflict do nothing;
    insert into hq_private.initialized values (true);
  end if;
end $$;

create or replace function public.hq_approved() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from hq_private.members where user_id=auth.uid() and status='approved') $$;
revoke all on function public.hq_approved() from public;
grant execute on function public.hq_approved() to authenticated;

do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname='public' and left(tablename,5)='life_' loop
    execute format('alter table public.%I enable row level security',t.tablename);
    execute format('drop policy if exists hq_approval_required on public.%I',t.tablename);
    execute format('create policy hq_approval_required on public.%I as restrictive for all to authenticated using (public.hq_approved()) with check (public.hq_approved())',t.tablename);
  end loop;
end $$;

-- Existing privileged album RPCs run as their owner. Keep their existing signatures
-- and give authenticated users guarded wrappers, with the originals kept private.
do $$
declare f record;
begin
  for f in
    select p.oid,p.proname,oidvectortypes(p.proargtypes) identity_args,
      pg_get_function_arguments(p.oid) args,pg_get_function_result(p.oid) result_type,
      p.pronargs,p.proretset,p.proargtypes
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in
    ('life_invite_album','life_revoke_album','life_album_invitations','life_accept_album')
  loop
    if exists(select 1 from pg_proc original join pg_namespace ns on ns.oid=original.pronamespace
      where ns.nspname='hq_private' and original.proname=f.proname and original.proargtypes=f.proargtypes) then continue; end if;
    execute format('alter function public.%I(%s) set schema hq_private',f.proname,f.identity_args);
    execute format('create function public.%I(%s) returns %s language plpgsql security definer set search_path = %L as %L',
      f.proname,f.args,f.result_type,'',
      'begin if not public.hq_approved() then raise exception ''HQ approval required'' using errcode = ''42501''; end if; ' ||
      case when f.proretset then 'return query select * from ' when f.result_type='void' then 'perform ' else 'return ' end ||
      format('hq_private.%I(%s); end',f.proname,
        (select coalesce(string_agg('$'||i,',' order by i),'') from generate_series(1,f.pronargs) i)));
    execute format('revoke all on function public.%I(%s) from public, anon',f.proname,f.identity_args);
    execute format('grant execute on function public.%I(%s) to authenticated',f.proname,f.identity_args);
  end loop;
end $$;

create or replace function public.hq_access() returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  decision text;
  admin boolean;
begin
  if caller is null then raise exception 'Login required' using errcode='42501'; end if;
  insert into hq_private.members (user_id,status)
    select caller,'pending' from auth.users
    where id=caller and email_confirmed_at is not null and raw_app_meta_data->>'provider'='google'
    on conflict (user_id) do nothing;
  select status into decision from hq_private.members where user_id=caller;
  select decision='approved' and exists(select 1 from hq_private.admins where user_id=caller) into admin;
  return jsonb_build_object('status',coalesce(decision,'unavailable'),'admin',coalesce(admin,false));
end $$;

create or replace function public.hq_pending() returns table(user_id uuid,email text,requested_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select m.user_id,u.email,m.requested_at from hq_private.members m join auth.users u on u.id=m.user_id
  where public.hq_approved() and exists(select 1 from hq_private.admins where user_id=auth.uid())
    and m.status='pending' order by m.requested_at
$$;

create or replace function public.hq_decide(applicant uuid, approve boolean) returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.hq_approved() or not exists(select 1 from hq_private.admins where user_id=auth.uid()) then
    raise exception 'Admin required' using errcode='42501';
  end if;
  update hq_private.members set status=case when approve then 'approved' else 'rejected' end
    where user_id=applicant and status='pending';
  return found;
end $$;

revoke all on function public.hq_access(),public.hq_pending(),public.hq_decide(uuid,boolean) from public,anon;
grant execute on function public.hq_access(),public.hq_pending(),public.hq_decide(uuid,boolean) to authenticated;
commit;
