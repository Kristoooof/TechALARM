-- E-mail cím helyett csak név: a belépés név + jelszó. A Supabase Auth belső azonosítót (login_email) kap,
-- amit a felhasználó nem lát. A név egyedi (kisbetűsítve, szóközök összevonva).

alter table public.profiles rename column email to login_email;
alter table public.profiles add column name_key text;
update public.profiles set name_key = lower(regexp_replace(btrim(full_name), '\s+', ' ', 'g'));
alter table public.profiles alter column name_key set not null;
create unique index profiles_name_key_idx on public.profiles (name_key);
