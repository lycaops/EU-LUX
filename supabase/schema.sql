-- EU Luxury Tours & Travels: Supabase / Postgres schema.
-- Authentication, customer bookings, and admin operations use this schema.
-- Anonymous booking inserts are intentionally not allowed.

create extension if not exists "pgcrypto";

-- Profiles (one per auth user) ------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  preferred_lang text not null default 'en' check (preferred_lang in ('en','it','fr','es','de','ar')),
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fleet ------------------------------------------------------------------
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,                       -- e.g. Mercedes-Benz V-Class V250
  plate text unique,
  category text not null default 'van',
  seats int not null default 7,
  luggage int not null default 7,
  image_url text,
  description jsonb not null default '{}',  -- {"en": "...", "it": "..."}
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Tariffs (per vehicle, per service type) --------------------------------
create table if not exists public.tariffs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  service_type text not null check (service_type in ('transfer','hourly','daily','fixed_route')),
  label text not null,
  base_fee numeric(10,2) not null default 0,
  per_km numeric(10,2) not null default 0,
  per_hour numeric(10,2) not null default 0,
  min_fare numeric(10,2) not null default 0,
  night_surcharge_pct numeric(5,2) not null default 0,   -- 22:00-06:00
  holiday_surcharge_pct numeric(5,2) not null default 0,
  vat_pct numeric(5,2) not null default 10,
  active boolean not null default true
);
alter table public.tariffs add column if not exists per_km numeric(10,2) not null default 0;

-- Tour packages ----------------------------------------------------------
create table if not exists public.tour_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  itinerary text not null default '',
  pickup_city text not null default '',
  image_url text not null default '',
  duration_hours numeric(6,2) not null default 1 check (duration_hours > 0),
  price numeric(10,2) not null default 0 check (price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.tour_packages add column if not exists pickup_city text not null default '';
alter table public.tour_packages add column if not exists image_url text not null default '';

-- Fixed routes (airport transfers etc.) ----------------------------------
create table if not exists public.fixed_routes (
  id uuid primary key default gen_random_uuid(),
  origin text not null,
  destination text not null,
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  price numeric(10,2) not null,
  active boolean not null default true
);

-- Extras & charges (child seat, waiting time, tolls, meet & greet...) -----
create table if not exists public.extras (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null,                      -- translated labels
  kind text not null default 'extra' check (kind in ('extra','charge','discount')),
  price numeric(10,2) not null default 0,
  per text not null default 'booking' check (per in ('booking','hour','km','item')),
  active boolean not null default true
);

-- Bookings ---------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default upper(substr(encode(gen_random_bytes(5),'hex'),1,8)),
  customer_id uuid references public.profiles(id) on delete set null,
  guest_name text, guest_email text, guest_phone text,
  vehicle_id uuid references public.vehicles(id),
  tariff_id uuid references public.tariffs(id),
  tour_package_id uuid references public.tour_packages(id) on delete set null,
  tour_package_name text,
  service_type text not null default 'transfer',
  vehicle_name text,
  extras jsonb not null default '[]',
  payment_method text not null default 'pay-later' check (payment_method in ('pay-later','bank','card')),
  pickup_address text not null,
  dropoff_address text not null,
  pickup_at timestamptz not null,
  passengers int not null default 1,
  luggage int not null default 0,
  flight_number text,
  notes text,
  special_request text,
  distance_km numeric(8,2),
  subtotal numeric(10,2) not null default 0,
  vat numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  quote_status text not null default 'none' check (quote_status in ('none','sent','accepted')),
  quote_breakdown jsonb not null default '[]',
  quote_message text,
  quoted_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending','confirmed','assigned','completed','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded')),
  lang text not null default 'en',
  created_at timestamptz not null default now()
);
alter table public.bookings add column if not exists tour_package_id uuid references public.tour_packages(id) on delete set null;
alter table public.bookings add column if not exists tour_package_name text;
alter table public.bookings add column if not exists special_request text;
alter table public.bookings add column if not exists quote_status text not null default 'none' check (quote_status in ('none','sent','accepted'));
alter table public.bookings add column if not exists quote_breakdown jsonb not null default '[]';
alter table public.bookings add column if not exists quote_message text;
alter table public.bookings add column if not exists quoted_at timestamptz;
-- Recreate these guards below, after normalizing legacy booking rows.
drop trigger if exists protect_customer_booking_status on public.bookings;
drop trigger if exists enforce_booking_availability on public.bookings;
update public.bookings b
set vehicle_id = v.id
from public.vehicles v
where b.vehicle_id is null
  and b.vehicle_name = v.name
  and (select count(*) from public.vehicles candidate where candidate.name = b.vehicle_name) = 1;

create or replace function public.unavailable_vehicle_dates(
  p_vehicle_id uuid,
  p_start_date date,
  p_end_date date
) returns table (unavailable_date date)
language sql stable security definer set search_path = '' as $$
  select distinct (b.pickup_at at time zone 'Europe/Rome')::date
  from public.bookings b
  where (b.vehicle_id = p_vehicle_id or (
      b.vehicle_id is null
      and b.vehicle_name = (select v.name from public.vehicles v where v.id = p_vehicle_id)
    ))
    and b.status in ('pending','confirmed','assigned')
    and (b.pickup_at at time zone 'Europe/Rome')::date between p_start_date and p_end_date
  order by 1;
$$;
revoke all on function public.unavailable_vehicle_dates(uuid, date, date) from public, anon, authenticated;
grant execute on function public.unavailable_vehicle_dates(uuid, date, date) to authenticated;

create or replace function public.enforce_booking_availability() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  local_pickup_date date;
begin
  if not public.is_admin() and (
    tg_op = 'INSERT'
    or new.pickup_at is distinct from old.pickup_at
    or new.vehicle_id is distinct from old.vehicle_id
    or (new.status in ('pending','confirmed','assigned') and old.status not in ('pending','confirmed','assigned'))
  ) then
    if new.pickup_at < now() + interval '24 hours' then
      raise exception using errcode = '23514', message = 'Bookings must be made at least 24 hours in advance';
    end if;
  end if;

  if new.status not in ('pending','confirmed','assigned') or new.vehicle_id is null then
    return new;
  end if;

  local_pickup_date := (new.pickup_at at time zone 'Europe/Rome')::date;
  perform pg_advisory_xact_lock(hashtext(new.vehicle_id::text || ':' || local_pickup_date::text));
  if exists (
    select 1
    from public.bookings b
    where (b.vehicle_id = new.vehicle_id or (
        b.vehicle_id is null
        and b.vehicle_name = (select v.name from public.vehicles v where v.id = new.vehicle_id)
      ))
      and b.id is distinct from new.id
      and b.status in ('pending','confirmed','assigned')
      and (b.pickup_at at time zone 'Europe/Rome')::date = local_pickup_date
  ) then
    raise exception using errcode = '23P01', message = 'Vehicle is unavailable on the selected date';
  end if;

  return new;
end; $$;
drop trigger if exists enforce_booking_availability on public.bookings;
create trigger enforce_booking_availability before insert or update of pickup_at, vehicle_id, status
  on public.bookings for each row execute function public.enforce_booking_availability();

create table if not exists public.booking_extras (
  booking_id uuid references public.bookings(id) on delete cascade,
  extra_id uuid references public.extras(id),
  quantity int not null default 1,
  price numeric(10,2) not null,
  primary key (booking_id, extra_id)
);

-- Row level security -------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.tariffs enable row level security;
alter table public.tour_packages enable row level security;
alter table public.fixed_routes enable row level security;
alter table public.extras enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_extras enable row level security;

drop policy if exists "own profile" on public.profiles;
drop policy if exists "update own profile" on public.profiles;
create policy "own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "update own profile" on public.profiles for update using (id = auth.uid() or public.is_admin())
  with check ((id = auth.uid() and role = 'customer') or public.is_admin());

-- Public catalogue: anyone can read active items, only admins write
drop policy if exists "read vehicles" on public.vehicles;
drop policy if exists "admin vehicles" on public.vehicles;
create policy "read vehicles" on public.vehicles for select using (active or public.is_admin());
create policy "admin vehicles" on public.vehicles for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "read tariffs" on public.tariffs;
drop policy if exists "admin tariffs" on public.tariffs;
create policy "read tariffs" on public.tariffs for select using (active or public.is_admin());
create policy "admin tariffs" on public.tariffs for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "read tour packages" on public.tour_packages;
drop policy if exists "admin tour packages" on public.tour_packages;
create policy "read tour packages" on public.tour_packages for select using (active or public.is_admin());
create policy "admin tour packages" on public.tour_packages for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "read routes" on public.fixed_routes;
drop policy if exists "admin routes" on public.fixed_routes;
create policy "read routes" on public.fixed_routes for select using (active or public.is_admin());
create policy "admin routes" on public.fixed_routes for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "read extras" on public.extras;
drop policy if exists "admin extras" on public.extras;
create policy "read extras" on public.extras for select using (active or public.is_admin());
create policy "admin extras" on public.extras for all using (public.is_admin()) with check (public.is_admin());

-- Bookings: customers see and cancel their own, admins manage all
drop policy if exists "own bookings" on public.bookings;
drop policy if exists "create booking" on public.bookings;
drop policy if exists "admin update bookings" on public.bookings;
drop policy if exists "admin delete bookings" on public.bookings;
drop policy if exists "customers update own bookings" on public.bookings;
drop policy if exists "customers remove own bookings" on public.bookings;
create policy "own bookings" on public.bookings for select using (customer_id = auth.uid() or public.is_admin());
create policy "create booking" on public.bookings for insert with check (
  (
    customer_id = auth.uid()
    and status = 'pending'
    and payment_status = 'unpaid'
    and subtotal = 0
    and vat = 0
    and total = 0
    and quote_status = 'none'
    and quote_breakdown = '[]'::jsonb
    and quoted_at is null
  )
  or public.is_admin()
);
create policy "admin update bookings" on public.bookings for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete bookings" on public.bookings for delete using (public.is_admin());
create policy "customers update own bookings" on public.bookings for update
  using (customer_id = auth.uid() and status in ('pending','confirmed'))
  with check (customer_id = auth.uid() and status in ('pending','confirmed','cancelled')
    and quote_status in ('none','sent','accepted'));
create policy "customers remove own bookings" on public.bookings for delete
  using (customer_id = auth.uid() and status in ('pending','cancelled'));

create or replace function public.protect_customer_booking_status() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    if (to_jsonb(new) - 'status' - 'quote_status') is distinct from (to_jsonb(old) - 'status' - 'quote_status')
      or (new.status is distinct from old.status and new.status <> 'cancelled')
      or (new.quote_status is distinct from old.quote_status
        and not (old.quote_status = 'sent' and new.quote_status = 'accepted')) then
      raise exception 'Customers may only cancel bookings or accept a sent quote';
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists protect_customer_booking_status on public.bookings;
create trigger protect_customer_booking_status before update on public.bookings
  for each row execute function public.protect_customer_booking_status();

drop policy if exists "own booking extras" on public.booking_extras;
drop policy if exists "admin booking extras" on public.booking_extras;
create policy "own booking extras" on public.booking_extras for select
  using (exists (select 1 from public.bookings b where b.id = booking_id and (b.customer_id = auth.uid() or public.is_admin())));
create policy "admin booking extras" on public.booking_extras for all using (public.is_admin()) with check (public.is_admin());

-- Seed: first vehicle
insert into public.vehicles (name, category, seats, luggage, description)
select 'Mercedes-Benz V-Class V250', 'van', 7, 7,
       '{"en":"Executive luxury van","it":"Van di lusso executive"}'::jsonb
where not exists (
  select 1 from public.vehicles where name = 'Mercedes-Benz V-Class V250'
);
