import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { logSecurityEvent } from "@/lib/server/logger";
import { checkRateLimit } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_IP = 20;
const MAX_REQUESTS_PER_EMAIL = 5;

const getClientIp = (request: NextRequest) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip") ||
  "unknown";

export async function POST(request: NextRequest) {
  let email: string | undefined;

  try {
    const body = (await request.json()) as { email?: string };
    email = body.email?.trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Email invalido." }, { status: 400 });
  }

  const clientIp = getClientIp(request);
  const ipRateLimit = checkRateLimit({
    key: `email-check:ip:${clientIp}`,
    maxRequests: MAX_REQUESTS_PER_IP,
    windowMs: WINDOW_MS,
  });
  const emailRateLimit = checkRateLimit({
    key: `email-check:email:${email}`,
    maxRequests: MAX_REQUESTS_PER_EMAIL,
    windowMs: WINDOW_MS,
  });

  if (ipRateLimit.limited || emailRateLimit.limited) {
    const retryAfterSeconds = Math.max(
      ipRateLimit.retryAfterSeconds,
      emailRateLimit.retryAfterSeconds
    );
    logSecurityEvent("warn", "Email check rate limit exceeded", {
      clientIp,
      email,
      retryAfterSeconds,
    });
    return NextResponse.json(
      { error: "Demasiados intentos. Probá nuevamente en unos minutos." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(retryAfterSeconds),
        },
      }
    );
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    let page = 1;
    const perPage = 1000;

    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        throw error;
      }

      const exists = data.users.some((user) => user.email?.toLowerCase() === email);

      if (exists) {
        return NextResponse.json(
          { exists: true },
          {
            headers: {
              "Cache-Control": "no-store",
            },
          }
        );
      }

      if (data.users.length < perPage) {
        return NextResponse.json(
          { exists: false },
          {
            headers: {
              "Cache-Control": "no-store",
            },
          }
        );
      }

      page += 1;
    }
  } catch (error) {
    logSecurityEvent("error", "Email check failed", {
      clientIp,
      email,
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "No se pudo validar el email en este momento." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
