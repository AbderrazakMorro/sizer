import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

import { getAdminClient } from "@/lib/supabase/admin";
import {
  getNewUserServiceRequestEmailHtml,
  sendEmail,
} from "@/lib/email/nodemailer";
import { getClientIp } from "@/lib/rate-limit/service-request-limiter";
import { serviceRequestLimiter } from "@/lib/rate-limit/service-request-limiter";


export const runtime = "nodejs";

const RequestSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  locale: z.string().default("fr"),
});

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}


export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, locale } = RequestSchema.parse(body);

    const ip = getClientIp(req.headers);

    // Rate limit (best-effort): use existing in-memory limiter
    const ipLimit = serviceRequestLimiter.checkIpLimit(ip);
    const emailLimit = serviceRequestLimiter.checkEmailLimit(email);
    if (!ipLimit.allowed || !emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const supabaseAdmin = getAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Verify if user exists (do not reveal existence)
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) {
      throw new Error(usersError.message);
    }

    const existingUser = (usersData.users || []).find((u: any) => u.email === email);

    if (!existingUser) {
      return NextResponse.json({ success: true });
    }

    // Generate OTP hash for backward compatibility (verify endpoint may still rely on it)
    const code = generateSixDigitCode();
    const codeHash = sha256Hex(code);


    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Delete previous unused tokens for the same email
    await supabaseAdmin
      .from("password_reset_tokens")
      .delete()
      .eq("email", email)
      .is("used_at", null);

    // Insert token
    const { error: insertError } = await supabaseAdmin
      .from("password_reset_tokens")
      .insert({
        user_id: existingUser.id,
        email,
        code_hash: codeHash,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    const isFr = locale === "fr";
    const subject = isFr
      ? "Votre code de réinitialisation Veta"
      : "Your Veta password reset code";
    const fullName = existingUser.user_metadata?.full_name || "";

    // Direct recovery link strategy: generate session marker now
    const resetSessionId = crypto.randomBytes(24).toString("hex");
    const resetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Create a fresh one-time reset session id for this request.
    // We update the most recent unused token for the email.
    await supabaseAdmin
      .from("password_reset_tokens")
      .update({
        used_at: null,
        reset_session_id: resetSessionId,
        reset_session_expires_at: resetExpiresAt.toISOString(),
      })
      .eq("email", email)
      .is("used_at", null);


    const recoveryUrl = `${siteUrl}/${locale}/set-password?reset_session_id=${encodeURIComponent(resetSessionId)}`;

    const html = getNewUserServiceRequestEmailHtml(fullName, recoveryUrl, siteUrl);


    const emailResult = await sendEmail({
      to: email,
      subject,
      html,
    });

    if (!emailResult.success) {
      throw new Error(emailResult.error);
    }

    // Record successful request for rate limiting
    serviceRequestLimiter.recordSubmission(ip, email);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("reset-password/request error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

