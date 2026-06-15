"use server";

import { z } from "zod";


const ResetPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  locale: z.string().default("fr"),
});

export async function sendResetPasswordEmail(email: string, locale: string = "fr") {
  // Deprecated legacy action.
  // New OTP-based flow is handled by:
  //  - /api/auth/reset-password/request
  // This stub is kept for compatibility with existing callers.
  try {
    const validated = ResetPasswordSchema.parse({ email, locale });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/auth/reset-password/request`, {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: validated.email, locale: validated.locale }),
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok) {
      return { success: false, error: data?.error || "Erreur lors de la demande" };
    }

    return { success: true };
  } catch (error) {
    console.error("sendResetPasswordEmail (legacy) error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}

