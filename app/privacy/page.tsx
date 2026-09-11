import type { Metadata } from "next";
import { LegalPage, Section, List } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy · BookNook",
  description: "What BookNook collects, where it is stored, and who else can see it.",
};

const LINK = "font-medium text-gallery-ink underline underline-offset-2 hover:no-underline";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="10 September 2026">
      <Section title="The short version">
        <p>
          BookNook is a personal side project, not a business. It has no ads, no analytics, no
          trackers and nothing to sell. What it stores is the library you build in it, and it
          stores that so you can get it back on your next device. Nobody sees your shelves unless
          you hand out your share link.
        </p>
      </Section>

      <Section title="What is collected">
        <List
          items={[
            <>
              <strong className="font-semibold text-gallery-ink">Your account.</strong> Your email
              address, and the name and profile picture your sign-in provider supplies. Signing in
              with Google means Google tells BookNook your name, email and picture, and nothing
              else. Signing up with an email and password means the password is handled by Supabase
              and never reaches BookNook.
            </>,
            <>
              <strong className="font-semibold text-gallery-ink">Your library.</strong> The books
              you add and everything you write about them: titles, authors, ISBNs, cover colours,
              ratings, notes, reading dates, which shelf each one is on, the four you feature, and
              your reminders.
            </>,
            <>
              <strong className="font-semibold text-gallery-ink">Your room settings.</strong> The
              theme you chose and your nudge timers, both kept on your account so they follow you
              between devices. Your ambient sound mix is the exception: it stays in this browser and
              is not sent anywhere, because how loud a room should be is a thing about where you are
              sitting rather than about you.
            </>,
          ]}
        />
        <p>
          There is no analytics package, no advertising network, no session recording, and no
          third-party script watching what you do on the page.
        </p>
      </Section>

      <Section title="Where it is stored">
        <p>
          Your account and your library live in a{" "}
          <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" className={LINK}>
            Supabase
          </a>{" "}
          Postgres database, protected by row level security so a row is only readable and writable
          by the account it belongs to. A copy is also kept in your browser&apos;s local storage,
          which is what makes the shelves appear instantly and keeps them readable offline. Clearing
          your browser data clears that copy, not the one on your account.
        </p>
      </Section>

      <Section title="Who else is involved">
        <List
          items={[
            <>
              <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" className={LINK}>
                Supabase
              </a>{" "}
              hosts the database and handles sign-in.
            </>,
            <>
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer" className={LINK}>
                Vercel
              </a>{" "}
              hosts the site and keeps standard server logs, which include IP addresses.
            </>,
            <>
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className={LINK}>
                Google
              </a>{" "}
              is involved only if you choose to sign in with it.
            </>,
            <>
              <a href="https://openlibrary.org/privacy" target="_blank" rel="noreferrer" className={LINK}>
                Open Library
              </a>{" "}
              supplies book details and cover images. Covers are loaded by your browser directly
              from their servers, so they can see your IP address and which covers you loaded.
            </>,
          ]}
        />
        <p>
          Your data is not sold, rented, or handed to anyone else, and it is not used to train
          anything.
        </p>
      </Section>

      <Section title="Your camera">
        <p>
          Scanning a barcode asks for your camera and reads the code in your browser. No image, no
          video and no frame is uploaded or stored, and the camera stops the moment you close the
          scanner.
        </p>
      </Section>

      <Section title="Sharing your library">
        <p>
          Your profile offers a link to your library. That link is unlisted, not secret: anyone who
          has it can see your shelves and read your notes, and search engines could index it if you
          post it somewhere public. They cannot change anything. Do not share the link if your notes
          are private.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          The only cookie is the session cookie that keeps you signed in. There are no advertising
          or analytics cookies, which is why there is no cookie banner.
        </p>
      </Section>

      <Section title="Your data, and getting rid of it">
        <p>
          You can edit or delete any book at any time, and clear a whole shelf from the shelf
          toolbar. There is no self-serve account deletion yet. Email me and your account and
          everything in it will be deleted, usually within a few days. Ask and you will also get a
          copy of what is stored about you.
        </p>
        <p>
          Depending on where you live you may have rights over your personal information under laws
          such as PIPEDA in Canada, the GDPR in the EU and UK, or the CCPA in California. Whichever
          applies to you, the answer here is the same: ask and it will be honoured.
        </p>
      </Section>

      <Section title="Children">
        <p>
          BookNook is not directed at children under 13, and accounts are not knowingly created for
          them. If you believe a child has an account here, email me and it will be removed.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If this policy changes in a way that affects what is collected or who it is shared with,
          the date at the top changes and the change will be described here.
        </p>
      </Section>
    </LegalPage>
  );
}
