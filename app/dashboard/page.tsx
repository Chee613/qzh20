import Image from "next/image";
import { redirect } from "next/navigation";

import { DashboardBackgroundMedia } from "@/components/dashboard-background-media";
import { LogoutButton } from "@/components/logout-button";
import { TransparentMascotVideo } from "@/components/transparent-mascot-video";
import { getSessionFromServerCookies } from "@/lib/auth/session";
import { loadMascotVideoUrls } from "@/lib/mascot-videos";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const editorialSerifClass = "font-serif";

type DashboardMessage = {
  id: string;
  content: string;
};

type DashboardMemberProfile = {
  name: string;
  nickname: string;
};

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
  let memberProfile: DashboardMemberProfile | null = null;
  let loadError: string | null = null;

  try {
    const supabase = getSupabaseAdminClient();
    const messageQuery = session.memberId
      ? supabase
          .from("messages")
          .select("id,content")
          .eq("member_id", session.memberId)
          .order("created_at", { ascending: false })
          .limit(1)
      : Promise.resolve({ data: [], error: null });

    const [{ data: messageData, error: messageError }, { data: profileData, error: profileError }] =
      await Promise.all([
        messageQuery,
        supabase
          .from("member_profiles")
          .select("name,nickname")
          .eq("login_id", session.loginId)
          .maybeSingle(),
      ]);

    if (messageError) {
      loadError = "Unable to load your message right now.";
    } else {
      message = messageData?.[0] ?? null;
    }

    if (!profileError && profileData) {
      memberProfile = profileData;
    }
  } catch {
    loadError = "Service configuration is incomplete. Please contact admin.";
  }

  const profilePicPath = `/profiles/${session.loginId}.png`;
  const match = session.loginId.match(/\d+/);
  const backgroundNumber = match ? match[0] : "1";
  const backgroundStyle = buildDashboardBackgroundStyle(session.loginId, backgroundNumber);
  const displayName = (memberProfile?.name || session.name || session.loginId).trim();
  const displayNickname = (memberProfile?.nickname || displayName).trim();
  const mascotVideos = await loadMascotVideoUrls();
  const dashboardMascotSrc = mascotVideos[3] ?? mascotVideos.at(-1) ?? null;

  return (
    <div
      id="top"
      className="relative isolate min-h-[var(--app-screen-height)] overflow-hidden bg-[#dbe4de] text-[#f9f8f4] selection:bg-white/25 selection:text-white"
    >
      <DashboardBackgroundMedia
        backgroundStyle={backgroundStyle}
        loginId={session.loginId}
      />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-3 sm:px-5 sm:py-6 md:px-8 md:py-10">
        <section className="relative grid min-h-[calc(var(--app-screen-height)-1.5rem)] content-start items-start gap-6 overflow-hidden pb-3 pt-10 sm:min-h-[calc(var(--app-screen-height)-3rem)] sm:gap-8 sm:py-4 lg:min-h-[calc(var(--app-screen-height)-4rem)] lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:py-14">
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

          <div className="relative z-10 hidden min-h-[13.5rem] items-start sm:min-h-[22rem] sm:items-center lg:flex lg:min-h-[42rem] lg:items-end">
            <div className="relative h-[15.5rem] w-full overflow-hidden sm:h-[24rem] lg:h-[42rem]">
              <Image
                src={profilePicPath}
                alt={`${session.name || session.loginId} profile`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 52vw"
                unoptimized
                className="object-contain object-top sm:object-center lg:object-bottom"
              />
            </div>
          </div>

          <div className="relative z-10 flex justify-end self-start pt-1 sm:pt-1 lg:pt-6">
            <div className="relative mt-[110px] w-full max-w-xl pt-[12.25rem] sm:mt-0 sm:pt-0">
              <div className="absolute right-4 top-8 lg:hidden">
                <div className="relative h-[9.9rem] w-[12.6rem] overflow-hidden">
                  <Image
                    src={profilePicPath}
                    alt={`${session.name || session.loginId} profile`}
                    fill
                    sizes="152px"
                    unoptimized
                    className="object-contain object-right"
                  />
                </div>
              </div>

              <div className="flex min-h-0 w-full flex-col rounded-[2rem] border border-white/18 bg-white/[0.12] p-4 shadow-[0_26px_90px_rgba(8,12,18,0.22)] backdrop-blur-[24px] sm:min-h-[24rem] sm:rounded-[2.35rem] sm:p-6 md:min-h-[68vh] md:p-8">
              <div className="flex items-start justify-between gap-4 sm:gap-5">
                <div className="max-w-sm">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-white/64">
                    {displayNickname}
                  </p>
                  <div className="mt-4 flex items-center gap-3 sm:gap-4">
                    <h2 className={`${editorialSerifClass} text-3xl leading-none text-white sm:text-5xl`}>
                      {displayName}
                    </h2>
                    {dashboardMascotSrc ? (
                      <TransparentMascotVideo
                        src={dashboardMascotSrc}
                        className="h-14 w-14 flex-shrink-0 sm:h-20 sm:w-20"
                      />
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-3">
                  <div className="[&_button]:!rounded-full [&_button]:!border-white/30 [&_button]:!bg-white/92 [&_button]:!px-3 [&_button]:!py-1.5 [&_button]:!text-[0.62rem] [&_button]:!font-bold [&_button]:!uppercase [&_button]:!tracking-[0.18em] [&_button]:!text-[#35524e] [&_button]:hover:!bg-white sm:[&_button]:!px-4 sm:[&_button]:!py-2 sm:[&_button]:!text-[0.68rem]">
                    <LogoutButton />
                  </div>
                </div>
              </div>

              <div className="mt-4 max-w-lg flex-1 sm:mt-6">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-white/60">
                  留言
                </p>
                {loadError ? (
                  <p className="mt-3 text-[0.92rem] leading-6 text-rose-100 sm:mt-4 sm:text-[1.02rem] sm:leading-8">{loadError}</p>
                ) : message ? (
                  <>
                    <p className="mt-3 whitespace-pre-wrap text-[0.94rem] leading-6 text-white/92 sm:mt-4 sm:text-[1.05rem] sm:leading-9">
                      {message.content}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-[0.92rem] leading-6 text-white/78 sm:mt-4 sm:text-[1.02rem] sm:leading-8">
                      No message yet. Once your teammate writes your note, it will appear here automatically.
                    </p>
                  </>
                )}
              </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
