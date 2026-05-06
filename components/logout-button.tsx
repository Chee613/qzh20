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
      // Changed from "/login" to "/" to redirect back to the main landing page
      router.push("/");
      router.refresh();
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isLoading}
      className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? "拜拜中..." : "拜拜"}
    </button>
  );
}
