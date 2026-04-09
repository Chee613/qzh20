"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onLogout() {
    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/login");
      router.refresh();
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isLoading}
      className="shrink-0 rounded-md border border-zinc-300 px-2.5 py-2 text-xs text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-sm"
    >
      {isLoading ? "Signing out..." : "Sign out"}
    </button>
  );
}
