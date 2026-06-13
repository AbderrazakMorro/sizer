"use server";

import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  sendEmail,
  getNewUserServiceRequestEmailHtml,
  getExistingUserServiceRequestEmailHtml
} from "@/lib/email/nodemailer";

const ServiceRequestSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  title: z.string().min(5, "Le titre est trop court"),
  description: z.string().min(10, "La description est trop courte"),
  dimensions: z.string().optional(),
  constraints: z.string().optional(),
});

export type ServiceRequestInput = z.infer<typeof ServiceRequestSchema>;

export async function submitServiceRequest(input: ServiceRequestInput) {
  try {
    const validatedData = ServiceRequestSchema.parse(input);
    const supabaseAdmin = getAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    console.log("[ServiceRequest] ▶ Starting for:", validatedData.email);
    // ── 1. Create/retrieve the auth user ────────────────────
    let userId: string;
    let accessLink: string;
    let isExistingUser = false;
    const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + "A1!";

    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: validatedData.name },
    });

    if (createError) {
      if (
        createError.status === 422 ||
        createError.message.toLowerCase().includes("already registered")
      ) {
        const { data: usersData, error: usersError } =
          await supabaseAdmin.auth.admin.listUsers();
        if (usersError)
          throw new Error("Impossible de vérifier l'utilisateur existant.");

        const existingUser = usersData.users.find(
          (u) => u.email === validatedData.email
        );
        if (!existingUser)
          throw new Error("Utilisateur non trouvé après échec de création.");

        userId = existingUser.id;
        isExistingUser = true;
      } else {
        throw new Error(
          "Erreur lors de la création du compte : " + createError.message
        );
      }
    } else {
      userId = userData.user.id;
    }

    // Generate recovery link for both new and existing users
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: validatedData.email,
      options: {
        redirectTo: `${siteUrl}/fr/set-password`,
      },
    });
    
    if (linkError) {
      console.error("[ServiceRequest] Link generation error:", linkError);
    }
    
    accessLink = linkData?.properties?.action_link || `${siteUrl}/fr/set-password`;

    // ── 2. Ensure a profiles row exists BEFORE inserting service_requests ───
    // CRITICAL: The DB trigger (ensure_profile_and_account_settings_from_auth)
    // only fires when email_confirmed_at transitions NULL → NOT NULL, which
    // happens AFTER the client clicks the invite link and sets their password.
    // Without this upsert, the FK constraint on service_requests.client_id
    // (→ profiles.id) would fail immediately.
    if (!isExistingUser) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: userId,
            email: validatedData.email,
            full_name: validatedData.name,
          },
          { onConflict: "id" }
        );

      if (profileError) {
        // Non-fatal if profile already exists via a race condition
        console.warn("Profile upsert warning:", profileError.message);
      }
    }

    // ── 3. Insert the service request ────────────────────────────────────────
    const { error: requestError } = await supabaseAdmin
      .from("service_requests")
      .insert({
        client_id: userId,
        title: validatedData.title,
        description: validatedData.description,
        dimensions: validatedData.dimensions || null,
        constraints: validatedData.constraints || null,
        status: "submitted",
      });

    if (requestError) {
      console.error("[ServiceRequest] service_requests insert error:", requestError);
      throw new Error(
        "Erreur lors de l'enregistrement de la demande : " + requestError.message
      );
    }
    console.log("[ServiceRequest] ✅ service_request inserted for userId:", userId);

    // ── 4. Create a linked draft project (non-blocking) ──────────────────────
    const { error: projectError } = await supabaseAdmin.from("projects").insert({
      name: validatedData.title,
      description: validatedData.description,
      status: "active",
      user_id: userId,
    });

    if (projectError) {
      console.warn("Projet non créé (non bloquant) :", projectError.message);
    }

    // ── 5. Send confirmation email (non-blocking) ────────────────────────────
    // Email failure must NOT prevent a success response — the data is already
    // stored in the database at this point.
    
    // Choose the appropriate email template based on user status
    let emailHtml: string;
    let emailSubject: string;
    
    if (isExistingUser) {
      // Existing user: invite them to sign in
      emailHtml = getExistingUserServiceRequestEmailHtml(validatedData.name, siteUrl);
      emailSubject = "Nouvelle demande de service reçue - Sizer";
      console.log("[ServiceRequest] 📧 Sending existing user email to:", validatedData.email);
    } else {
      // New user: send password setup link
      emailHtml = getNewUserServiceRequestEmailHtml(validatedData.name, accessLink, siteUrl);
      emailSubject = "Bienvenue chez Sizer - Configurez votre compte";
      console.log("[ServiceRequest] 📧 Sending new user email with setup link to:", validatedData.email);
    }
    
    const emailResult = await sendEmail({
      to: validatedData.email,
      subject: emailSubject,
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error("[ServiceRequest] ❌ Email NOT sent:", emailResult.error);
    } else {
      console.log("[ServiceRequest] ✅ Email sent to:", validatedData.email, "messageId:", emailResult.messageId);
    }

    return { success: true, emailSent: emailResult.success, isExistingUser };
  } catch (error) {
    console.error("submitServiceRequest error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue",
    };
  }
}
