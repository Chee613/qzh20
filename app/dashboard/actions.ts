"use server";

import { z } from "zod";

import { getSessionFromServerCookies } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export type DashboardCommentFormState = {
  message: string;
  status: "error" | "idle" | "success";
  submittedAt: number | null;
};

const dashboardCommentSchema = z.object({
  comment: z
    .string()
    .trim()
    .min(1, "留言不能为空。")
    .max(1000, "留言最多只能 1000 个字。"),
});

export async function submitDashboardComment(
  _prevState: DashboardCommentFormState,
  formData: FormData,
): Promise<DashboardCommentFormState> {
  const session = await getSessionFromServerCookies();

  if (!session) {
    return {
      message: "登录状态已失效，请重新登录后再试一次。",
      status: "error",
      submittedAt: Date.now(),
    };
  }

  const rawComment = formData.get("comment");
  if (typeof rawComment !== "string") {
    return {
      message: "留言内容格式不正确，请重新填写。",
      status: "error",
      submittedAt: Date.now(),
    };
  }

  const parsed = dashboardCommentSchema.safeParse({
    comment: rawComment,
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "留言内容有问题，请检查后再提交。",
      status: "error",
      submittedAt: Date.now(),
    };
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("dashboard_comments").insert({
      content: parsed.data.comment,
      login_id: session.loginId,
      member_name: session.name.trim() || session.loginId,
    });

    if (error) {
      console.error("Failed to insert dashboard comment", error);
      return {
        message: "留言暂时还没存进去，请等一下再试。",
        status: "error",
        submittedAt: Date.now(),
      };
    }
  } catch (error) {
    console.error("Dashboard comment submission failed", error);
    return {
      message: "目前无法提交留言，请稍后再试。",
      status: "error",
      submittedAt: Date.now(),
    };
  }

  return {
    message: "收到你的留言啦，谢谢你。",
    status: "success",
    submittedAt: Date.now(),
  };
}
