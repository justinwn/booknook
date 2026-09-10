import { getSupabaseClient } from "@/lib/supabase/client";

const BUCKET = "avatars";

export type UploadAvatarResult = { url: string } | { error: string };

/**
 * Uploads a reader's own photo to Supabase Storage and points their identity
 * at it, so it flows through the same avatar_url the profile page already
 * reads off Google — nothing downstream needs to know where the picture
 * came from. One fixed path per reader (upsert), so a new photo replaces the
 * last one instead of leaving the old file behind unlinked.
 */
export async function uploadAvatar(file: File): Promise<UploadAvatarResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Not connected to an account." };

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { error: "You're not signed in." };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (uploadError) return { error: uploadError.message };

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // the path is unchanged on a re-upload, so a cache-busting suffix is what
  // makes the browser (and anyone else's cached copy) fetch the new file
  // instead of the one that used to live at this same URL
  const url = `${pub.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: url } });
  if (updateError) return { error: updateError.message };

  return { url };
}
