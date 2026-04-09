import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { getSessionFromServerCookies } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const session = await getSessionFromServerCookies();

  if (!session) {
    redirect("/login");
  }

  let messages: {
    id: string;
    author_name: string | null;
    content: string;
    created_at: string;
  }[] = [];
  let loadError: string | null = null;

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("messages")
      .select("id,author_name,content,created_at")
      .eq("member_id", session.memberId)
      .order("created_at", { ascending: false });

    if (error) {
      loadError = "Unable to load your messages right now.";
    } else {
      messages = data ?? [];
    }
  } catch {
    loadError = "Service configuration is incomplete. Please contact admin.";
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
              <span className="text-sm font-bold">QZH</span>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-zinc-900 sm:text-base">{session.name}</h1>
              <p className="text-xs text-zinc-500">ID: {session.loginId}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">Your Messages</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Words of appreciation from your fellow committee members.
          </p>
        </section>

        {loadError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
            {loadError}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white py-12 text-center shadow-sm sm:py-16">
            <div className="mb-3 rounded-full bg-zinc-100 p-3 text-zinc-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-900">No messages yet</p>
            <p className="mt-1 text-xs text-zinc-500">Check back later for updates.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {messages.map((message) => (
              <article
                key={message.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md sm:p-6"
              >
                <span className="absolute right-3 top-3 text-5xl leading-none text-zinc-100 transition-colors group-hover:text-blue-50 sm:right-4 sm:top-4 sm:text-6xl">
                  &quot;
                </span>

                <p className="relative z-10 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                  {message.content}
                </p>

                <div className="relative z-10 mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-4 sm:mt-6">
                  <span className="text-sm font-medium text-zinc-900">
                    {message.author_name || "Anonymous"}
                  </span>
                  <time dateTime={message.created_at} className="text-xs text-zinc-400">
                    {new Date(message.created_at).toLocaleDateString("en-MY", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
