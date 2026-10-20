-- Order flags: tickets sent to the customer / order transferred to Google Sheets
alter table public.orders add column if not exists sent boolean not null default false;
alter table public.orders add column if not exists exported boolean not null default false;
