# BookNook: Supabase, Google sign-in, and booknook.justinewin.com

Three jobs, in this order. Each one works on its own, so you can stop after
any of them and still have something that runs.

1. Supabase project + database (30 min)
2. Google sign-in (30 min, mostly waiting on Google's console)
3. Deploy to Vercel and point the subdomain at it (30 min, plus DNS propagation)

The project folder is `~/BookNook`.

---

# 1. Supabase

## 1.1 Create the project

1. supabase.com → sign in → **New project**.
2. Name `booknook`, region closest to you, set a database password and save it
   in your password manager. You will not need it for this app, only for
   connecting to Postgres directly.
3. Provisioning takes about two minutes.

## 1.2 Keys into `.env.local`

**Project Settings → API** gives you two values.

| Dashboard label | Environment variable |
| --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| Project API keys → `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

```bash
cd ~/BookNook
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

The `anon` key is meant to ship to the browser; row level security is what
protects the data, not the secrecy of that key. The `service_role` key is the
opposite: never in a `NEXT_PUBLIC_` variable, never in this app.

Restart `npm run dev`. Next.js reads env files only at boot.

**How you know it worked:** the line under the sign-up link on the login page
stops saying "Supabase isn't connected yet".

## 1.3 Run both migrations

**SQL Editor → New query**, paste and run each file in order:

- `supabase/migrations/0001_profiles.sql` — one row per user holding the chosen
  library mood.
- `supabase/migrations/0002_library.sql` — one row per user holding the library
  itself: books, notes, the featured four, reminders, display name.

Then check **Table Editor**: `profiles` and `libraries` both exist and both say
**RLS enabled**. If either says RLS is disabled, stop and re-run that file. An
unprotected table means anyone with the anon key can read every user's shelves.

### What 0002 does, and why it is one JSONB column

`libraries` is `id uuid` + `data jsonb` + `updated_at`. The whole library is one
document rather than a normalised `books` table.

- The app only ever reads and writes the collection as a whole. There is no
  query like "every 4-star book across all users", so a table of rows buys
  nothing.
- The shapes already exist in TypeScript. A document keeps one source of truth
  instead of a schema that has to be migrated every time a book gains a field.
- A save is one round trip.

The cost: two devices editing at the same second are last-write-wins, and the
document should not grow to thousands of books. Both are fine for a personal
library. If you ever want per-book queries or a books-you-both-own feature, that
is the point to normalise it.

## 1.4 Auth URLs

**Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: `http://localhost:3000/auth/callback`

You add the production ones in step 3. The list takes several entries, so add
rather than replace.

## 1.5 Email and password

**Authentication → Providers → Email** is already on. One decision:

- **Confirm email ON** (default) is correct for real use. Supabase's built-in
  mailer is rate limited to a few messages an hour, which is fine for you and
  not fine for traffic. Attach your own SMTP when that matters.
- **Confirm email OFF** makes solo testing faster. Turn it back on before you
  share the link.

---

# 2. Google sign-in

Two consoles. The handoff between them is where this goes wrong.

## 2.1 Google Cloud Console

1. console.cloud.google.com → new project, `BookNook`.
2. **APIs & Services → OAuth consent screen**:
   - User type **External** → Create.
   - App name `BookNook`, your email for support and developer contact.
   - Scopes: keep the defaults (`email`, `profile`, `openid`). Anything more
     triggers Google's verification review.
   - Test users: add your own Google address. While the app is in "Testing"
     only listed addresses can sign in, which is what you want for now.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type **Web application**.
   - **Authorised JavaScript origins**:
     - `http://localhost:3000`
     - `https://booknook.justinewin.com`
   - **Authorised redirect URIs** — this is **Supabase's** callback, not yours:

     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```

     The project ref is the subdomain of your Project URL. This one URI covers
     local and production both, because the browser always goes to Supabase and
     Supabase comes back to whichever site started the flow. Getting it wrong
     produces `redirect_uri_mismatch`, the single most common failure here.
4. Copy the **Client ID** and **Client secret**.

## 2.2 Supabase

**Authentication → Providers → Google** → toggle on, paste both values, Save.
Supabase prints its callback URL on that screen; compare it character for
character with what you pasted into Google.

## 2.3 Test

Private window → login page → **Continue with Google**. You should land on the
mood picker, and **Authentication → Users** should show a new row.

| Symptom | Cause |
| --- | --- |
| `redirect_uri_mismatch` | The URI in Google is not exactly Supabase's callback. Check trailing slash, `http` vs `https`, project ref. |
| "Unsupported provider" | The provider toggle did not save. |
| Round trip succeeds, back at login | Cookie rejected. Use `http://localhost:3000`, never `127.0.0.1` — different origins to the cookie jar. |
| Works for you, "access blocked" for a friend | The consent screen is still in Testing and they are not a listed test user. |

---

# 3. Deploy to booknook.justinewin.com

Vercel, because it is Next.js's own host and the App Router needs no
configuration there. This assumes `justinewin.com` is a domain you already
control.

## 3.1 Get the code into GitHub

The folder is not a git repository yet.

```bash
cd ~/BookNook
git init
printf 'node_modules\n.next\n.env.local\n' >> .gitignore
git add -A
git commit -m "BookNook"
```

Create an **empty private repo** called `booknook` on github.com — no README, no
.gitignore — then:

```bash
git remote add origin git@github.com:<your-username>/booknook.git
git branch -M main
git push -u origin main
```

Confirm `.env.local` is **not** in the pushed files. If it is, remove it, rotate
the anon key in Supabase, and push again.

## 3.2 Import into Vercel

1. vercel.com → sign in with GitHub → **Add New → Project** → import `booknook`.
2. Framework preset detects Next.js. Leave build and output settings alone.
3. **Environment Variables**, before the first deploy — add both to all three
   environments (Production, Preview, Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. You get a `booknook-xxxx.vercel.app` URL. Open it and check the
   login page renders before going further.

## 3.3 Point the subdomain

**Vercel → your project → Settings → Domains → Add** → `booknook.justinewin.com`.

Vercel then shows the DNS record to create. For a subdomain it is a CNAME:

| Type | Name | Value |
| --- | --- | --- |
| CNAME | `booknook` | `cname.vercel-dns.com` |

Add that at whoever hosts DNS for `justinewin.com` (your registrar, or Cloudflare
if you use it). Notes:

- The **Name** is just `booknook`, not the full domain — most registrars append
  the domain for you. If yours wants the whole thing, use
  `booknook.justinewin.com`.
- On **Cloudflare**, set the record to **DNS only** (grey cloud), not Proxied.
  Orange-cloud proxying in front of Vercel breaks the certificate handshake.
- Propagation is usually minutes. Vercel's Domains page flips to **Valid
  Configuration** and issues the certificate on its own.
- Do not touch the apex `justinewin.com` records. A subdomain CNAME leaves your
  main site alone.

## 3.4 Tell Supabase and Google about the new address

Nothing works until this is done, and it is the step people skip.

**Supabase → Authentication → URL Configuration**:

- **Site URL**: `https://booknook.justinewin.com`
- **Redirect URLs** — keep both:
  - `https://booknook.justinewin.com/auth/callback`
  - `http://localhost:3000/auth/callback`

**Google Cloud → Credentials → your OAuth client**:

- **Authorised JavaScript origins**: add `https://booknook.justinewin.com`
- **Authorised redirect URIs**: unchanged. It points at Supabase, not at your
  host.

## 3.5 Open it up

While the Google consent screen is in **Testing**, only your listed test users
can sign in. When you are ready for other people: **OAuth consent screen →
Publish app**. With only the basic scopes there is no verification review.

## 3.6 From then on

`git push` to `main` deploys. Every pull request gets its own preview URL. If a
preview URL needs Google sign-in, add it to Supabase's redirect list —
otherwise use email and password there.

---

# What syncs, and what does not

Once step 1 is done, signing in on a second device brings over:

- books, with their notes, ratings, dates and cover colours
- the featured four on your profile
- reminders
- your display name (unless Google supplies it, in which case Google owns it)
- your library mood, via the `profiles` table

Deliberately **not** synced, because they are properties of the device rather
than of you:

- the ambient mix and its volumes (`librari:ambient`)
- nudge settings and their timers (`librari:wellness*`)

"Quiet on my work laptop, rain at home" is a reasonable thing to want, and
syncing it would read as a bug.

## How the sync behaves

`lib/sync/library-sync.ts` is the whole of it, about 130 lines.

- **Read**: the browser copy paints immediately, then the account's copy
  replaces it. Remote wins when it exists, because it is the copy that followed
  you from another device.
- **Write**: every change writes localStorage straight away and queues a cloud
  push, debounced 700ms. Typing a note is one request, not forty.
- **Ordering**: nothing is pushed until the pull has finished. Without that
  guard, an empty new tab would overwrite a full library in the first second
  after sign-in.
- **Merge**: a push reads the row first, so a patch touching only `books` cannot
  drop the featured shelf that came with it.
- **Failure**: a failed sync warns to the console and gives up until the next
  change. The local copy is intact either way, so nothing interrupts the reader.
- **Sign-out**: anything queued is flushed first, then the session's sync state
  is reset so the next person on this browser cannot write to the last person's
  row.
- **Demo mode**: with no Supabase keys, every one of these is a no-op and
  localStorage is the only copy. The app is fully usable that way.

## Known gaps

- Two devices editing at the same moment: last write wins, no merge.
- No conflict UI, no offline queue that survives a page close.
- The share link on the profile points at `/l/<slug>`, which is not built yet.
  The link is correct but does not resolve.
