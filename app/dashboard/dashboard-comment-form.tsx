"use client";

import { useActionState, useEffect, useRef } from "react";

import type { DashboardCommentFormState } from "./actions";
import { submitDashboardComment } from "./actions";

const initialState: DashboardCommentFormState = {
  message: "",
  status: "idle",
  submittedAt: null,
};

export function DashboardCommentForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction, isPending] = useActionState(submitDashboardComment, initialState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status, state.submittedAt]);

  const feedbackClassName =
    state.status === "error"
      ? "border-rose-200/25 bg-rose-500/10 text-rose-100"
      : state.status === "success"
        ? "border-emerald-200/25 bg-emerald-500/10 text-emerald-50"
        : "border-transparent bg-transparent text-white/0";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-white/60">
          留一句给橙子
        </p>
        <p className="mt-2 text-sm leading-6 text-white/72 sm:text-[0.98rem] sm:leading-7">
          如果你想回我一句话，可以直接写在这里，我会在后台收到。
        </p>
      </div>

      <form ref={formRef} action={formAction} className="space-y-3">
        <div className="rounded-[1.35rem] border border-white/14 bg-black/10 p-3 shadow-inner shadow-black/10">
          <label htmlFor="dashboard-comment" className="sr-only">
            Comment for orange
          </label>
          <textarea
            id="dashboard-comment"
            name="comment"
            rows={4}
            maxLength={1000}
            required
            placeholder="想跟我说什么都可以写在这里..."
            className="min-h-28 w-full resize-y rounded-[1rem] border border-white/12 bg-white/8 px-4 py-3 text-sm leading-6 text-white placeholder:text-white/36 focus:border-emerald-200/45 focus:outline-none focus:ring-2 focus:ring-emerald-200/30 sm:min-h-32 sm:text-[0.98rem] sm:leading-7"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            aria-live="polite"
            className={`min-h-11 rounded-2xl border px-3 py-2 text-sm leading-6 transition-colors ${feedbackClassName}`}
          >
            {state.message || " "}
          </p>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/25 bg-white/92 px-5 text-sm font-semibold text-[#35524e] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "发送中..." : "送出留言"}
          </button>
        </div>
      </form>
    </div>
  );
}
