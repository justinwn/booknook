/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * `next dev` and `next build` share `.next` by default, so building while
   * the dev server is up swaps the chunks out from under its manifest — it
   * then serves 404s for its own assets until it is restarted. Setting
   * NEXT_DIST_DIR sends a build somewhere else so the two can't collide.
   * Unset, which is how Vercel runs it, nothing changes.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // cover art comes straight from the metadata providers
    remotePatterns: [
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "books.google.com" },
      { protocol: "https", hostname: "books.googleusercontent.com" },
    ],
  },
};
export default nextConfig;

