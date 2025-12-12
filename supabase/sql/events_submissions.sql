-- supabase/sql/events_submissions.sql
-- Stores public event submissions with admin review gating and a public view of approved events.

-- Enable UUIDs if not already present
create extension if not exists "pgcrypto";

create table if not exists public.events_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz,
  location text not null,
  audience text check (audience in ('family', '18plus', '21plus')) default 'family',
  cost text,
  description text,
  accessibility text,
  url text,
  contact_email text not null,
  contact_name text,
  attachments text,
  source text default 'public_form',
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  submitted_at timestamptz default now(),
  approved_at timestamptz,
  last_reviewed_at timestamptz
);

create index if not exists events_submissions_start_at_idx on public.events_submissions (start_at);
create index if not exists events_submissions_status_idx on public.events_submissions (status);

-- Narrow public view of approved events for front-end consumption.
create or replace view public.approved_events as
select
  id,
  title,
  start_at,
  end_at,
  location,
  audience,
  cost,
  description,
  accessibility,
  url,
  source,
  status,
  approved_at
from public.events_submissions
where status = 'approved';

alter table public.events_submissions enable row level security;

-- Allow anyone to insert a submission (status defaults to pending).
drop policy if exists events_submissions_insert_public on public.events_submissions;
create policy events_submissions_insert_public
  on public.events_submissions
  for insert
  to anon
  with check (true);

-- Allow public to read only approved events via the view/table.
drop policy if exists events_submissions_select_public on public.events_submissions;
create policy events_submissions_select_public
  on public.events_submissions
  for select
  to anon
  using (status = 'approved');
