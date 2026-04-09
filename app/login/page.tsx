import { redirect } from "next/navigation";
import { getSessionFromServerCookies } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSessionFromServerCookies();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-zinc-50 px-6 py-10">
      <div className="absolute left-1/2 top-0 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100 opacity-50 blur-3xl" />
      <div className="absolute bottom-0 right-0 -z-10 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-50 opacity-50 blur-3xl" />

      <section className="relative w-full max-w-md rounded-2xl border border-white/60 bg-white/80 px-8 py-10 shadow-xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
              <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">QZH20 Portal</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Welcome back! Please sign in to view your messages.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
