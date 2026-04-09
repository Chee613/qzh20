"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Suspense } from "react";

import { LoginForm } from "./login/login-form";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip bg-zinc-950 font-sans text-zinc-50 selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-zinc-800/50 bg-zinc-950/50 px-4 py-4 backdrop-blur-md md:px-8">
        {/* Left Corner: Main Logo */}
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 md:h-16 md:w-16">
            <Image
              src="/main-logo.png"
              alt="Club Main Logo"
              fill
              className="object-contain drop-shadow-md"
            />
          </div>
          <span className="hidden text-xl font-semibold tracking-wide sm:block">QZH20</span>
        </div>

        {/* Right Corner: 20th Anniversary Logo & Login */}
        <div className="flex items-center gap-4 md:gap-8">
          <div className="relative h-16 w-16 md:h-20 md:w-20">
            <Image
              src="/20th-logo.png"
              alt="20th Anniversary Logo"
              fill
              className="object-contain drop-shadow-md"
            />
          </div>

          <a
            href="#login-section"
            className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-500"
          >
            Login
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </nav>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
        <div className="absolute left-1/4 top-1/4 -z-10 h-[360px] w-[360px] rounded-full bg-blue-500/20 blur-[100px] mix-blend-screen sm:h-[500px] sm:w-[500px] sm:blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-green-400/20 blur-[90px] mix-blend-screen sm:h-[400px] sm:w-[400px] sm:blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 mx-auto max-w-4xl text-center"
        >
          <h1 className="mb-5 text-4xl font-black tracking-tight sm:mb-6 sm:text-6xl md:text-8xl">
            <span className="bg-gradient-to-r from-blue-400 to-green-300 bg-clip-text text-transparent">
              QZH20
            </span>
            <br /> Message Portal
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg md:text-2xl">
            A dedicated space for camp committee members to connect and view their
            personalized messages.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-zinc-500 sm:bottom-10"
        >
          <span className="text-xs uppercase tracking-[0.2em] sm:text-sm sm:tracking-widest">Scroll</span>
          <div className="h-12 w-[1px] bg-gradient-to-b from-zinc-500 to-transparent" />
        </motion.div>
      </section>

      <section className="relative overflow-hidden border-t border-zinc-800/50 px-4 py-20 sm:px-6 sm:py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-10 sm:gap-12 md:grid-cols-2 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-5 text-3xl font-bold sm:mb-6 sm:text-4xl md:text-5xl">
              Built for the <br />Committee
            </h2>
            <p className="text-base leading-relaxed text-zinc-400 sm:text-lg">
              Log in with your member ID and birthday to access messages written just for
              you by your fellow team members. Let&apos;s celebrate our hard work together.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center"
          >
            <div className="group relative h-52 w-52 sm:h-64 sm:w-64 md:h-80 md:w-80">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/30 to-green-400/30 blur-3xl transition-all duration-500 group-hover:blur-2xl" />

              <div className="relative z-10 flex h-full w-full items-center justify-center transition-transform duration-500 hover:scale-105">
                <Image
                  src="/mascot.png"
                  alt="QZH20 Dinosaur Mascot"
                  fill
                  className="object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="login-section"
        className="relative flex min-h-screen scroll-mt-24 items-center justify-center border-t border-zinc-800/50 px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-full max-w-lg -translate-x-1/2 rounded-full bg-blue-500/10 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold text-zinc-100 sm:text-3xl">Welcome Back</h2>
              <p className="text-sm text-zinc-400">Enter your details to view your messages</p>
            </div>
            <Suspense fallback={<div className="text-center text-sm text-zinc-500">Loading...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
