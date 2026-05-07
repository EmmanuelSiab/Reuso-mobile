-- Adds optional size / measurement support for fashion and accessories.

alter table public.listings
  add column if not exists size text;

