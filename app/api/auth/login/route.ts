import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getRequestIp, logAuditEvent } from "@/lib/audit";
import { loginBodySchema } from "@/lib/auth/login-schema";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { verifyPasskey } from "@/lib/auth/password";
import { consumeLoginAttempt, resetLoginAttempts } from "@/lib/auth/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const requestIp = getRequestIp(request);

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    logAuditEvent(
      "auth.login.bad_request",
      { ip: requestIp },
      "warn"
    );
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginBodySchema.safeParse(body);
  if (!parsed.success) {
    logAuditEvent(
      "auth.login.invalid_format",
      { ip: requestIp },
      "warn"
    );
    return NextResponse.json(
      { error: "Invalid credentials format." },
      { status: 400 }
    );
  }

  const { loginId, passkey } = parsed.data;
  const rateLimitKey = `${requestIp}:${loginId}`;

  const rateLimitResult = consumeLoginAttempt(rateLimitKey);
  if (rateLimitResult.limited) {
    logAuditEvent(
      "auth.login.rate_limited",
      {
        ip: requestIp,
        loginId,
        retryAfterSeconds: rateLimitResult.retryAfterSeconds,
      },
      "warn"
    );
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfterSeconds),
        },
      }
    );
  }

  let memberProfile:
    | {
        name: string;
        passkey_hash: string;
      }
    | null = null;
  let committeeMemberId: string | null = null;

  try {
    const supabase = getSupabaseAdminClient();
    const [
      { data: profileData, error: profileError },
      { data: memberData, error: memberError },
    ] = await Promise.all([
      supabase
        .from("member_profiles")
        .select("name,passkey_hash")
        .eq("login_id", loginId)
        .maybeSingle(),
      supabase
        .from("committee_members")
        .select("id")
        .eq("login_id", loginId)
        .maybeSingle(),
    ]);

    if (profileError || memberError) {
      const queryError = profileError ?? memberError;
      console.error("Login query failed", queryError);
      logAuditEvent(
        "auth.login.query_error",
        {
          ip: requestIp,
          loginId,
          message: queryError?.message,
        },
        "error"
      );
      return NextResponse.json({ error: "Login failed." }, { status: 500 });
    }

    memberProfile = profileData;
    committeeMemberId = memberData?.id ?? null;
  } catch (error) {
    console.error("Login runtime failed", error);
    logAuditEvent(
      "auth.login.runtime_error",
      {
        ip: requestIp,
        loginId,
      },
      "error"
    );
    return NextResponse.json({ error: "Login unavailable." }, { status: 500 });
  }

  if (!memberProfile) {
    logAuditEvent(
      "auth.login.invalid_credentials",
      {
        ip: requestIp,
        loginId,
      },
      "warn"
    );
    return NextResponse.json(
      { error: "Invalid login credentials." },
      { status: 401 }
    );
  }

  const validPassword = await verifyPasskey(passkey, memberProfile.passkey_hash);

  if (!validPassword) {
    logAuditEvent(
      "auth.login.invalid_credentials",
      {
        ip: requestIp,
        loginId,
      },
      "warn"
    );
    return NextResponse.json(
      { error: "Invalid login credentials." },
      { status: 401 }
    );
  }

  resetLoginAttempts(rateLimitKey);

  const token = createSessionToken({
    memberId: committeeMemberId,
    loginId,
    name: memberProfile.name,
  });

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, token);

  logAuditEvent("auth.login.success", {
    ip: requestIp,
    loginId,
    memberId: committeeMemberId,
  });

  return response;
}
