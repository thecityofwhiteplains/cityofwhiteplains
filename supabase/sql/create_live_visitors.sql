-- Live visitor presence table (best-effort, privacy-light).
-- Stores approximate geo + route with a rolling last_seen timestamp.

create table if not exists public.live_visitors (
  session_id text primary key,
  route text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

create index if not exists live_visitors_last_seen_idx on public.live_visitors (last_seen desc);

