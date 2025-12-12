-- supabase/sql/affiliate_ads.sql
-- Stores affiliate ads/CTAs that admins can manage for placement on Visit/Events pages.

create extension if not exists "pgcrypto";

create table if not exists public.affiliate_ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  link text not null,
  button_text text,
  image_url text,
  placement text not null, -- e.g., visit_lodging, visit_rentals, events_lodging, events_tickets, transport
  partner text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists affiliate_ads_placement_idx on public.affiliate_ads (placement, is_active);

alter table public.affiliate_ads enable row level security;

-- Allow public read of active ads only.
drop policy if exists affiliate_ads_public_select on public.affiliate_ads;
create policy affiliate_ads_public_select
  on public.affiliate_ads
  for select
  to anon
  using (is_active = true);

-- Allow inserts/updates by service role only (handled via Supabase service key in admin APIs).
-- No explicit policy for anon insert/update.

-- Trigger to keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_affiliate_ads_updated_at on public.affiliate_ads;
create trigger set_affiliate_ads_updated_at
before update on public.affiliate_ads
for each row
execute function public.set_updated_at();

-- Safety: ensure newer columns exist when altering an existing table.
alter table public.affiliate_ads
  add column if not exists subtitle text;

alter table public.affiliate_ads
  add column if not exists button_text text;
