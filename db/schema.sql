create extension if not exists pgcrypto;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  email text not null,
  phone text not null,
  pickup_date date not null,
  pickup_time text not null,
  notes text default '',
  total_price integer not null,
  status text not null default 'booked',
  created_at timestamptz not null default now()
);

create table if not exists public.reservation_items (
  id bigint generated always as identity primary key,
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  unit_price integer not null,
  quantity integer not null check (quantity > 0)
);

alter table public.reservations enable row level security;
alter table public.reservation_items enable row level security;

create policy "anon can insert reservations"
on public.reservations
for insert
with check (true);

create policy "anon can insert reservation_items"
on public.reservation_items
for insert
with check (true);
