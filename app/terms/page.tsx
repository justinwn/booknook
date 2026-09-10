import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, List } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of service · BookNook",
  description: "The terms you agree to by using BookNook.",
};

const LINK = "font-medium text-gallery-ink underline underline-offset-2 hover:no-underline";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="10 September 2026">
      <Section title="The short version">
        <p>
          BookNook is free, made by one person, and offered as is. Your books and notes are yours.
          Do not use it to break the law or to wreck it for anyone else. It could change or stop
          without notice, so keep anything you would hate to lose somewhere else too.
        </p>
      </Section>

      <Section title="Using BookNook">
        <p>
          By creating an account you agree to these terms. You need to be 13 or older. You are
          responsible for what happens under your account, so keep your sign-in details to yourself.
        </p>
        <p>Do not:</p>
        <List
          items={[
            "use BookNook for anything unlawful, or to store content that is unlawful where you are",
            "upload content that infringes someone else's copyright or other rights",
            "try to reach other people's data, or work around the access rules on the database",
            "scrape it, hammer it with automated requests, or otherwise degrade it for other readers",
            "resell it, or pass it off as your own product",
          ]}
        />
        <p>
          An account doing any of that can be suspended or deleted without notice. In practice this
          is one person with a side project, not a moderation team, so this section is about being
          able to act if something goes wrong rather than about policing anyone.
        </p>
      </Section>

      <Section title="Your content">
        <p>
          The books you record and the notes you write stay yours. No ownership of them is claimed.
          The only permission taken is the one needed to run the service: storing your content,
          showing it back to you, and showing it to anyone you give your share link to.
        </p>
        <p>
          You are responsible for what you write and for who you hand that link to. See the{" "}
          <Link href="/privacy" className={LINK}>
            privacy policy
          </Link>{" "}
          for what is stored and where.
        </p>
      </Section>

      <Section title="What BookNook is made of">
        <p>
          The wallpapers, sprites, ambient sound and typefaces are licensed from their creators for
          use in this app. They are not yours to take from it, and the licences do not travel with
          your account. Book details and cover images come from Open Library and belong to their
          respective rights holders. The BookNook name, wordmark and interface are mine.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          BookNook is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of
          any kind, express or implied, including fitness for a particular purpose and
          non-infringement. It is not promised to be uninterrupted, error free, or permanent, and
          the book data that comes from third parties is not promised to be accurate.
        </p>
      </Section>

      <Section title="Keep your own copy">
        <p>
          Your library is backed up as part of the database it lives in, but this is a free side
          project and no recovery guarantee is offered. If your reading records matter to you, keep
          a copy of your own.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the fullest extent the law allows, BookNook and its maker are not liable for any
          indirect, incidental, special or consequential damages, or for any loss of data, profits
          or goodwill, arising from your use of the service. Where liability cannot be excluded, it
          is limited to the amount you have paid to use BookNook, which is nothing.
        </p>
      </Section>

      <Section title="Ending it">
        <p>
          You can stop using BookNook whenever you like, and email me to have your account and
          everything in it deleted. The service itself may be changed, suspended or discontinued at
          any time; if it is going away for good, reasonable notice will be given so you can take
          your library with you.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of Canada and the province in which the maker
          resides, without regard to conflict of law rules.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          These terms may change. The date at the top changes with them, and continuing to use
          BookNook after that means you accept the new version.
        </p>
      </Section>
    </LegalPage>
  );
}
