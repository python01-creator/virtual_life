-- MY LIFE HQ least-privilege hardening

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'life_records',
    'life_settings',
    'life_albums',
    'life_album_members',
    'life_album_entries',
    'life_album_comments'
  ] loop
    if to_regclass('public.' || table_name) is not null then
      execute format(
        'revoke select, insert, update, delete, truncate, references, trigger on table public.%I from anon',
        table_name
      );
      execute format(
        'revoke truncate, references, trigger on table public.%I from authenticated',
        table_name
      );
    end if;
  end loop;
end
$$;

grant select, insert, update, delete on table public.life_records to authenticated;
grant select, insert, update, delete on table public.life_settings to authenticated;

do $$
begin
  if to_regclass('public.life_albums') is not null then
    execute 'grant select, insert, update on table public.life_albums to authenticated';
  end if;
  if to_regclass('public.life_album_members') is not null then
    execute 'grant select on table public.life_album_members to authenticated';
  end if;
  if to_regclass('public.life_album_entries') is not null then
    execute 'grant select, insert on table public.life_album_entries to authenticated';
  end if;
  if to_regclass('public.life_album_comments') is not null then
    execute 'grant select, insert on table public.life_album_comments to authenticated';
  end if;
end
$$;

do $$
declare
  insecure_tables text;
begin
  select string_agg(c.relname, ', ' order by c.relname)
    into insecure_tables
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and c.relname like 'life_%'
    and (not c.relrowsecurity or not c.relforcerowsecurity);

  if insecure_tables is not null then
    raise exception 'RLS is not enabled and forced on: %', insecure_tables;
  end if;
end
$$;
