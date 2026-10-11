-- TechALARM alapséma: termek, eszközök, bejelentések, admin jogosultság, fotótároló

-- Nem publikus séma az admin-ellenőrzéshez (a Data API nem éri el)
create schema if not exists private;
grant usage on schema private to authenticated;

create table private.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from private.admins where user_id = (select auth.uid()));
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- Termek / laborok
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Eszközök (egy teremhez tartoznak)
create table public.devices (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  name text not null,
  inventory_code text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index devices_room_id_idx on public.devices (room_id);

-- Bejelentések. A terem/eszköz neve pillanatkép, hogy törlés után is megmaradjon.
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  tracking_code text not null unique,
  room_id uuid references public.rooms (id) on delete set null,
  device_id uuid references public.devices (id) on delete set null,
  room_name text not null,
  device_name text,
  category text not null check (category in ('elromlott', 'rongalas', 'hianyzik', 'egyeb')),
  description text not null check (char_length(description) between 5 and 2000),
  photo_path text,
  status text not null default 'uj' check (status in ('uj', 'folyamatban', 'megjavitva', 'elutasitva')),
  admin_note text,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reports_status_created_idx on public.reports (status, created_at desc);
create index reports_ip_created_idx on public.reports (ip_hash, created_at);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

-- Jogosultságok (RLS)
alter table public.rooms enable row level security;
alter table public.devices enable row level security;
alter table public.reports enable row level security;
alter table private.admins enable row level security;

-- Termek és eszközök: aktív elemeket bárki láthatja, szerkeszteni csak admin
create policy "rooms_public_read" on public.rooms
  for select to anon, authenticated using (active);
create policy "rooms_admin_all" on public.rooms
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy "devices_public_read" on public.devices
  for select to anon, authenticated using (active);
create policy "devices_admin_all" on public.devices
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

-- Bejelentések: névtelenek csak a szerveren (service role) keresztül írhatnak/olvashatnak,
-- közvetlenül csak admin fér hozzá.
create policy "reports_admin_all" on public.reports
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

-- Fotótároló (privát): feltöltés a szerverről, megtekintés csak adminnak
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-photos', 'report-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "report_photos_admin_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'report-photos' and private.is_admin());
create policy "report_photos_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'report-photos' and private.is_admin());
