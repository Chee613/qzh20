"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { LoginForm } from "./login/login-form";

const SECTION_LINKS = [
  { href: "#qzh", label: "全中华" },
  { href: "#memories", label: "回忆" },
  { href: "#messages", label: "感言" },
  { href: "#login-section", label: "登录" },
] as const;

type SectionHref = (typeof SECTION_LINKS)[number]["href"];

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<SectionHref>("#qzh");
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);

  // Define the department categories, their member counts, and sticker paths.
  const departments = [
    { title: "主席团，约饭喝茶鼻祖 🍵🍚", count: 3, sticker: "/stickers/主席团.png" },
    { title: "行政，行政行政吵吵吵🐟🐠🕊️🍒", count: 4, sticker: "/stickers/行政.png" },
    { title: "节目，出意外就完美🍋🐦", count: 7, sticker: "/stickers/节目.png" },
    { title: "课程，对不起老师🧑‍🏫👉👈", count: 8, sticker: "/stickers/课程.png" },
    { title: "总务，很重！很重！肯定！！🪑🪑", count: 8, sticker: "/stickers/总务.png" },
    { title: "美术，穿小太阳的方大同kawaiii🫘🎨", count: 6, sticker: "/stickers/美术.png" },
    { title: "联宣，圆圆圈圈圈圈圆圆🫨😵 💫", count: 6, sticker: "/stickers/联宣.png" },
    { title: "筹募，DDKing金主爸爸😎💰🤑", count: 4, sticker: "/stickers/筹募.png" },
  ];

  // Generate the members continuously while keeping them grouped.
  let globalIndex = 1;
  const committeeGroups = departments.map((dept) => {
    const members = Array.from({ length: dept.count }, () => {
      const id = globalIndex++;
      return {
        displayId: id,
        id: `member${id}`,
        image: `/profiles/member${id}.png`,
      };
    });

    return { title: dept.title, members, sticker: dept.sticker };
  });

  const selectedMemberImage =
    committeeGroups
      .flatMap((group) => group.members)
      .find((member) => member.id === selectedMemberId)?.image ?? "/profiles/member1.png";

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length === 0) {
          return;
        }

        const mostVisible = visibleEntries[0];
        const nextActive = `#${mostVisible.target.id}` as SectionHref;
        setActiveSection(nextActive);
      },
      {
        root: null,
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0.2, 0.4, 0.6],
      },
    );

    for (const link of SECTION_LINKS) {
      const sectionId = link.href.slice(1);
      const section = document.getElementById(sectionId);
      if (section) {
        observer.observe(section);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const targetNode = event.target as Node;

      if (mobileMenuRef.current?.contains(targetNode)) {
        return;
      }

      if (mobileMenuButtonRef.current?.contains(targetNode)) {
        return;
      }

      setIsMobileMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!selectedMemberId) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedMemberId(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMemberId]);

  function getDesktopLinkClass(href: string) {
    return `transition-colors ${
      activeSection === href ? "text-blue-300" : "text-zinc-400 hover:text-zinc-100"
    }`;
  }

  function getMobileLinkClass(href: string) {
    return `block rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
      activeSection === href
        ? "border-blue-500/40 bg-blue-500/10 text-blue-200"
        : "border-transparent text-zinc-200 hover:border-zinc-800 hover:bg-zinc-900"
    }`;
  }

  function handleMenuLinkClick() {
    setIsMobileMenuOpen(false);
  }

  return (
    <main className="min-h-screen bg-zinc-950 font-sans text-zinc-50 selection:bg-blue-500/30">
      <div className="fixed inset-x-0 top-0 z-50">
        {/* Navigation (Framer Style) */}
        <nav className="flex w-full items-center justify-between border-b border-zinc-800/50 bg-zinc-950/70 px-3 py-3 backdrop-blur-xl sm:px-4 sm:py-4 md:px-8">
          {/* Left Corner: Main Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14">
              <Image
                src="/main-logo.png"
                alt="Club Main Logo"
                fill
                className="object-contain drop-shadow-md"
              />
            </div>
            {/* Text with subtle shine animation like the video */}
            <div className="group relative hidden overflow-hidden sm:block">
              <span className="text-lg font-bold tracking-wide text-zinc-100 md:text-xl">QZH20</span>
              <motion.div
                className="absolute left-[-100%] top-0 h-full w-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ left: "200%" }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatDelay: 2 }}
              />
            </div>
          </div>

          {/* Center/Right: Nav Links & Buttons */}
          <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
            {/* Desktop Links */}
            <div className="hidden items-center gap-8 text-sm font-medium md:flex">
              {SECTION_LINKS.slice(0, 3).map((link) => (
                <a key={link.href} href={link.href} className={getDesktopLinkClass(link.href)}>
                  {link.label}
                </a>
              ))}
            </div>

            {/* Framer 'Get Ticket' Style Login Button */}
            <a
              href="#login-section"
              className="group hidden items-center gap-3 rounded-full border border-blue-600 bg-white px-5 py-2.5 text-blue-700 shadow-lg shadow-blue-900/20 transition-all hover:bg-zinc-50 sm:flex"
            >
              <span className="text-sm font-bold">Login</span>
              <div className="rounded-full bg-blue-700 p-1 text-white transition-transform duration-300 group-hover:rotate-45">
                <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" className="-rotate-45 transform">
                  <path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z" />
                </svg>
              </div>
            </a>

            {/* Mobile Hamburger Menu */}
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
              ref={mobileMenuButtonRef}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 md:hidden"
            >
              <span
                className={`h-[2px] w-5 rounded-full bg-zinc-100 transition-transform duration-300 ${
                  isMobileMenuOpen ? "translate-y-[3.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-[2px] w-5 rounded-full bg-zinc-100 transition-transform duration-300 ${
                  isMobileMenuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {isMobileMenuOpen ? (
            <motion.div
              id="mobile-nav-menu"
              ref={mobileMenuRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden border-b border-zinc-800/50 bg-zinc-950/95 px-3 py-2 backdrop-blur-xl md:hidden"
            >
              <div className="space-y-1">
                {SECTION_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      setActiveSection(link.href);
                      handleMenuLinkClick();
                    }}
                    className={getMobileLinkClass(link.href)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* SECTION 1: 全中华 (Hero Section) */}
      <section
        id="qzh"
        className="relative flex min-h-screen scroll-mt-24 flex-col items-center justify-center overflow-hidden px-4 pb-8 pt-24 sm:px-6 sm:pt-28 md:pb-0"
      >
        <div className="absolute left-1/4 top-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 mx-auto max-w-4xl text-center"
        >
          <div className="mb-5 flex justify-center sm:mb-6">
            <div className="relative mb-3 h-20 w-20 sm:mb-4 sm:h-24 sm:w-24 md:h-32 md:w-32">
              <Image src="/20th-logo.png" alt="20th Anniversary" fill className="object-contain drop-shadow-2xl" />
            </div>
          </div>
          <h1 className="mb-5 text-4xl font-black leading-[1.05] tracking-tighter sm:mb-6 sm:text-5xl md:text-8xl">
            <span className="bg-gradient-to-r from-blue-400 to-emerald-300 bg-clip-text text-transparent">
              全中华
            </span>
            <br /> 专属留言板
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg md:text-2xl">
            Welcome to the QZH20 Message Portal. A dedicated space for our committee members to connect.
          </p>
        </motion.div>
      </section>

      {/* SECTION 2: 回忆 (Memories & Mascot) */}
      <section id="memories" className="relative scroll-mt-24 overflow-hidden border-t border-zinc-800/50 px-4 py-20 sm:px-6 sm:py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-10 sm:gap-14 md:grid-cols-2 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-blue-400 sm:text-sm">
              回忆 MEMORIES
            </div>
            <h2 className="mb-5 text-3xl font-bold text-zinc-100 sm:mb-6 sm:text-4xl md:text-5xl">
              Our Shared <br />Journey
            </h2>
            <p className="mb-6 text-base leading-relaxed text-zinc-400 sm:mb-8 sm:text-lg">
              From the very first meeting to the final campfire, every moment we spent together shaped the success of QZH20. Log in to look back at the memories we created.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center"
          >
            {/* Mascot Image */}
            <div className="group relative h-56 w-56 sm:h-72 sm:w-72 md:h-96 md:w-96">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/30 to-emerald-400/30 blur-3xl transition-all duration-500 group-hover:blur-2xl" />
              <div className="relative z-10 flex h-full w-full items-center justify-center transition-transform duration-500 hover:-translate-y-4">
                <Image
                  src="/mascot.png"
                  alt="QZH20 Dinosaur Mascot"
                  fill
                  className="object-contain drop-shadow-[0_0_40px_rgba(59,130,246,0.4)]"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: 感言 (Testimonials/Messages Preview) */}
      <section id="messages" className="relative scroll-mt-24 overflow-hidden border-t border-zinc-800/50 bg-zinc-900/30 px-4 py-20 sm:px-6 sm:py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-400 sm:text-sm">
              感言 MESSAGES
            </div>
            <h2 className="mb-5 text-3xl font-bold text-zinc-100 sm:mb-6 sm:text-4xl md:text-5xl">Words from the Heart</h2>
            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-zinc-400 sm:mb-12 sm:text-lg">
              Discover the hidden messages written by your fellow committee members. Every message is a token of appreciation for your hard work.
            </p>
          </motion.div>

          {/* Decorative Mock Cards */}
          <div className="pointer-events-none grid select-none grid-cols-1 gap-4 opacity-60 blur-[2px] sm:grid-cols-3 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
                <div className="mb-4 h-8 w-8 rounded-full bg-zinc-800" />
                <div className="mb-2 h-4 w-3/4 rounded bg-zinc-800" />
                <div className="mb-2 h-4 w-full rounded bg-zinc-800" />
                <div className="h-4 w-5/6 rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: 寻找自己 (Find Yourself / Login Grid) */}
      <section
        id="login-section"
        className="relative min-h-screen scroll-mt-24 border-t border-zinc-800/50 bg-zinc-950 px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-3xl font-bold text-zinc-100 sm:text-4xl md:text-5xl">Who are you?</h2>
            <p className="text-base text-zinc-400 sm:text-lg">
              Find your profile picture to unlock your messages.
            </p>
          </div>

          {/* Grouped Grid of Members */}
          <div className="mx-auto max-w-7xl space-y-20">
            {committeeGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-10">
                {/* Department Title */}
                <div className="flex items-center justify-center gap-4">
                  <div className="hidden h-[1px] flex-1 bg-gradient-to-r from-transparent to-zinc-800 sm:block" />
                  <h3 className="px-4 text-center text-xl font-bold text-zinc-200 md:text-2xl">
                    {group.title}
                  </h3>
                  <div className="hidden h-[1px] flex-1 bg-gradient-to-l from-transparent to-zinc-800 sm:block" />
                </div>

                {/* Flex Container for Sticker and Grid (Aligns stickers vertically) */}
                <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-12">
                  {/* Sticker Column - Fixed width on desktop for consistent alignment */}
                  <div className="relative flex h-40 w-40 flex-shrink-0 items-center justify-center md:h-52 md:w-52">
                    {/* Decorative glow behind sticker */}
                    <div className="absolute inset-2 rounded-full bg-blue-500/10 blur-2xl" />

                    <Image
                      src={group.sticker}
                      alt={`${group.title} Sticker`}
                      fill
                      className="relative z-10 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                      priority={groupIdx < 2}
                    />
                  </div>

                  {/* Member Grid Column - Takes up remaining space */}
                  <div className="w-full flex-grow">
                    <div className="grid grid-cols-3 justify-center gap-4 sm:grid-cols-4 md:grid-cols-5 md:justify-start md:gap-6 lg:grid-cols-7">
                      {group.members.map((member) => (
                        <motion.button
                          key={member.id}
                          type="button"
                          whileHover={{ scale: 1.1, zIndex: 10, borderColor: "#3b82f6" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedMemberId(member.id)}
                          className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900 shadow-lg transition-colors"
                        >
                          {/* Fallback text if image fails to load */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 font-bold text-zinc-600 opacity-100 transition-opacity">
                            <span className="mb-1 text-xs font-normal">ID</span>
                            #{member.displayId}
                          </div>

                          <Image
                            src={member.image}
                            alt={`Member ${member.displayId}`}
                            fill
                            className="relative z-10 object-cover"
                            onError={(event) => {
                              event.currentTarget.style.opacity = "0";
                            }}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selectedMemberId ? (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.button
                type="button"
                aria-label="Close member login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedMemberId(null)}
                className="absolute inset-0 cursor-pointer bg-black/80 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-700/50 bg-zinc-900 p-6 shadow-2xl sm:p-8"
              >
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

                <button
                  type="button"
                  onClick={() => setSelectedMemberId(null)}
                  className="absolute right-4 top-4 rounded-full bg-zinc-800/50 p-2 text-zinc-500 transition-colors hover:text-zinc-100"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="mb-6 mt-2 text-center">
                  <div className="relative mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-zinc-800 bg-zinc-950">
                    <Image src={selectedMemberImage} alt="Selected profile" fill className="object-cover" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100">Welcome Back!</h3>
                </div>

                <LoginForm prefilledLoginId={selectedMemberId} />
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>
      </section>
    </main>
  );
}