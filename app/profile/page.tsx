"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { useLibraryTheme } from "@/lib/theme/theme-context";
import { loadBooks } from "@/lib/profile/library-store";
import { loadFeatured, saveFeatured } from "@/lib/profile/featured-store";
import { pullLibrary, pushLibrary, flushLibrary, resetSync } from "@/lib/sync/library-sync";
import { FeaturedBookPicker } from "@/components/profile/FeaturedBookPicker";
import { FeaturedSlot } from "@/components/profile/FeaturedSlot";
import { ShareLibrary } from "@/components/profile/ShareLibrary";
import { ProfileName } from "@/components/profile/ProfileName";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { signOut } from "@/lib/auth/auth";
import { loadAccount, type Account } from "@/lib/profile/account";
import { ensureSlug } from "@/lib/profile/slug";
import { Button } from "@/components/ui/Button";
import { ThemedFrame } from "@/components/theme/ThemedFrame";
import type { Book } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { theme, themeId } = useLibraryTheme();
  const [leaving, setLeaving] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [featured, setFeatured] = useState<(string | null)[]>([null, null, null, null]);
  const [picking, setPicking] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    setBooks(loadBooks() ?? []);
    setFeatured(loadFeatured());
    setLoaded(true);
    loadAccount().then(setAccount);
    ensureSlug().then(setSlug);
    // the account's copy of the shelf and the pinned four, once it arrives
    pullLibrary().then((doc) => {
      if (doc?.books) setBooks(doc.books);
      if (doc?.featured) setFeatured(doc.featured);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveFeatured(featured);
    pushLibrary({ featured });
  }, [featured, loaded]);

  const bookFor = (id: string | null) => books.find((b) => b.id === id) ?? null;

  /**
   * Ends the session and returns to the door. What is on the shelves is
   * deliberately left alone: signing out is not the same as starting over.
   */
  async function handleLogout() {
    setLeaving(true);
    // anything still queued goes up before the session that owns it ends
    await flushLibrary();
    await signOut();
    resetSync();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-gallery px-6 py-12 sm:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 font-body text-sm text-gallery-ink/60 transition-colors hover:text-gallery-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back to your library
        </Link>

        <header className="mt-10 flex flex-wrap items-center gap-5">
          <ProfileAvatar
            avatarUrl={account?.avatarUrl ?? null}
            locked={account?.provider === "google"}
            onChange={(url) => setAccount((prev) => (prev ? { ...prev, avatarUrl: url } : prev))}
          />
          <div className="min-w-0">
            <ProfileName
              accountName={account?.name ?? null}
              locked={account?.provider === "google"}
            />
            <p className="mt-1 font-body text-sm text-gallery-ink/60">
              {account?.email ? `${account.email} · ` : ""}
              {theme.name} · {books.length} books
            </p>
          </div>

          {/* signing out belongs with the identity it ends, not at the far
              bottom of the page under everything else */}
          <div className="ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              loading={leaving}
              className="px-5 py-2.5 text-sm"
              icon={<LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
            >
              Log out
            </Button>
          </div>
        </header>

        <section className="mt-12">
          <h2 className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-gallery-ink/70">
            Featured books
          </h2>

          {/* the frame echoes the add-book card, so the two read as one product */}
          {/* the padding lives on the grid, not on the frame: cozy room's
              frame is a browser window that draws its own edge, and padding
              out there reads as a second card around it */}
          <ThemedFrame themeId={themeId} className="mt-4 shadow-token">
            <div className="grid grid-cols-2 gap-5 p-6 sm:grid-cols-4 sm:gap-6 sm:p-8">
              {featured.map((id, slot) => (
                <FeaturedSlot
                  key={slot}
                  book={bookFor(id)}
                  onChoose={() => setPicking(slot)}
                  onRemove={() =>
                    setFeatured((prev) => prev.map((v, i) => (i === slot ? null : v)))
                  }
                />
              ))}
            </div>
          </ThemedFrame>
        </section>

        <section className="mt-14 border-t border-gallery-ink/10 pt-10">
          <ShareLibrary slug={slug} />
        </section>

      </div>

      {picking !== null && (
        <FeaturedBookPicker
          books={books}
          taken={featured}
          onPick={(book) => {
            setFeatured((prev) => prev.map((v, i) => (i === picking ? book.id : v)));
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      )}
    </main>
  );
}
