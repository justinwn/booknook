-- One library document per reader.
--
-- The whole collection lives in a single JSONB column rather than a normalised
-- `books` table. A personal library is read and written as a whole — the app
-- never queries "all books rated 4 by anyone" — so a document keeps the
-- schema in TypeScript where the shapes already are, and makes a save one
-- round trip instead of a diff. The cost is last-write-wins between two
-- devices editing at the same moment, which is the right trade here.

create table if not exists public.libraries (
  id uuid primary key references auth.users (id) on delete cascade,
  -- { books: [...], featured: [...], reminders: [...], displayName: "" }
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.libraries enable row level security;

drop policy if exists "libraries are readable by their owner" on public.libraries;
create policy "libraries are readable by their owner"
  on public.libraries for select
  using (auth.uid() = id);

drop policy if exists "libraries are insertable by their owner" on public.libraries;
create policy "libraries are insertable by their owner"
  on public.libraries for insert
  with check (auth.uid() = id);

drop policy if exists "libraries are updatable by their owner" on public.libraries;
create policy "libraries are updatable by their owner"
  on public.libraries for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- updated_at is maintained by the database, not by the client, so a device
-- with a wrong clock cannot claim to be the newest writer.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists libraries_touch_updated_at on public.libraries;
create trigger libraries_touch_updated_at
  before update on public.libraries
  for each row execute function public.touch_updated_at();
