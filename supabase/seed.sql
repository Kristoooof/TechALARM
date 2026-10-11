-- Minta termek és eszközök (később cserélhető a valós adatokra az admin felületen)
with r as (
  insert into public.rooms (name, sort_order) values
    ('Gépműhely', 1),
    ('CNC labor', 2),
    ('Hegesztő műhely', 3),
    ('Pneumatika labor', 4),
    ('Számítástechnika terem', 5),
    ('Tanterem 101', 6)
  on conflict (name) do nothing
  returning id, name
)
insert into public.devices (room_id, name, inventory_code)
select r.id, d.name, d.code
from r
join (values
  ('Gépműhely', 'Fúrógép', 'GM-001'),
  ('Gépműhely', 'Esztergapad', 'GM-002'),
  ('Gépműhely', 'Marógép', 'GM-003'),
  ('CNC labor', 'CNC eszterga', 'CNC-001'),
  ('CNC labor', 'CNC maró', 'CNC-002'),
  ('Hegesztő műhely', 'Hegesztőgép', 'HEG-001'),
  ('Hegesztő műhely', 'Elszívó', 'HEG-002'),
  ('Pneumatika labor', 'Kompresszor', 'PN-001'),
  ('Pneumatika labor', 'Pneumatikus oktatókészlet', 'PN-002'),
  ('Számítástechnika terem', 'Számítógép 1', 'SZT-001'),
  ('Számítástechnika terem', 'Számítógép 2', 'SZT-002'),
  ('Számítástechnika terem', 'Projektor', 'SZT-010'),
  ('Tanterem 101', 'Projektor', 'T101-001'),
  ('Tanterem 101', 'Okostábla', 'T101-002')
) as d(room, name, code) on d.room = r.name;
