import { redirect } from "next/navigation";

import { getSessionFromServerCookies } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getSessionFromServerCookies();

  if (session) {
    redirect("/dashboard");
  }

  redirect("/login");
}
