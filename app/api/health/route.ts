import { NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

type HealthResponse = {
  status: "ok" | "degraded";
  ready: boolean;
  timestamp: string;
  checks: {
    env: boolean;
    database: boolean;
  };
};

export async function GET() {
  let envOk = false;
  let databaseOk = false;

  try {
    getServerEnv();
    envOk = true;
  } catch {
    envOk = false;
  }

  if (envOk) {
    try {
      const supabase = getSupabaseAdminClient();
      const { error } = await supabase
        .from("member_profiles")
        .select("login_id")
        .limit(1);
      databaseOk = !error;
    } catch {
      databaseOk = false;
    }
  }

  const ready = envOk && databaseOk;

  const body: HealthResponse = {
    status: ready ? "ok" : "degraded",
    ready,
    timestamp: new Date().toISOString(),
    checks: {
      env: envOk,
      database: databaseOk,
    },
  };

  return NextResponse.json(body, {
    status: ready ? 200 : 503,
  });
}
