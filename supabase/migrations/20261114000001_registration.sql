-- Regisztráció és admin általi jóváhagyás: a bejelentők névvel és e-mail-címmel regisztrálnak,
-- az admin elfogadja vagy elutasítja őket. A bejelentés a bejelentőhöz kötődik.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create index profiles_status_created_idx on public.profiles (status, created_at desc);

alter table public.profiles enable row level security;

-- Saját profilt bárki láthat, aki be van lépve; mindent az admin kezel.
create policy "profiles_self_read" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles_admin_all" on public.profiles
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

-- A bejelentés a bejelentőhöz kötődik; a név pillanatkép, hogy a fiók törlése után is megmaradjon.
alter table public.reports
  add column reporter_id uuid references public.profiles (id) on delete set null,
  add column reporter_name text;
create index reports_reporter_created_idx on public.reports (reporter_id, created_at desc);
