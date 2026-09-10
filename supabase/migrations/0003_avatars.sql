-- Storage for a reader's own profile photo.
--
-- Only reachable for an account that owns its name (see ProfileName): a
-- Google identity brings its own picture, and this bucket is where everyone
-- else's upload lands. One object per reader, at `<uid>/avatar.<ext>`, so a
-- new photo replaces the last one instead of accumulating orphans.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- public read: an avatar is meant to be seen wherever the profile is —
-- including a shared library link, which has no session of its own
drop policy if exists "avatar images are publicly readable" on storage.objects;
create policy "avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- write access is scoped to the reader's own folder: the first path segment
-- of the object name must be their own uid
drop policy if exists "readers can upload their own avatar" on storage.objects;
create policy "readers can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "readers can replace their own avatar" on storage.objects;
create policy "readers can replace their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "readers can delete their own avatar" on storage.objects;
create policy "readers can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
