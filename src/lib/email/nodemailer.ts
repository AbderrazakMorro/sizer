import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Configure standard Nodemailer transporter
 */
export function getTransporter() {
  const cleanEnvVar = (val: string | undefined) => val ? val.replace(/^["']|["']$/g, "") : "";
  const host = cleanEnvVar(process.env.SMTP_HOST);
  const port = process.env.SMTP_PORT ? parseInt(cleanEnvVar(process.env.SMTP_PORT), 10) : 587;
  const user = cleanEnvVar(process.env.SMTP_USER);
  const pass = cleanEnvVar(process.env.SMTP_PASS);

  if (!host || !user || !pass) {
    console.warn("Nodemailer SMTP variables are not fully configured.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends a transactional email using Nodemailer
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const transporter = getTransporter();

  const cleanEnvVar = (val: string | undefined) => val ? val.replace(/^["']|["']$/g, "") : "";
  const from = cleanEnvVar(process.env.SMTP_FROM) || '"Veta" <veta.design.app@gmail.com>';

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text || "Please enable HTML to view this email.",
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Base email styles for Veta emails
 */
const getEmailStyles = () => `
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background-color: #faf9f6; /* Off-white */
    color: #1c1c1c; /* Charcoal */
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
    background-color: #d4af37; /* Gold */
    color: #ffffff;
    text-decoration: none;
    padding: 14px 28px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    border-radius: 2px;
  }
  .divider {
    border: none;
    border-top: 1px solid #eeeeee;
    margin: 30px 0;
  }
  .signin-section {
    text-align: center;
    padding: 20px;
    background-color: #faf9f6;
    border-radius: 4px;
    margin: 20px 0;
  }
  .signin-section p {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #555555;
  }
  .signin-link {
    display: inline-block;
    color: #d4af37;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid #d4af37;
    padding: 10px 22px;
    border-radius: 2px;
    letter-spacing: 0.5px;
  }
  .footer {
    margin-top: 50px;
    font-size: 12px;
    color: #888888;
    text-align: center;
    border-top: 1px solid #eeeeee;
    padding-top: 20px;
  }
  .info-box {
    background-color: #f8f8f8;
    border-left: 4px solid #d4af37;
    padding: 16px;
    margin: 20px 0;
    font-size: 14px;
    color: #555555;
  }
`;

/**
 * Email template for NEW users (account created automatically)
 * Includes link to set password
 */
export function getNewUserServiceRequestEmailHtml(name: string, accessLink: string, siteUrl: string) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getEmailStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="${siteUrl}" class="logo">S I Z E R</a>
        </div>
        <div class="content">
          <div class="greeting">Bonjour ${name},</div>
          <p>Nous avons bien reçu votre demande de service et nous vous en remercions.</p>
          <p>Pour suivre l'avancement de votre projet, valider les documents et échanger avec notre équipe, nous avons créé un <strong>espace client sécurisé</strong> pour vous.</p>
          
          <div class="info-box">
            <strong>🔐 Première connexion</strong><br>
            Un compte a été créé automatiquement avec votre adresse email. Veuillez définir votre mot de passe pour accéder à votre espace.
          </div>
          
          <div class="button-container">
            <a href="${accessLink}" class="button">Définir mon mot de passe</a>
          </div>
          
          <p style="font-size:13px; color:#888888; text-align:center;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
          <a href="${accessLink}" style="color: #d4af37; word-break: break-all;">${accessLink}</a></p>
          
          <hr class="divider">
          
          <p><strong>Que se passe-t-il ensuite ?</strong></p>
          <ul style="color: #555555; line-height: 1.8;">
            <li>Notre équipe examinera votre demande dans les plus brefs délais</li>
            <li>Vous recevrez une notification dès qu'il y aura une mise à jour</li>
            <li>Vous pourrez suivre l'évolution de votre projet depuis votre espace client</li>
          </ul>
          
          <p style="margin-top: 30px;">À très bientôt,<br>L'équipe Veta</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Sizer.ma. Tous droits réservés.
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Email template for EXISTING users
 * Invites them to sign in to view their new service request
 */
export function getExistingUserServiceRequestEmailHtml(name: string, siteUrl: string) {
  const loginUrl = `${siteUrl}/fr/sign-in`;
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getEmailStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="${siteUrl}" class="logo">S I Z E R</a>
        </div>
        <div class="content">
          <div class="greeting">Bonjour ${name},</div>
          <p>Nous avons bien reçu votre nouvelle demande de service et nous vous en remercions.</p>
          
          <div class="info-box">
            <strong>✅ Demande enregistrée</strong><br>
            Votre demande a été ajoutée à votre espace client existant. Connectez-vous pour suivre son avancement.
          </div>
          
          <div class="button-container">
            <a href="${loginUrl}" class="button">Se connecter à mon espace</a>
          </div>
          
          <p style="font-size:13px; color:#888888; text-align:center;">Lien de connexion :<br>
          <a href="${loginUrl}" style="color: #d4af37;">${loginUrl}</a></p>
          
          <hr class="divider">
          
          <p><strong>Que se passe-t-il ensuite ?</strong></p>
          <ul style="color: #555555; line-height: 1.8;">
            <li>Notre équipe examinera votre demande dans les plus brefs délais</li>
            <li>Vous recevrez une notification dès qu'il y aura une mise à jour</li>
            <li>Vous pourrez suivre l'évolution de votre projet depuis votre espace client</li>
          </ul>
          
          <p style="margin-top: 30px;">À très bientôt,<br>L'équipe Veta</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Sizer.ma. Tous droits réservés.
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use getNewUserServiceRequestEmailHtml or getExistingUserServiceRequestEmailHtml instead
 */
export function getWelcomeEmailHtml(name: string, accessLink: string, siteUrl?: string) {
  return getNewUserServiceRequestEmailHtml(name, accessLink, siteUrl || "http://localhost:3000");
}

