-- Teremtípusok + szabadon beírható teremszám
--  * a bejelentő űrlapon a „terem típusa” három lehetőség: Informatika terem, Gépész terem, Osztályterem
--  * a bejelentő saját maga írja be, melyik terem (pl. 1, 104) → reports.room_number

alter table public.reports
  add column if not exists room_number text check (room_number is null or char_length(room_number) between 1 and 20);

-- A három teremtípus (a `rooms` tábla innentől típusokat tartalmaz)
insert into public.rooms (name, sort_order, active) values
  ('Informatika terem', 1, true),
  ('Gépész terem', 2, true),
  ('Osztályterem', 3, true)
on conflict (name) do update set sort_order = excluded.sort_order, active = true;

-- A korábbi minta-termek eltűnnek az űrlapról (nem töröljük őket, így a régi bejelentések megmaradnak)
update public.rooms set active = false
where name not in ('Informatika terem', 'Gépész terem', 'Osztályterem');

-- Eszközök teremtípusonként
insert into public.devices (room_id, name)
select r.id, d.name
from public.rooms r
join (values
  ('Informatika terem', 'Számítógép'),
  ('Informatika terem', 'Monitor'),
  ('Informatika terem', 'Billentyűzet / egér'),
  ('Informatika terem', 'Projektor'),
  ('Informatika terem', 'Okostábla / interaktív tábla'),
  ('Informatika terem', 'Nyomtató'),
  ('Informatika terem', 'Hálózat / Wi-Fi'),
  ('Gépész terem', 'Fúrógép'),
  ('Gépész terem', 'Esztergapad'),
  ('Gépész terem', 'Marógép'),
  ('Gépész terem', 'CNC gép'),
  ('Gépész terem', 'Hegesztőgép'),
  ('Gépész terem', 'Köszörű'),
  ('Gépész terem', 'Kompresszor'),
  ('Gépész terem', 'Elszívó / szellőzés'),
  ('Gépész terem', 'Szerszám / mérőeszköz'),
  ('Osztályterem', 'Projektor'),
  ('Osztályterem', 'Okostábla / interaktív tábla'),
  ('Osztályterem', 'Számítógép'),
  ('Osztályterem', 'Tábla'),
  ('Osztályterem', 'Pad'),
  ('Osztályterem', 'Szék'),
  ('Osztályterem', 'Világítás'),
  ('Osztályterem', 'Ablak / ajtó')
) as d(room, name) on d.room = r.name
where not exists (select 1 from public.devices x where x.room_id = r.id and x.name = d.name);
