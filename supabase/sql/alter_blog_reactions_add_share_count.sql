-- Adds a share_count column to track share button clicks on blog posts.
-- Safe to run multiple times thanks to IF NOT EXISTS.
alter table if exists blog_reactions
  add column if not exists share_count integer not null default 0;

-- Optional: backfill nulls to zero if the column already existed without a default.
update blog_reactions
  set share_count = coalesce(share_count, 0)
  where share_count is null;
