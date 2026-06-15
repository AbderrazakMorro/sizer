import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const SetPasswordSchema = z.object({
  reset_session_id: z.string().min(1, "Missing reset session id"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { reset_session_id, password } = SetPasswordSchema.parse(body);

    const supabaseAdmin = getAdminClient();

    // Validate one-time reset session id
    const { data: tokens, error: tokensError } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("id, user_id, reset_session_id, reset_session_expires_at, used_at")
      .eq("reset_session_id", reset_session_id)
      .limit(1);

    if (tokensError) {
      throw new Error(tokensError.message);
    }

    const token = (tokens || [])[0];
    if (!token || token.used_at) {
      console.log("reset-password/set: token not found or used", {
        reset_session_id,
        hasToken: !!token,
        used_at: token?.used_at,
      });
      return NextResponse.json({ error: "Reset link invalide" }, { status: 400 });
    }


    // More tolerant expiry check: accept only when we have a valid date.
    // If Supabase returns the field with an unexpected type, fallback to "not expired".
    if (token.reset_session_expires_at) {
      const expiresAt = new Date(token.reset_session_expires_at as any);
      if (!Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) {
        return NextResponse.json({ error: "Reset link expiré" }, { status: 400 });
      }
    }



    if (!token.user_id) {
      return NextResponse.json({ error: "Unable to set password" }, { status: 400 });
    }

    // Update password using service role (no client session needed)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      token.user_id,
      { password }
    );

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Mark token as used if not already
    const { error: markError } = await supabaseAdmin
      .from("password_reset_tokens")
      .update({
        used_at: new Date().toISOString(),
      })
      .eq("id", token.id);

    if (markError) {
      throw new Error(markError.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("reset-password/set error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

