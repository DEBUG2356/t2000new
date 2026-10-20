-- Combo tickets: a combo product points to its base products; one combo purchase becomes one
-- order row per base product (own date / time slot), linked by group_ref.

alter table public.products add column if not exists components integer[] not null default '{}';

alter table public.orders add column if not exists group_ref text;
alter table public.orders add column if not exists combo_id integer;
alter table public.orders add column if not exists combo_name text;
update public.orders set group_ref = ref where group_ref is null;

-- several rows (combo parts) share one Stripe Checkout session
alter table public.orders drop constraint if exists orders_stripe_session_id_key;
create index if not exists orders_stripe_session_idx on public.orders (stripe_session_id);
create index if not exists orders_group_ref_idx on public.orders (group_ref);

-- the existing combos of the archive and their base tickets
update public.products set components = '{27,12}' where id = 47;        -- Saint Chapelle + Pantheon
update public.products set components = '{29,27}' where id = 48;        -- Conciergerie + Saint Chapelle
update public.products set components = '{137,136}' where id = 50;      -- 1-hour boat tour + Eiffel Tower
update public.products set components = '{75,76}' where id = 77;        -- Loro Park + Siam Park
update public.products set components = '{87,88}' where id = 89;        -- Sagrada Familia + Güell Park
update public.products set components = '{135,136,137}' where id = 138; -- Louvre + Eiffel + Seine
update public.products set components = '{136,137}' where id = 140;     -- Eiffel + Seine
update public.products set components = '{135,136}' where id = 141;     -- Louvre + Eiffel
update public.products set components = '{135,137}' where id = 142;     -- Louvre + Seine
