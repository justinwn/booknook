import { redirect } from "next/navigation";

export default function RootPage() {
  // ASSUMPTION: no auth/session check exists yet, so the root route just
  // enters the flow at login. Once Supabase Auth is wired up, this becomes
  // a session check that sends returning users straight to /library.
  redirect("/login");
}
