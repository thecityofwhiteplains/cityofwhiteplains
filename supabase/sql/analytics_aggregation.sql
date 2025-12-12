-- Creates a rollup table and a cron job to aggregate analytics_events nightly.
-- Note: pg_cron must be installed in the Supabase project. The statement below
-- installs it into the `extensions` schema (Supabase’s allowed schema for cron).

-- Install pg_cron (safe to re-run)
create extension if not exists pg_cron with schema extensions;

-- 1) Daily rollup table
create table if not exists analytics_daily (
  event_date date not null,
  route text not null,
  event text not null,
  count integer not null,
  primary key (event_date, route, event)
);

-- 2) Refresh function (aggregates the past N days; default 1)
create or replace function refresh_analytics_daily(days_back integer default 1)
returns void
language plpgsql
as $$
begin
  insert into analytics_daily (event_date, route, event, count)
  select
    date(created_at) as event_date,
    coalesce(route, '(none)') as route,
    event,
    count(*) as count
  from analytics_events
  where created_at >= (current_date - (days_back || ' days')::interval)
    and created_at < current_date
  group by event_date, route, event
  on conflict (event_date, route, event)
  do update set count = excluded.count;
end;
$$;

-- 3) Schedule nightly at 3:30am UTC (adjust as needed)
-- Note: Supabase includes pg_cron; run this once to register the job.
select
  extensions.cron.schedule(
    'analytics_daily_rollup',
    '30 3 * * *',
    $$select refresh_analytics_daily(2);$$
  );
