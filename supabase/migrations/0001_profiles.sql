-- Profile row per auth user, holding the chosen library mood.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  theme_id text not null default 'cozy-room',
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are insertable by their owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles are updatable by their owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
