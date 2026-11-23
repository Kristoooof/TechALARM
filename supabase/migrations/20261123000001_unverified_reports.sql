-- Regisztráció után azonnal lehet bejelenteni. Az admin felületen a bejelentés „hitelesítetlen”,
-- amíg a bejelentő regisztrációját az admin jóvá nem hagyja.

alter table public.reports add column reporter_verified boolean not null default false;

-- A már meglévő, jóváhagyott felhasználóktól származó bejelentések hitelesítettek
update public.reports r set reporter_verified = true
from public.profiles p
where p.id = r.reporter_id and p.status = 'approved';

-- Ha az admin jóváhagyja (vagy visszavonja) a regisztrációt, a bejelentések hitelesítettsége követi
create function private.sync_reporter_verified()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.reports set reporter_verified = (new.status = 'approved') where reporter_id = new.id;
  return new;
end;
$$;
revoke all on function private.sync_reporter_verified() from public, anon, authenticated;

create trigger profiles_sync_reporter_verified
  after update of status on public.profiles
  for each row when (old.status is distinct from new.status)
  execute function private.sync_reporter_verified();
