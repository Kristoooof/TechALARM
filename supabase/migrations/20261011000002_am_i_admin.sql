-- Az admin felület ezzel ellenőrzi, hogy a belépett felhasználó admin-e.
create function public.am_i_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_admin();
$$;

revoke all on function public.am_i_admin() from public, anon;
grant execute on function public.am_i_admin() to authenticated;
