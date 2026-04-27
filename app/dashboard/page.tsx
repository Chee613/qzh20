import Image from "next/image";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { getSessionFromServerCookies } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const editorialSerifClass = "font-serif";
const MEMBER_NICKNAMES: Partial<Record<string, string>> = {};

type DashboardMessage = {
  id: string;
  author_name: string | null;
  content: string;
  created_at: string;
};

const messageDateFormatter = new Intl.DateTimeFormat("en-MY", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatMessageDate(dateInput: string) {
  return messageDateFormatter.format(new Date(dateInput));
}

function buildDashboardBackgroundStyle(sessionLoginId: string, backgroundNumber: string) {
  const uploadedBackgroundCandidates = [
    `/dashboard-backgrounds/${sessionLoginId}.webp`,
    `/dashboard-backgrounds/${sessionLoginId}.png`,
    `/dashboard-backgrounds/${sessionLoginId}.jpg`,
    `/dashboard-backgrounds/${sessionLoginId}.jpeg`,
  ];
  const fallbackBackgroundCandidates = [
    `/card-backgrounds/bg-${backgroundNumber}.jpg`,
    "/image_d57cdc.png",
  ];
  const backgroundLayers = [
    "linear-gradient(118deg, rgba(218, 229, 221, 0.88) 0%, rgba(169, 197, 196, 0.52) 38%, rgba(63, 87, 88, 0.72) 100%)",
    "radial-gradient(circle at 18% 82%, rgba(254, 239, 188, 0.32), transparent 36%)",
    "radial-gradient(circle at 86% 22%, rgba(139, 212, 221, 0.24), transparent 34%)",
    ...uploadedBackgroundCandidates.map((path) => `url("${path}")`),
    ...fallbackBackgroundCandidates.map((path) => `url("${path}")`),
  ];

  return {
    backgroundImage: backgroundLayers.join(", "),
    backgroundSize: [
      "cover",
      "56rem 56rem",
      "48rem 48rem",
      ...uploadedBackgroundCandidates.map(() => "cover"),
      ...fallbackBackgroundCandidates.map(() => "cover"),
    ].join(", "),
    backgroundPosition: [
      "center",
      "12% 86%",
      "88% 18%",
      ...uploadedBackgroundCandidates.map(() => "center"),
      ...fallbackBackgroundCandidates.map(() => "center"),
    ].join(", "),
    backgroundRepeat: [
      "no-repeat",
      "no-repeat",
      "no-repeat",
      ...uploadedBackgroundCandidates.map(() => "no-repeat"),
      ...fallbackBackgroundCandidates.map(() => "no-repeat"),
    ].join(", "),
  };
}

export default async function DashboardPage() {
  const session = await getSessionFromServerCookies();

  if (!session) {
    redirect("/");
  }

  let message: DashboardMessage | null = null;
  let loadError: string | null = null;

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("messages")
      .select("id,author_name,content,created_at")
      .eq("member_id", session.memberId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      loadError = "Unable to load your message right now.";
    } else {
      message = data?.[0] ?? null;
    }
  } catch {
    loadError = "Service configuration is incomplete. Please contact admin.";
  }

  const profilePicPath = `/profiles/${session.loginId}.png`;
  const match = session.loginId.match(/\d+/);
  const backgroundNumber = match ? match[0] : "1";
  const backgroundStyle = buildDashboardBackgroundStyle(session.loginId, backgroundNumber);
  const messageDate = message ? formatMessageDate(message.created_at) : "Waiting";
  const displayName = (session.name || session.loginId).trim();
  const displayNickname = MEMBER_NICKNAMES[session.loginId] ?? displayName;

  return (
    <div
      id="top"
      className="relative min-h-screen overflow-hidden bg-[#dbe4de] text-[#f9f8f4] selection:bg-white/25 selection:text-white"
    >
      <div className="fixed inset-0 -z-30" style={backgroundStyle} />
      <div className="fixed inset-0 -z-20 bg-[linear-gradient(180deg,rgba(14,18,22,0.08),rgba(14,18,22,0.18)_55%,rgba(11,14,17,0.34))]" />
      <div className="fixed inset-0 -z-10 backdrop-blur-[3px]" />

      <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="relative grid min-h-[calc(100vh-4rem)] items-start gap-12 overflow-hidden py-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:py-14">
          <div className="pointer-events-none absolute inset-x-[18%] top-[8%] hidden h-[34rem] opacity-90 lg:block">
            <svg
              aria-hidden="true"
              className="h-full w-full"
              fill="none"
              viewBox="0 0 700 560"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M58 468C178 252 311 135 514 36" stroke="rgba(255,255,255,0.48)" strokeWidth="1.8" />
              <path d="M124 486C228 281 370 160 563 66" stroke="rgba(255,255,255,0.25)" strokeWidth="1.1" />
            </svg>
          </div>

          <div className="relative z-10 flex min-h-[28rem] items-end lg:min-h-[42rem]">
            <div className="relative h-[28rem] w-full overflow-hidden sm:h-[34rem] lg:h-[42rem]">
              <Image
                src={profilePicPath}
                alt={`${session.name || session.loginId} profile`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 52vw"
                unoptimized
                className="object-contain object-bottom"
              />
            </div>
          </div>

          <div className="relative z-10 flex justify-end self-start pt-2 lg:pt-6">
            <div className="flex min-h-[50vh] w-full max-w-xl flex-col rounded-[2.35rem] border border-white/18 bg-white/[0.12] p-6 shadow-[0_26px_90px_rgba(8,12,18,0.22)] backdrop-blur-[24px] md:min-h-[56vh] md:p-8">
              <div className="flex items-start justify-between gap-5">
                <div className="max-w-sm">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-white/64">
                    Nickname
                  </p>
                  <h2 className={`${editorialSerifClass} mt-4 text-4xl leading-none text-white sm:text-5xl`}>
                    {displayNickname}
                  </h2>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-3">
                  <div className="[&_button]:!rounded-full [&_button]:!border-white/30 [&_button]:!bg-white/92 [&_button]:!px-4 [&_button]:!py-2 [&_button]:!text-[0.68rem] [&_button]:!font-bold [&_button]:!uppercase [&_button]:!tracking-[0.18em] [&_button]:!text-[#35524e] [&_button]:hover:!bg-white">
                    <LogoutButton />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex-1 max-w-lg">
                {loadError ? (
                  <p className="text-[0.98rem] leading-8 text-rose-100 sm:text-[1.02rem]">{loadError}</p>
                ) : message ? (
                  <>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-white/60">
                      {message?.author_name?.trim() || displayName}
                    </p>
                    <p className="mt-4 whitespace-pre-wrap text-[1rem] leading-8 text-white/92 sm:text-[1.05rem] sm:leading-9">
                      {message.content}
                    </p>
                    <time className="mt-5 block text-sm text-white/70" dateTime={message.created_at}>
                      {messageDate}
                    </time>
                  </>
                ) : (
                  <>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-white/60">
                      Private Note
                    </p>
                    <p className="mt-4 text-[0.98rem] leading-8 text-white/78 sm:text-[1.02rem]">
                      No message yet. Once your teammate writes your note, it will appear here automatically.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
