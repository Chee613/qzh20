import { redirect } from "next/navigation";
import { getSessionFromServerCookies } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getSessionFromServerCookies();

  if (session) {
    redirect("/dashboard");
  }

  redirect("/#login-section");
}
