import { redirect } from "next/navigation";

// TEMPORARY: dashboard root → login.
// Once auth + dashboard home are built, swap this to a session-aware redirect
// (logged-in → /dashboard, logged-out → /log-in).
export default function Home() {
  redirect("/log-in");
}
