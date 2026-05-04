"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LoginFormProps = {
  prefilledLoginId?: string;
};

export function LoginForm({ prefilledLoginId }: LoginFormProps) {
  const router = useRouter();

  const [passkey, setPasskey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackLoginId, setFallbackLoginId] = useState("");

  const activeLoginId = prefilledLoginId || fallbackLoginId;

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
          loginId: activeLoginId,
          passkey,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Authentication failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message || "An error occurred");
        return;
      }

      setError("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-5 sm:space-y-6">
      {!prefilledLoginId ? (
        <div className="space-y-2">
          <label htmlFor="loginId" className="block text-xs font-medium text-zinc-400 sm:text-sm">
            Login ID
          </label>
          <input
            id="loginId"
            type="text"
            autoComplete="username"
            required
            value={fallbackLoginId}
            onChange={(event) => setFallbackLoginId(event.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3.5 py-2.5 text-sm text-zinc-100 transition-colors placeholder:text-zinc-600 focus:border-blue-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500/50 sm:px-4 sm:py-3 sm:text-base"
            placeholder="Enter Login ID"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="passkey" className="block text-center text-xs font-medium text-zinc-400 sm:text-sm">
          Enter your Passkey
        </label>
        <input
          id="passkey"
          name="passkey"
          type="password"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          pattern="[0-9]{4}[A-Za-z]{4}"
          required
          autoFocus
          value={passkey}
          onChange={(event) => setPasskey(event.target.value.toLowerCase())}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-4 text-center font-mono text-xl tracking-[0.5em] text-zinc-100 shadow-inner transition-colors placeholder:tracking-normal placeholder:text-zinc-700 focus:border-blue-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder="MMDDcode"
        />
        <p className="text-center text-[0.68rem] text-zinc-500 sm:text-xs">
          Format: birthday without year + your 4-letter secret code
        </p>
      </div>

      {error ? (
        <div className="animate-pulse rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-center text-xs text-red-400 sm:text-sm">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !activeLoginId}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? "Unlocking..." : "View My Messages"}
      </button>
    </form>
  );
}
