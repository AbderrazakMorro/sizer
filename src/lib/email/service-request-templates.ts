/**
 * Email templates for Service Request workflow with tracking serial
 * Luxury Minimalist design inspired by Sizer.ma aesthetic
 */

/**
 * Luxury email styles for Sizer service request emails
 * Charcoal (#000000) background with Gold (#D4A853) accents
 */
const getLuxuryEmailStyles = () => `
  body {
    font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background-color: #000000;
    color: #FFFFFF;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .email-wrapper {
    background-color: #000000;
    padding: 40px 20px;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #1A1A1A;
    border: 1px solid #333333;
  }
  .header {
    text-align: center;
    padding: 40px 40px 30px 40px;
    border-bottom: 1px solid #333333;
  }
  .logo {
    font-family: 'Montserrat', sans-serif;
    font-size: 28px;
    font-weight: 300;
    letter-spacing: 4px;
    color: #FFFFFF;
    text-decoration: none;
    text-transform: uppercase;
  }
  .content {
    padding: 40px;
    font-size: 16px;
    line-height: 1.7;
    color: #FFFFFF;
  }
  .greeting {
    font-family: 'Syne', sans-serif;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 24px;
    color: #FFFFFF;
  }
  .tracking-box {
    background-color: #000000;
    border: 2px solid #D4A853;
    padding: 24px;
    margin: 32px 0;
    text-align: center;
  }
  .tracking-label {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #C8B89A;
    margin-bottom: 12px;
  }
  .tracking-serial {
    font-family: 'Courier New', monospace;
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 4px;
    color: #D4A853;
    margin: 0;
  }
  .tracking-hint {
    font-size: 13px;
    color: #999999;
    margin-top: 12px;
  }
  .button-container {
    text-align: center;
    margin: 40px 0;
  }
  .button {
    display: inline-block;
    background-color: #000000;
    color: #FFFFFF;
    text-decoration: none;
    padding: 16px 40px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    border: 1px solid #C8B89A;
    transition: all 0.3s ease;
  }
  .button:hover {
    background-color: #C8B89A;
    color: #000000;
  }
  .divider {
    border: none;
    border-top: 1px solid #333333;
    margin: 32px 0;
  }
  .info-section {
    background-color: #000000;
    border-left: 3px solid #D4A853;
    padding: 20px;
    margin: 24px 0;
  }
  .info-section h3 {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: #D4A853;
  }
  .info-section ul {
    margin: 0;
    padding-left: 20px;
    color: #CCCCCC;
  }
  .info-section li {
    margin-bottom: 8px;
    line-height: 1.6;
  }
  .cta-box {
    background-color: #000000;
    border: 1px solid #333333;
    padding: 24px;
    margin: 32px 0;
    text-align: center;
  }
  .cta-box p {
    margin: 0 0 16px 0;
    font-size: 15px;
    color: #CCCCCC;
  }
  .cta-link {
    display: inline-block;
    color: #D4A853;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    border-bottom: 2px solid #D4A853;
    padding-bottom: 2px;
  }
  .footer {
    padding: 30px 40px;
    font-size: 12px;
    color: #666666;
    text-align: center;
    border-top: 1px solid #333333;
  }
  .footer a {
    color: #C8B89A;
    text-decoration: none;
  }
  p {
    margin: 0 0 16px 0;
  }
  .text-muted {
    color: #999999;
    font-size: 14px;
  }
`;

interface GuestServiceRequestEmailData {
  guestName: string;
  trackingSerial: string;
  projectTitle: string;
  trackingUrl: string;
  siteUrl: string;
  createAccountUrl: string;
}

/**
 * Email template for guest service request submission
 * Includes tracking serial and link to public tracking page
 */
export function getGuestServiceRequestEmailHtml(
  data: GuestServiceRequestEmailData
): string {
  const {
    guestName,
    trackingSerial,
    projectTitle,
    trackingUrl,
    siteUrl,
    createAccountUrl,
  } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Request Confirmation - Sizer</title>
      <style>${getLuxuryEmailStyles()}</style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="header">
            <a href="${siteUrl}" class="logo">S I Z E R</a>
          </div>
          
          <div class="content">
            <div class="greeting">Thank you, ${guestName}</div>
            
            <p>We have successfully received your service request for <strong>"${projectTitle}"</strong>.</p>
            
            <div class="tracking-box">
              <div class="tracking-label">Your Tracking Serial</div>
              <p class="tracking-serial">${trackingSerial}</p>
              <p class="tracking-hint">Save this number to track your request</p>
            </div>
            
            <p>Use this unique tracking serial to check the status of your request at any time. No account required.</p>
            
            <div class="button-container">
              <a href="${trackingUrl}" class="button">Track Your Request</a>
            </div>
            
            <p class="text-muted" style="text-align: center; font-size: 13px;">
              Or copy this link: <a href="${trackingUrl}" style="color: #D4A853; word-break: break-all;">${trackingUrl}</a>
            </p>
            
            <hr class="divider">
            
            <div class="info-section">
              <h3>What Happens Next?</h3>
              <ul>
                <li>Our team will review your request within 24-48 hours</li>
                <li>You'll receive email updates as your project progresses</li>
                <li>Track real-time status using your tracking serial</li>
                <li>We'll reach out if we need any additional information</li>
              </ul>
            </div>
            
            <div class="cta-box">
              <p><strong>Want full access to your project dashboard?</strong></p>
              <p class="text-muted">Create a Sizer account to unlock advanced features, collaborate with our team, and manage all your projects in one place.</p>
              <a href="${createAccountUrl}" class="cta-link">Create Your Account →</a>
            </div>
            
            <p style="margin-top: 32px; color: #CCCCCC;">
              If you have any questions, feel free to reply to this email.<br>
              We're here to help bring your vision to life.
            </p>
            
            <p style="margin-top: 24px; color: #999999;">
              Best regards,<br>
              <strong style="color: #FFFFFF;">The Sizer Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Sizer. All rights reserved.</p>
            <p>
              <a href="${siteUrl}">Visit our website</a> | 
              <a href="${siteUrl}/contact">Contact us</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Plain text version of the guest service request email
 */
export function getGuestServiceRequestEmailText(
  data: GuestServiceRequestEmailData
): string {
  const {
    guestName,
    trackingSerial,
    projectTitle,
    trackingUrl,
    createAccountUrl,
  } = data;

  return `
SIZER - Service Request Confirmation

Thank you, ${guestName}

We have successfully received your service request for "${projectTitle}".

YOUR TRACKING SERIAL: ${trackingSerial}

Save this number to track your request at any time.

Track your request: ${trackingUrl}

WHAT HAPPENS NEXT?
- Our team will review your request within 24-48 hours
- You'll receive email updates as your project progresses
- Track real-time status using your tracking serial
- We'll reach out if we need any additional information

WANT FULL ACCESS?
Create a Sizer account to unlock advanced features, collaborate with our team, and manage all your projects in one place.

Create your account: ${createAccountUrl}

If you have any questions, feel free to reply to this email.
We're here to help bring your vision to life.

Best regards,
The Sizer Team

---
© ${new Date().getFullYear()} Sizer. All rights reserved.
  `.trim();
}

/**
 * Email template for status update notifications
 */
export function getServiceRequestStatusUpdateEmailHtml(data: {
  guestName: string;
  trackingSerial: string;
  projectTitle: string;
  oldStatus: string;
  newStatus: string;
  statusMessage?: string;
  trackingUrl: string;
  siteUrl: string;
}): string {
  const {
    guestName,
    trackingSerial,
    projectTitle,
    newStatus,
    statusMessage,
    trackingUrl,
    siteUrl,
  } = data;

  const statusLabels: Record<string, string> = {
    submitted: "Submitted",
    in_progress: "In Progress",
    review: "Under Review",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Status Update - ${trackingSerial}</title>
      <style>${getLuxuryEmailStyles()}</style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="header">
            <a href="${siteUrl}" class="logo">S I Z E R</a>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${guestName},</div>
            
            <p>Your service request <strong>"${projectTitle}"</strong> has been updated.</p>
            
            <div class="tracking-box">
              <div class="tracking-label">Tracking Serial</div>
              <p class="tracking-serial">${trackingSerial}</p>
              <div class="tracking-label" style="margin-top: 16px;">New Status</div>
              <p style="font-size: 20px; font-weight: 600; color: #C8B89A; margin: 8px 0 0 0;">
                ${statusLabels[newStatus] || newStatus}
              </p>
            </div>
            
            ${statusMessage ? `<p style="background-color: #000000; padding: 16px; border-left: 3px solid #D4A853;">${statusMessage}</p>` : ""}
            
            <div class="button-container">
              <a href="${trackingUrl}" class="button">View Full Details</a>
            </div>
            
            <p style="margin-top: 32px; color: #999999;">
              Best regards,<br>
              <strong style="color: #FFFFFF;">The Sizer Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Sizer. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Made with Bob
