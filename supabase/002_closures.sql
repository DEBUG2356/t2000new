-- Calendar closures (whole days or single time slots) and generated time slots.

create table if not exists public.closures (
  product_id integer not null references public.products (id) on delete cascade,
  date date not null,
  slot text not null default '',          -- '' = the whole day is closed, otherwise "09:30"
  created_at timestamptz not null default now(),
  primary key (product_id, date, slot)
);
alter table public.closures enable row level security;

-- opening hours used to generate the time slots (first slot, last slot, step in minutes)
alter table public.products add column if not exists slot_from text;
alter table public.products add column if not exists slot_to text;
alter table public.products add column if not exists slot_step integer;

-- fast per-product/day lookups for the admin calendar
create index if not exists orders_product_date_idx on public.orders (product_id, date);

-- language keys of every product (light query for the admin product list)
create or replace function public.product_langs() returns table (id integer, k text[]) language sql stable as $$
  select p.id, array(select jsonb_object_keys(p.i18n)) from public.products p
$$;
revoke execute on function public.product_langs() from anon, authenticated;
