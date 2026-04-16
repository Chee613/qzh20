import Image from "next/image";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { getSessionFromServerCookies } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const session = await getSessionFromServerCookies();

  if (!session) {
    redirect("/");
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
    // This exact line ensures they ONLY see their own dedicated messages.
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

  const profilePicPath = `/profiles/${session.loginId}.png`;
  const match = session.loginId.match(/\d+/);
  const bgNumber = match ? match[0] : "1";
  const uploadedBackgroundPath = `/card-backgrounds/bg-${bgNumber}.jpg`;
  const fullBackgroundStyle = {
    backgroundImage: `linear-gradient(120deg, rgba(146, 182, 177, 0.58) 0%, rgba(128, 168, 160, 0.42) 42%, rgba(86, 114, 114, 0.62) 100%), url("${uploadedBackgroundPath}"), url("/image_d57cdc.png")`,
    backgroundSize: "cover, cover, cover",
    backgroundPosition: "center, center, center",
    backgroundRepeat: "no-repeat, no-repeat, no-repeat",
  };

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 font-sans text-white selection:bg-white/25">
      <div className="fixed inset-0 -z-20" style={fullBackgroundStyle} />
      <div className="fixed inset-0 -z-10 bg-black/10 backdrop-blur-[2px]" />

      <header className="sticky top-0 z-40 border-b border-white/20 bg-[#8eb8b5]/20 px-4 py-4 backdrop-blur-md md:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <div className="font-serif text-3xl leading-none text-white">&bull;</div>
          <span className="font-serif text-[1.9rem] font-semibold tracking-wide text-white">clear-path</span>

          <nav className="hidden items-center gap-10 text-xs font-semibold tracking-[0.22em] text-white/90 lg:flex">
            <span>ABOUT</span>
            <span>SERVICES</span>
            <span className="border-b border-white pb-1">STORIES</span>
            <span>JOURNAL</span>
          </nav>

          <div className="[&_button]:rounded-full [&_button]:border-white/60 [&_button]:bg-white/90 [&_button]:px-5 [&_button]:py-2.5 [&_button]:text-xs [&_button]:font-bold [&_button]:uppercase [&_button]:tracking-[0.16em] [&_button]:text-[#2f4f4c] [&_button]:hover:bg-white">
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 pb-8 pt-16 md:pt-20">
        <section className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <h1 className="max-w-4xl font-serif text-[3.6rem] leading-[0.95] tracking-tight text-white drop-shadow-[0_12px_30px_rgba(0,0,0,0.2)] sm:text-[4.6rem] md:text-[5.6rem]">
              A Space That
              <br />
              Holds Your
              <br />
              Messages.
            </h1>
          </div>

          <div className="rounded-3xl border border-white/35 bg-white/18 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl md:p-8">
            <div className="mb-5 flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/60">
                <Image src={profilePicPath} alt="Your Profile" fill className="object-cover" />
              </div>
              <p className="font-serif text-xl italic text-white/95">Dedicated Space</p>
            </div>

            <h2 className="mb-3 font-serif text-3xl leading-tight text-white md:text-4xl">
              Welcome, {session.name || session.loginId}
            </h2>
            <p className="text-base leading-relaxed text-white/88 md:text-lg">
              Every message below is private and only for you. You are viewing your own dedicated
              space, inspired by the same editorial palette as the reference design.
            </p>
          </div>
        </section>

        <section className="mt-14">
          {loadError ? (
            <div className="rounded-2xl border border-red-200/60 bg-red-50/80 p-6 text-center font-serif text-red-700 shadow-lg backdrop-blur-md">
              {loadError}
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-3xl border border-white/40 bg-white/20 py-24 text-center shadow-xl backdrop-blur-xl">
              <p className="font-serif text-2xl italic text-white/90">No messages have been inscribed yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className="group flex flex-col rounded-[2rem] border border-white/50 bg-white/16 p-7 shadow-[0_10px_35px_rgba(0,0,0,0.14)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/22"
                >
                  <div className="mb-5 flex items-start justify-between">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/80">
                      For You Only
                    </p>
                    <span className="font-serif text-5xl leading-none text-white/30">&quot;</span>
                  </div>

                  <p className="mb-7 flex-grow whitespace-pre-wrap text-base font-light leading-loose text-white/95">
                    {message.content}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-white/35 pt-4">
                    <span className="text-sm italic text-white/85">From your teammate</span>
                    <time
                      dateTime={message.created_at}
                      className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75"
                    >
                      {new Date(message.created_at).toLocaleDateString("en-MY", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}