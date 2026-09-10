# Librari

A personal digital library — catalog your books, then build a room around them.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

The app runs **without** Supabase attached (demo mode: auth and persistence
are stubbed, everything else is real). To connect a project:

```bash
cp .env.local.example .env.local   # then fill in the two values
```

Apply `supabase/migrations/0001_profiles.sql` to create the `profiles` table
(holds `theme_id`) with row-level security. For Google login, enable the
Google provider in Supabase Auth and add
`<your-origin>/auth/callback` as an authorized redirect URL.

## Architecture

**Design tokens** live in `app/globals.css` as CSS custom properties, grouped
per theme under `[data-theme="..."]`, and are surfaced as Tailwind utilities
in `tailwind.config.ts` (`bg-surface`, `text-ink`, `rounded-token`,
`shadow-token`, `ease-settle`…). No component hardcodes a color, radius, or
shadow. Swapping a theme's variables updates everything downstream.

**Typography is temporary and centralized.** Two self-hosted variable fonts
(Fraunces + Work Sans, via `@fontsource-variable`) are imported in
`app/layout.tsx` and exposed as `--font-display` / `--font-body`. Nothing
else names a font. Self-hosted rather than `next/font/google` because this
network blocks Google's font CDN.

**Themes** (`lib/theme/themes.ts`) define a mood: preview photography, copy,
light/dark character, and a `paper` treatment (stock color, ink, printed
grid/rule pattern, stationery stamps). The paper treatment is what makes a
mood read as a physical material rather than a palette — see `BookNote`.

**Shelves and slots** (`lib/types.ts`, `lib/mock/library.ts`): a slot is a
declared `{x, y, width, height}` region on a shelf, expressed as percentages
of the shelf board. Books and decor anchor to slots. The shelf board is a
tokenized surface, and the room photography behind it is purely ambient —
**the background art is never the layout system**, so either can change
without touching the other.

**Motion** is token-driven: `--ease-settle` (overshoot, for a book landing on
a shelf) and `--ease-gentle` (everything else), with
`prefers-reduced-motion` respected.

## Not yet built

Real book capture (ISBN entry, barcode scanning, cover/metadata lookup),
music and ambient sound, profile, sharing, decor placement UI, and
illustrated decor artwork. The `Add book` control currently places a book
from a small sample pool to exercise the placement + entrance animation.
