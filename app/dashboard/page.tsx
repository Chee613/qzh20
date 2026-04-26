import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { getSessionFromServerCookies } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const editorialSerifClass = "font-serif";

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

  return (
    <div
      id="top"
      className="relative min-h-screen overflow-hidden bg-[#dbe4de] text-[#f9f8f4] selection:bg-white/25 selection:text-white"
    >
      <div className="fixed inset-0 -z-30" style={backgroundStyle} />
      <div className="fixed inset-0 -z-20 bg-[linear-gradient(180deg,rgba(14,18,22,0.08),rgba(14,18,22,0.18)_55%,rgba(11,14,17,0.34))]" />
      <div className="fixed inset-0 -z-10 backdrop-blur-[3px]" />

      <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="relative grid min-h-[calc(100vh-4rem)] items-end gap-12 overflow-hidden py-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:py-14">
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

          <div className="relative z-10 pt-8 lg:pt-16">
            <h1
              className={`${editorialSerifClass} max-w-[7ch] text-[4.45rem] leading-[0.82] tracking-[-0.05em] text-white drop-shadow-[0_12px_32px_rgba(0,0,0,0.16)] sm:text-[5.9rem] md:text-[7.4rem] lg:text-[8.7rem]`}
            >
              A Place
              <br />
              That Keeps
              <br />
              Your Words.
            </h1>
            <p className="mt-8 max-w-sm text-sm leading-7 text-white/68 sm:text-[0.96rem]">
              Built as your own quiet dashboard: soft, cinematic, and personal. When you upload a
              custom background later, this page will automatically take on that new mood.
            </p>
          </div>

          <div className="relative z-10 flex justify-end">
            <div className="w-full max-w-xl rounded-[2.35rem] border border-white/18 bg-white/[0.12] p-6 shadow-[0_26px_90px_rgba(8,12,18,0.22)] backdrop-blur-[24px] md:p-8">
              <div className="flex items-start justify-between gap-5">
                <div className="max-w-sm">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-white/64">
                    Your Edition
                  </p>
                  <h2 className={`${editorialSerifClass} mt-4 text-4xl leading-none text-white sm:text-5xl`}>
                    Welcome,
                    <br />
                    {(session.name || session.loginId).trim()}
                  </h2>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/35 bg-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.16)] sm:h-20 sm:w-20">
                    <Image src={profilePicPath} alt="Your profile" fill className="object-cover" />
                  </div>
                  <div className="[&_button]:!rounded-full [&_button]:!border-white/30 [&_button]:!bg-white/92 [&_button]:!px-4 [&_button]:!py-2 [&_button]:!text-[0.68rem] [&_button]:!font-bold [&_button]:!uppercase [&_button]:!tracking-[0.18em] [&_button]:!text-[#35524e] [&_button]:hover:!bg-white">
                    <LogoutButton />
                  </div>
                </div>
              </div>

              <p className="mt-6 max-w-lg text-[0.98rem] leading-8 text-white/80 sm:text-[1.02rem]">
                This is your private page. Each member has one dedicated message, and yours is
                displayed right here in this edition card.
              </p>

              <div className="mt-8 overflow-hidden rounded-[1.85rem] border border-white/16 bg-black/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="border-b border-white/12 px-5 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-white/62">
                        Private Note
                      </p>
                      <p className="mt-2 text-sm text-white/74">
                        {message?.author_name?.trim() || "A teammate from QZH20"}
                      </p>
                    </div>
                    <time className="text-sm text-white/72" dateTime={message?.created_at}>
                      {messageDate}
                    </time>
                  </div>
                </div>

                <div className="px-5 py-6 sm:px-6 sm:py-7">
                  {loadError ? (
                    <div className="rounded-[1.35rem] border border-rose-100/30 bg-rose-50/75 px-4 py-4 text-sm leading-7 text-[#7a3035] shadow-[0_12px_30px_rgba(86,29,33,0.12)]">
                      {loadError}
                    </div>
                  ) : message ? (
                    <>
                      <p className={`${editorialSerifClass} text-5xl leading-none text-white/24`}>&quot;</p>
                      <p className="mt-3 whitespace-pre-wrap text-[1rem] leading-8 text-white/92 sm:text-[1.05rem] sm:leading-9">
                        {message.content}
                      </p>
                    </>
                  ) : (
                    <div className="rounded-[1.35rem] border border-dashed border-white/18 bg-white/[0.05] px-4 py-6 text-white/74">
                      <p className={`${editorialSerifClass} text-3xl leading-none text-white`}>
                        No message yet.
                      </p>
                      <p className="mt-4 text-sm leading-7 sm:text-[0.98rem]">
                        Once your teammate writes your note, it will appear here automatically.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/8 px-6 py-3 text-[0.76rem] font-semibold uppercase tracking-[0.22em] text-white/84 transition-colors hover:bg-white/14"
                  href="/#memories"
                >
                  Back to Memories
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
