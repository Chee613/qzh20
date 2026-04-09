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
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Welcome, {session.name}</h1>
          <p className="mt-1 text-sm text-zinc-600">Login ID: {session.loginId}</p>
        </div>

        <LogoutButton />
      </header>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-medium text-zinc-900">Your Messages</h2>

        {loadError ? (
          <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {loadError}
          </p>
        ) : messages.length === 0 ? (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
            No messages yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((message) => (
              <li key={message.id} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs text-zinc-500">
                  <span>From: {message.author_name || "Anonymous"}</span>
                  <time dateTime={message.created_at}>
                    {new Date(message.created_at).toLocaleDateString("en-MY")}
                  </time>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-800">{message.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
