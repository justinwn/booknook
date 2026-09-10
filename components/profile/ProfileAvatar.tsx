"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { uploadAvatar } from "@/lib/profile/avatar";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * The circle at the top of the profile. A Google identity brings its own
 * picture, so changing it here would only disagree with the account it came
 * from — that case stays a plain image, same as the name beside it. Everyone
 * else can put their own up.
 */
export function ProfileAvatar({
  avatarUrl,
  locked,
  onChange,
}: {
  avatarUrl: string | null;
  /** true when a provider (Google) already owns the picture */
  locked: boolean;
  onChange: (url: string) => void;
}) {
  const [failed, setFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // picking the same file again should still fire this
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Keep it under 5MB.");
      return;
    }

    setError(null);
    setUploading(true);
    const result = await uploadAvatar(file);
    setUploading(false);

    if ("url" in result) {
      setFailed(false);
      onChange(result.url);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="relative shrink-0">
      {avatarUrl && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div className="h-20 w-20 rounded-full bg-gallery-ink/10" aria-hidden />
      )}

      {!locked && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Change your photo"
            title="Change your photo"
            disabled={uploading}
            className={`absolute inset-0 flex items-center justify-center rounded-full text-white opacity-0 transition-opacity hover:bg-black/40 hover:opacity-100 focus-visible:bg-black/40 focus-visible:opacity-100 ${
              uploading ? "bg-black/40 opacity-100" : ""
            }`}
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.75} />
            ) : (
              <Camera className="h-5 w-5" strokeWidth={1.75} />
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="sr-only"
            aria-label="Upload a profile photo"
          />
        </>
      )}

      {error && (
        <p
          role="alert"
          className="absolute left-1/2 top-full mt-1.5 w-40 -translate-x-1/2 text-center font-body text-[11px] leading-snug text-[#b4433a]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
