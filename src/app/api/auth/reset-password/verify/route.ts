import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const VerifySchema = z.object({
  email: z.string().email("Adresse email invalide"),
  code: z.string().regex(/^\d{6}$/, "Code invalide"),
  locale: z.string().default("fr"),
});

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function randomTokenId() {
  return crypto.randomBytes(24).toString("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, code, locale } = VerifySchema.parse(body);

    const supabaseAdmin = getAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const codeHash = sha256Hex(code);

    // Find most recent unexpired, unused token for email
    const { data: tokens, error: tokensError } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("id, code_hash, expires_at, used_at, reset_session_id")
      .eq("email", email)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (tokensError) {
      throw new Error(tokensError.message);
    }

    const token = (tokens || [])[0];
    if (!token || token.code_hash !== codeHash) {
      return NextResponse.json(
        { error: "Code invalide ou expiré" },
        { status: 400 }
      );
    }

    // Mark token as used
    const resetSessionId = randomTokenId();
    const resetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const { error: updateError } = await supabaseAdmin
      .from("password_reset_tokens")
      .update({
        used_at: new Date().toISOString(),
        reset_session_id: resetSessionId,
        reset_session_expires_at: resetExpiresAt.toISOString(),
      })
      .eq("id", token.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Strategy B: OTP-based one-time session marker.
    // We do NOT generate a Supabase recovery link.
    // Instead, we return a link to our /set-password page with the one-time reset_session_id.

    const setPasswordUrl = `${siteUrl}/${locale}/set-password?reset_session_id=${encodeURIComponent(
      resetSessionId
    )}`;

    return NextResponse.json({ success: true, recoveryUrl: setPasswordUrl });

  } catch (err: any) {
    console.error("reset-password/verify error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

