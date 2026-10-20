-- Tickets 2000 – Supabase schema. Run once in the Supabase SQL editor.

create table if not exists public.products (
  id integer primary key,
  active boolean not null default true,
  sort integer not null default 0,
  categories text[] not null default '{}',      -- category ids (paris, barcelona, top-offers …)
  primary_category text,                         -- canonical URL category
  image text,                                    -- cover image
  gallery text[] not null default '{}',
  rating numeric(2,1),
  review_count integer,
  bars integer[],                                -- review count per 5..1 stars
  lat double precision,
  lng double precision,
  props jsonb not null default '[]',             -- card properties [{key, n?}]
  i18n jsonb not null default '{}',              -- per language: title, slug, location, labels, overview, included …
  legacy_urls jsonb not null default '{}',       -- archived URLs per language that must keep working
  reviews jsonb not null default '[]',
  tickets jsonb not null default '[]',           -- [{type: adult|senior|youth|child|infant, price, old_price?, age?}]
  min_qty integer not null default 1,
  closed_weekdays integer[] not null default '{}',
  closed_dates text[] not null default '{}',     -- "MM-DD"
  months integer[] not null default '{}',        -- bookable months, empty = all
  time_slots text[] not null default '{}',       -- "09:30" …, empty = no time slot
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled', 'refunded')),
  email text not null,
  name text not null,
  phone text,
  adult integer not null default 0,
  senior integer not null default 0,
  youth integer not null default 0,
  child integer not null default 0,
  infant integer not null default 0,
  date date not null,
  time_slot text,
  product_id integer references public.products (id) on delete set null,
  product_name text not null,
  total numeric(10, 2) not null,
  currency text not null default 'EUR',
  lang text,
  notes text,
  stripe_session_id text unique,
  stripe_payment_intent text,
  paid_at timestamptz
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_date_idx on public.orders (date);

-- Only the server (service role) touches the data; the browser never talks to Supabase directly.
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Public bucket for product images uploaded from the admin panel
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
