-- Szerepkör-kezelő függvények. A private séma nem érhető el az API-n, ezért security definer függvényeken át,
-- belül az üzemeltetői jogosultság ellenőrzésével.

create or replace function public.my_roles()
returns text[]
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(array(
    select distinct x
    from private.staff_roles s
    cross join lateral unnest(
      case when s.role = 'operator' then array['operator', 'maintainer', 'approver'] else array[s.role] end
    ) as x
    where s.user_id = (select auth.uid())
  ), '{}');
$$;
revoke all on function public.my_roles() from public, anon;
grant execute on function public.my_roles() to authenticated;

create function public.staff_list()
returns table (user_id uuid, role text)
language sql
stable
security definer
set search_path = ''
as $$
  select s.user_id, s.role from private.staff_roles s where private.has_role('operator') order by s.role, s.user_id;
$$;
revoke all on function public.staff_list() from public, anon;
grant execute on function public.staff_list() to authenticated;

create function public.grant_role(p_user uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_role('operator') then
    raise exception 'Ehhez üzemeltetői jogosultság kell.';
  end if;
  insert into private.staff_roles (user_id, role) values (p_user, p_role) on conflict do nothing;
end;
$$;
revoke all on function public.grant_role(uuid, text) from public, anon;
grant execute on function public.grant_role(uuid, text) to authenticated;

create function public.revoke_role(p_user uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_role('operator') then
    raise exception 'Ehhez üzemeltetői jogosultság kell.';
  end if;
  if p_role = 'operator' and (select count(*) from private.staff_roles where role = 'operator') <= 1 then
    raise exception 'Az utolsó üzemeltetőt nem lehet eltávolítani.';
  end if;
  delete from private.staff_roles where user_id = p_user and role = p_role;
end;
$$;
revoke all on function public.revoke_role(uuid, text) from public, anon;
grant execute on function public.revoke_role(uuid, text) to authenticated;
