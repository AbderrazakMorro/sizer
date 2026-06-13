"use server";

import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/nodemailer";

const ResetPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  locale: z.string().default("fr"),
});

export async function sendResetPasswordEmail(email: string, locale: string = "fr") {
  try {
    const validated = ResetPasswordSchema.parse({ email, locale });
    const supabaseAdmin = getAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // 1. Verify if user exists in Auth first
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw new Error(locale === "fr" ? "Impossible de vérifier l'utilisateur." : "Failed to verify user.");

    const existingUser = usersData.users.find(
      (u) => u.email === validated.email
    );
    
    if (!existingUser) {
      // Return success anyway for security reasons (don't reveal email existence)
      return { success: true };
    }

    // 2. Generate recovery link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: validated.email,
      options: {
        redirectTo: `${siteUrl}/${validated.locale}/set-password`,
      },
    });

    if (linkError) {
      throw new Error(linkError.message);
    }

    const accessLink = linkData?.properties?.action_link || `${siteUrl}/${validated.locale}/set-password`;

    // 3. Send email using Nodemailer
    const isFr = validated.locale === "fr";
    const subject = isFr ? "Réinitialisation de votre mot de passe - Veta" : "Reset your Veta password";
    const greeting = isFr ? `Bonjour ${existingUser.user_metadata?.full_name || ""},` : `Hello ${existingUser.user_metadata?.full_name || ""},`;
    const bodyText = isFr 
      ? "Vous avez demandé la réinitialisation de votre mot de passe pour votre espace client Veta. Veuillez cliquer sur le bouton ci-dessous pour choisir un nouveau mot de passe."
      : "You requested a password reset for your Veta workspace. Please click the button below to define a new password.";
    const btnText = isFr ? "Définir un nouveau mot de passe" : "Reset Password";
    const backupText = isFr 
      ? "Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :"
      : "If the button does not work, copy and paste this link in your browser:";

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="${validated.locale}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #faf9f6;
            color: #1c1c1c;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .logo {
            font-size: 24px;
            font-weight: 300;
            letter-spacing: 2px;
            color: #1c1c1c;
            text-decoration: none;
          }
          .content {
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
          }
          .greeting {
            font-size: 20px;
            margin-bottom: 20px;
          }
          .button-container {
            text-align: center;
            margin: 40px 0 20px 0;
          }
          .button {
            display: inline-block;
            background-color: #d4af37;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 28px;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            border-radius: 2px;
          }
          .footer {
            margin-top: 50px;
            font-size: 12px;
            color: #888888;
            text-align: center;
            border-top: 1px solid #eeeeee;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="#" class="logo">V E T A</a>
          </div>
          <div class="content">
            <div class="greeting">${greeting}</div>
            <p>${bodyText}</p>
            <div class="button-container">
              <a href="${accessLink}" class="button">${btnText}</a>
            </div>
            <p style="font-size:13px; color:#888888; text-align:center;">${backupText}<br>
            <a href="${accessLink}" style="color: #d4af37;">${accessLink}</a></p>
            <p>L'équipe Veta</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Veta Studio. Tous droits réservés.
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResult = await sendEmail({
      to: validated.email,
      subject,
      html: emailHtml,
    });

    if (!emailResult.success) {
      throw new Error(emailResult.error);
    }

    return { success: true };
  } catch (error) {
    console.error("sendResetPasswordEmail error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}
