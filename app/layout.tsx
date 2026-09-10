import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/theme/theme-context";

// TEMPORARY typography pairing — not finalized. Self-hosted (via
// @fontsource-variable) rather than next/font/google so the build has no
// runtime dependency on fonts.googleapis.com/fonts.gstatic.com, which this
// network's egress rules block. Centralized to these two imports plus the
// --font-display / --font-body variables in globals.css — nothing
// downstream references a font name directly, so swapping the pairing
// later is a one-file change.
//
// Fraunces: warm, editorial variable serif with real character (avoids the
// generic SaaS-sans-everywhere look) for headings and hero moments.
// Work Sans: plain, humanist sans for UI and body copy so the editorial
// serif has somewhere to be contrasted against, not competed with.
// Base pairing (app chrome) plus one pairing per theme, used by that theme's
// reading note. All self-hosted — this network blocks Google's font CDN — and
// referenced downstream only through the CSS variables set in globals.css.
import "@fontsource-variable/fraunces/standard.css";
import "@fontsource-variable/fraunces/standard-italic.css";
import "@fontsource-variable/work-sans/wght.css";
import "@fontsource-variable/playfair-display/wght.css";
import "@fontsource-variable/dm-sans/opsz.css";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource-variable/nunito-sans/wght.css";
import "@fontsource-variable/eb-garamond/wght.css";
import "@fontsource-variable/quicksand/wght.css";
import "@fontsource/press-start-2p/400.css";
import "@fontsource/vt323/400.css";
import "@fontsource/cedarville-cursive/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookNook",
  description: "Your personal digital library.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
