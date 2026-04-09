"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loginId, setLoginId] = useState("");
  const [birthdayPassword, setBirthdayPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loginId,
          birthdayPassword,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        setError(payload?.error ?? "Login failed. Please try again.");
        return;
      }

      const nextPath = searchParams.get("next");
      router.push(nextPath || "/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-6">
      <div className="space-y-2">
        <label htmlFor="loginId" className="block text-sm font-medium text-zinc-400">
          Login ID
        </label>
        <input
          id="loginId"
          name="loginId"
          type="text"
          autoComplete="username"
          required
          value={loginId}
          onChange={(event) => setLoginId(event.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-zinc-100 transition-colors placeholder:text-zinc-600 focus:border-blue-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          placeholder="e.g. zhihao"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="birthdayPassword" className="block text-sm font-medium text-zinc-400">
          Birthday Password
        </label>
        <input
          id="birthdayPassword"
          name="birthdayPassword"
          type="password"
          inputMode="numeric"
          pattern="[0-9]{8}"
          required
          value={birthdayPassword}
          onChange={(event) => setBirthdayPassword(event.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-zinc-100 transition-colors placeholder:text-zinc-600 focus:border-blue-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          placeholder="YYYYMMDD"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-center text-sm text-red-400">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? "Authenticating..." : "Access Portal"}
      </button>
    </form>
  );
}
