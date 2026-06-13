"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  getContactFormToEmail,
  getDefaultFrom,
} from "@/lib/email/mailersend";
import { sendEmail } from "@/lib/email/nodemailer";
import {
  checkRateLimit,
  getClientIpFromHeaders,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";
import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
import { isAppLocale } from "@/lib/resolve-locale-from-accept-language";
import { escapeHtml } from "@/lib/escape-html";

/** Strips CR/LF from a fragment used in email Subject to mitigate header injection. */
function sanitizeEmailSubjectFragment(value: string): string {
  return value
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Minimum seconds the form must be open before submit (anti-bot). */
const MIN_SUBMIT_SECONDS = 10;
/** Max age of form timestamp in ms (1 hour). */
const MAX_FORM_AGE_MS = 60 * 60 * 1000;

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre es demasiado largo"),
  email: z
    .string()
    .email("Email inválido")
    .max(254, "El email es demasiado largo"),
  subject: z
    .string()
    .min(5, "El asunto debe tener al menos 5 caracteres")
    .max(100, "El asunto es demasiado largo")
    .refine(
      (s) => !/[\r\n]/.test(s),
      "El asunto no puede contener saltos de línea"
    ),
  message: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(5000, "El mensaje es demasiado largo"),
});

export type ContactFormState = {
  success?: boolean;
  error?: string;
};

export async function submitContactForm(
  _prevState: ContactFormState | null,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot: if filled, treat as bot and return success without sending
  const honeypot = formData.get("website");
  if (honeypot && String(honeypot).trim() !== "") {
    return { success: true };
  }

  // Time check: reject if submitted too fast (bot) or form too old (stale)
  const tsRaw = formData.get("_ts");
  const ts = tsRaw ? Number(String(tsRaw)) : NaN;
  if (Number.isFinite(ts)) {
    const now = Date.now();
    const elapsedMs = now - ts;
    if (elapsedMs < MIN_SUBMIT_SECONDS * 1000 || elapsedMs > MAX_FORM_AGE_MS) {
      return { success: true };
    }
  }

  const ip = getClientIpFromHeaders(await headers());
  const { allowed } = checkRateLimit(ip, "contact");
  if (!allowed) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.flatten().fieldErrors;
    const message =
      Object.values(firstError).flat().join(", ") || "Datos inválidos";
    return { error: message };
  }

  const { name, email, subject, message } = parsed.data;
  const rawFormLocale = String(formData.get("form_locale") ?? "").trim();
  const formLocale: Locale = isAppLocale(rawFormLocale)
    ? rawFormLocale
    : defaultLocale;
  const from = getDefaultFrom();
  const toEmail = getContactFormToEmail();

  const text = `Nombre: ${name}\nEmail: ${email}\nIP: ${ip}\nIdioma (locale): ${formLocale}\n\nMensaje:\n${message}`;
  const html = `
    <h2>Nuevo mensaje de contacto</h2>
    <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Asunto:</strong> ${escapeHtml(subject)}</p>
    <p><strong>IP:</strong> ${escapeHtml(ip)}</p>
    <p><strong>Idioma (locale):</strong> ${escapeHtml(formLocale)}</p>
    <hr>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
  `;

  const subjectForHeader = sanitizeEmailSubjectFragment(subject);

  // Send notification to the studio
  const studioResult = await sendEmail({
    to: toEmail,
    subject: `[Veta Contacto] ${subjectForHeader}`,
    text,
    html,
  });

  if (!studioResult.success) {
    return {
      error:
        studioResult.error || "No se pudo enviar el mensaje. Inténtalo de nuevo.",
    };
  }

  // Send confirmation to the client
  const clientHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1c1c;">
      <h2>Bonjour ${escapeHtml(name)},</h2>
      <p>Nous avons bien reçu votre message et nous vous en remercions.</p>
      <p>Notre équipe va l'étudier avec attention et reviendra vers vous très prochainement.</p>
      <p>Voici un récapitulatif de votre demande :</p>
      <blockquote style="border-left: 4px solid #d4af37; padding-left: 16px; color: #555; margin-left: 0;">
        <strong>Sujet :</strong> ${escapeHtml(subject)}<br><br>
        ${escapeHtml(message).replace(/\n/g, "<br>")}
      </blockquote>
      <p>À très bientôt,<br>L'équipe Veta</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Confirmation de votre demande de contact - Veta",
    html: clientHtml,
    text: `Bonjour ${name},\n\nNous avons bien reçu votre message et nous vous en remercions.\nNotre équipe reviendra vers vous très prochainement.\n\nL'équipe Veta`,
  });

  return { success: true };
}
