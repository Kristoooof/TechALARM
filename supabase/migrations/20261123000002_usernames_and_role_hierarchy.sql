-- Azonos nevű felhasználók és szerepkör-hierarchia.
-- A név már nem egyedi, a belépéshez egyedi felhasználónév is van (a regisztrációkor generáljuk a névből).
-- Szerepkörök: tanár (approver: regisztrációt hagy jóvá), karbantartó (maintainer: bejelentések + jóváhagyás),
-- igazgató / admin (operator: minden).

alter table public.profiles add column username text;
update public.profiles set username = 'felhasznalo.' || substr(id::text, 1, 6) where username is null;
alter table public.profiles alter column username set not null;
create unique index profiles_username_idx on public.profiles (lower(username));

drop index if exists public.profiles_name_key_idx;
create index profiles_name_key_idx on public.profiles (name_key);

-- A bejelentésen a felhasználónév pillanatképe, hogy az azonos nevűek megkülönböztethetők legyenek
alter table public.reports add column reporter_username text;
update public.reports r set reporter_username = p.username from public.profiles p where p.id = r.reporter_id;

create or replace function private.has_role(r text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.staff_roles
    where user_id = (select auth.uid())
      and (role = 'operator' or role = r or (r = 'approver' and role = 'maintainer'))
  );
$$;

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
      case s.role
        when 'operator' then array['operator', 'maintainer', 'approver']
        when 'maintainer' then array['maintainer', 'approver']
        else array[s.role]
      end
    ) as x
    where s.user_id = (select auth.uid())
  ), '{}');
$$;
