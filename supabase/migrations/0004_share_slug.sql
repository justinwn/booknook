-- The short name in a reader's public share link (/l/<slug>). Nullable until
-- one is generated on first use; unique once set, so two readers can never
-- collide on the same link.
alter table public.profiles add column if not exists slug text unique;
