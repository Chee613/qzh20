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
    <form onSubmit={onSubmit} className="w-full space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="loginId" className="block text-sm font-medium text-zinc-700">
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
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-sm transition-colors placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="e.g. zhihao"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="birthdayPassword" className="block text-sm font-medium text-zinc-700">
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
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-sm transition-colors placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="YYYYMMDD"
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
      >
        {isSubmitting ? "Authenticating..." : "Sign In"}
      </button>
    </form>
  );
}
