-- Adatvédelmi megfelelés: szerepkörök (üzemeltető / karbantartó / jóváhagyó), tájékoztató-nyilvántartás,
-- adatkezelési kérelmek, a már nem használt IP-hash törlése.

-- ---------- Szerepkörök ----------
create table private.staff_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('operator', 'maintainer', 'approver')),
  primary key (user_id, role)
);
alter table private.staff_roles enable row level security;

-- A korábbi adminok üzemeltetők lesznek
insert into private.staff_roles (user_id, role)
select user_id, 'operator' from private.admins
on conflict do nothing;

-- Az üzemeltető minden szerepkört magában foglal
create function private.has_role(r text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.staff_roles
    where user_id = (select auth.uid()) and (role = 'operator' or role = r)
  );
$$;
revoke all on function private.has_role(text) from public, anon;
grant execute on function private.has_role(text) to authenticated;

-- A belépett felhasználó érvényes szerepkörei (az admin felület ebből dönt)
create function public.my_roles()
returns text[]
language sql
stable
security invoker
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

-- Jogosultságok szerepkör szerint
drop policy "rooms_admin_all" on public.rooms;
create policy "rooms_staff_all" on public.rooms
  for all to authenticated using (private.has_role('maintainer')) with check (private.has_role('maintainer'));

drop policy "devices_admin_all" on public.devices;
create policy "devices_staff_all" on public.devices
  for all to authenticated using (private.has_role('maintainer')) with check (private.has_role('maintainer'));

drop policy "reports_admin_all" on public.reports;
create policy "reports_staff_all" on public.reports
  for all to authenticated using (private.has_role('maintainer')) with check (private.has_role('maintainer'));

drop policy "profiles_admin_all" on public.profiles;
create policy "profiles_staff_all" on public.profiles
  for all to authenticated using (private.has_role('approver')) with check (private.has_role('approver'));

drop policy "report_photos_admin_read" on storage.objects;
create policy "report_photos_staff_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'report-photos' and private.has_role('maintainer'));
drop policy "report_photos_admin_delete" on storage.objects;
create policy "report_photos_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'report-photos' and private.has_role('maintainer'));

-- ---------- Tájékoztató tudomásulvétele ----------
alter table public.profiles
  add column notice_version text,
  add column notice_accepted_at timestamptz;

-- ---------- Adatkezelési kérelmek (GDPR 15–21. cikk) ----------
create table public.data_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  requester_name text not null,
  type text not null check (type in ('hozzaferes', 'helyesbites', 'torles', 'tiltakozas', 'egyeb')),
  message text not null check (char_length(message) between 3 and 2000),
  status text not null default 'open' check (status in ('open', 'done', 'rejected')),
  response text,
  created_at timestamptz not null default now(),
  due_at timestamptz not null default (now() + interval '30 days'),
  handled_at timestamptz
);
create index data_requests_status_due_idx on public.data_requests (status, due_at);
alter table public.data_requests enable row level security;
create policy "data_requests_operator_all" on public.data_requests
  for all to authenticated using (private.has_role('operator')) with check (private.has_role('operator'));

-- ---------- A névtelen időszak IP-hash értékeinek törlése ----------
drop index if exists public.reports_ip_created_idx;
alter table public.reports drop column if exists ip_hash;
