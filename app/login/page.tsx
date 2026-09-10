"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginBackdrop } from "@/components/login/LoginBackdrop";
import { LoginSound } from "@/components/login/LoginSound";
import { Wordmark } from "@/components/brand/Wordmark";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, isSupabaseConfigured } from "@/lib/auth/auth";
import { startEmptyLibrary } from "@/lib/profile/library-store";
import { MadeBy } from "@/components/brand/MadeBy";

type Mode = "sign-in" | "sign-up";
type Errors = { email?: string; password?: string; form?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(mode: Mode, email: string, password: string): Errors {
  const errors: Errors = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(email)) errors.email = "That doesn't look like an email address.";

  if (!password) errors.password = "Enter your password.";
  else if (mode === "sign-up" && password.length < 8)
    errors.password = "Use at least 8 characters.";

  return errors;
}

function LoginScreen() {
  /**
   * The book only needs its 3D transforms while it is opening. Once it has,
   * they come off: a lasting 3D transform inside an `overflow: hidden` box
   * puts Chrome's hit testing out of step with what is painted, and the form
   * on the right page stops taking clicks.
   */
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setOpened(true);
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const callbackError = searchParams.get("error");

  function revalidate(next: { email?: string; password?: string }) {
    const merged = { email, password, ...next };
    const found = validate(mode, merged.email, merged.password);
    setErrors((prev) => ({
      form: prev.form,
      email: touched.email ? found.email : prev.email,
      password: touched.password ? found.password : prev.password,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(mode, email, password);
    setTouched({ email: true, password: true });
    if (found.email || found.password) {
      setErrors(found);
      return;
    }

    setErrors({});
    setSubmitting(true);
    const result =
      mode === "sign-up"
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);
    setSubmitting(false);

    if (!result.ok) {
      setErrors({ form: result.message });
      return;
    }
    // A new account starts with empty shelves; signing in keeps whatever is
    // already stored for this browser. A new account also has no room yet, so
    // it goes to the picker; a returning reader goes straight to their
    // library, because they answered that question once already.
    if (mode === "sign-up") {
      startEmptyLibrary();
      router.push("/onboarding/theme");
      return;
    }
    router.push("/library");
  }

  async function handleGoogle() {
    setErrors({});
    setGoogleLoading(true);
    const next = mode === "sign-up" ? "/onboarding/theme" : "/library";
    if (mode === "sign-up") startEmptyLibrary();
    const result = await signInWithGoogle(next);
    if (!result.ok) {
      setGoogleLoading(false);
      // Demo mode (no Supabase project attached) still walks the flow.
      if (!isSupabaseConfigured) {
        router.push(next);
        return;
      }
      setErrors({ form: result.message });
    }
  }

  return (
    <main data-theme="cozy-room" className="relative min-h-screen overflow-hidden">
      {/* note paper rather than a room: the book is the subject here, and a
          playing wallpaper behind it was competing with it */}
      <LoginBackdrop />

      {/* THE BOOK
          It arrives closed and tilted, straightens, and its cover swings open
          to the left. The leaf that opens is the left page: it carries the
          name and the pitch, and the form waits on the right page beneath it.
          Below `lg` there is no room for a spread, so the pages stack as one
          card and nothing rotates. */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl items-center justify-center px-5 py-14">
        <div className="w-full">
          {/* the perspective lives on this wrapper rather than further out, so
              the sound toggle can sit at the book's own top corner without
              joining the 3D subtree the book rotates inside */}
          <div
            className="relative mx-auto w-full max-w-[46rem] lg:max-w-[54rem]"
            style={opened ? undefined : { perspective: "2200px" }}
          >
            <LoginSound opened={opened} className="absolute left-3 top-3 z-30 shadow-sm" />

            <div
              className={`w-full ${opened ? "" : "animate-book-straighten"}`}
              style={opened ? undefined : { transformStyle: "preserve-3d" }}
            >
            <div
              className={`relative flex flex-col overflow-hidden rounded-token-lg lg:flex-row ${
                opened
                  ? "shadow-[0_40px_90px_-30px_rgba(0,0,0,0.75)]"
                  : "shadow-[0_40px_90px_-30px_rgba(0,0,0,0.75)] lg:shadow-none"
              }`}
            >
              {/* LEFT PAGE — the leaf that opens. Its outer face is the front
                  cover, its inner face is the name and the pitch. */}
              <div
                // z-10 so the folded leaf paints over the right page rather
                // than behind it: the flex row is a flat context, where
                // painting order is DOM order. No backface-visibility on the
                // leaf itself — hiding its back face would take both faces.
                className={`relative z-10 w-full px-8 py-10 sm:px-9 lg:w-1/2 ${
                  opened ? "" : "animate-book-leaf-open"
                }`}
                onAnimationEnd={() => setOpened(true)}
                style={
                  opened
                    ? { background: "linear-gradient(120deg, #fdfaf3, #f3ece0)" }
                    : {
                        transformOrigin: "right center",
                        transformStyle: "preserve-3d",
                        background: "linear-gradient(120deg, #fdfaf3, #f3ece0)",
                      }
                }
              >
                <div
                  className="flex h-full flex-col items-center justify-center gap-6 text-center"
                  style={opened ? undefined : { backfaceVisibility: "hidden" }}
                >
                  <Wordmark className="text-3xl text-gallery-ink" />

                  <p className="max-w-[20rem] font-body text-[13px] leading-relaxed text-gallery-ink/60">
                    Build a library you actually want to sit in. Track what you read, keep your
                    reading list and reminders to hand, and let a small companion nudge you to
                    drink water, stretch, and take a break.
                  </p>

                  {/* a note from the person who made it, in her own hand */}
                  <div className="animate-book-settle mt-6 max-w-[21rem] text-left">
                    <p
                      className="text-[15px] leading-[1.4] text-[#2f2a24]"
                      style={{ fontFamily: "var(--font-cedarville)" }}
                    >
                      I hope this inspires many readers in recording and sharing their book
                      collection. Thank you to my partner and Gem Win for the support.
                    </p>
                    <p
                      className="mt-3 text-right text-[17px] leading-snug text-[#2f2a24]"
                      style={{ fontFamily: "var(--font-cedarville)" }}
                    >
                      Love, Justine
                    </p>
                  </div>
                </div>

                {/* the outside of the same leaf: what a closed book shows.
                    Gone once the book is open, so it can never intercept a
                    click meant for the page underneath. */}
                {!opened && (
                <div
                  className="absolute inset-0 hidden flex-col items-center justify-center gap-3 lg:flex"
                  style={{
                    transform: "rotateY(180deg)",
                    backfaceVisibility: "hidden",
                    // leather: a warm brown board with the grain darkening
                    // toward the spine
                    background: "linear-gradient(150deg, #7b4f2c, #4a2d17 62%, #3a2312)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: [
                      // the binding edge, and the warmth the leather catches
                      "inset -14px 0 26px -18px rgba(0,0,0,0.9)",
                      "inset 0 0 60px rgba(255,214,170,0.07)",
                      // a shut book casts its own shadow; the spread's would
                      // fall around the empty half beside it
                      "0 40px 90px -30px rgba(0,0,0,0.75)",
                    ].join(","),
                  }}
                  aria-hidden
                >
                  {/* THE PAGE BLOCK — the fore-edge, opposite the binding. The
                      cover overhangs it top and bottom, which is what makes a
                      closed book read as thick rather than as a flat panel.
                      Local coordinates are mirrored: this face is rotated
                      180deg, so `left-0` here is the far edge on screen. */}
                  <span
                    className="absolute inset-y-[10px] right-0 w-[20px]"
                    style={{
                      background:
                        "repeating-linear-gradient(90deg, #faf4e6 0 2px, #cfc1a4 2px 3px)",
                      borderRadius: "2px 8px 8px 2px",
                      boxShadow: "inset -5px 0 9px -3px rgba(0,0,0,0.45), inset 6px 0 10px -6px rgba(0,0,0,0.5)",
                    }}
                  />

                  <Wordmark className="text-2xl text-[#f0dcc2]" />
                  <span className="h-px w-16 bg-[#f0dcc2]/30" />
                  <span className="font-body text-[10px] uppercase tracking-[0.22em] text-[#f0dcc2]/55">
                    Your library
                  </span>
                </div>
                )}
              </div>

              {/* THE GUTTER — where the two pages meet */}
              <div
                className="hidden w-px shrink-0 lg:block"
                style={{
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.16), rgba(0,0,0,0.05) 45%, rgba(255,255,255,0.6))",
                }}
                aria-hidden
              />

              {/* RIGHT PAGE — the form */}
              <div className="relative flex w-full flex-col justify-center bg-white px-8 py-10 sm:px-10 lg:w-1/2">
                <div className={`mx-auto w-full max-w-[19rem] ${opened ? "" : "animate-book-content-in"}`}>
                  <h1 className="font-display text-[1.4rem] leading-tight text-gallery-ink">
                    {mode === "sign-up" ? "Create an account" : "Login"}
                  </h1>
                  <p className="mt-1 font-body text-[13px] text-gallery-ink/55">
                    {mode === "sign-up"
                      ? "A few details and your shelves are yours."
                      : "Welcome back! Please enter your details."}
                  </p>

                  <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-4">
                    <TextField
                      label="Email"
                      tone="on-light"
                      variant="boxed"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        revalidate({ email: e.target.value });
                      }}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, email: true }));
                        setErrors((prev) => ({ ...prev, email: validate(mode, email, password).email }));
                      }}
                      error={errors.email}
                    />
                    <TextField
                      label="Password"
                      tone="on-light"
                      variant="boxed"
                      type="password"
                      name="password"
                      autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        revalidate({ password: e.target.value });
                      }}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, password: true }));
                        setErrors((prev) => ({ ...prev, password: validate(mode, email, password).password }));
                      }}
                      error={errors.password}
                    />

                    {(errors.form || callbackError) && (
                      <p role="alert" className="font-body text-sm text-[#b4433a]">
                        {errors.form ?? callbackError}
                      </p>
                    )}

                    <Button type="submit" variant="solid" loading={submitting} className="mt-1 w-full">
                      {mode === "sign-up" ? "Create your library" : "Continue with Email"}
                    </Button>
                  </form>

                  <div className="mt-3">
                    <GoogleButton onClick={handleGoogle} loading={googleLoading} className="w-full">
                      {mode === "sign-up" ? "Sign up with Google" : "Continue with Google"}
                    </GoogleButton>
                  </div>

                  <p className="mt-6 text-center font-body text-sm text-gallery-ink/65">
                    {mode === "sign-up" ? "Already have a library?" : "Don't have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === "sign-up" ? "sign-in" : "sign-up");
                        setErrors({});
                        setTouched({});
                      }}
                      className="font-semibold text-[#3b6cd4] underline-offset-4 hover:underline"
                    >
                      {mode === "sign-up" ? "Sign in" : "Sign up"}
                    </button>
                  </p>

                  {/* nothing to say once accounts are real; the demo-mode line
                      stays, because signing up into nothing needs saying */}
                  {!isSupabaseConfigured && (
                    <p className="mt-2 text-center font-body text-[11px] leading-relaxed text-gallery-ink/45">
                      Supabase isn&apos;t connected yet, so accounts run in demo mode.
                    </p>
                  )}
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 pb-6 text-center">
        {/* the page is paper now, so the credit is ink rather than light */}
        <MadeBy className="text-[11px] text-gallery-ink/45" linkClassName="text-gallery-ink/70" />
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <LoginScreen />
    </Suspense>
  );
}
