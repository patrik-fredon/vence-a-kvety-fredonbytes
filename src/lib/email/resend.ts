/**
 * Resend email service configuration and utilities
 */

import { Resend } from "resend";
import type { AdminNotificationData, ContactEmailData } from "@/types/contact";

// Lazy initialization of Resend client
let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env['RESEND_API_KEY'];
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

// Email configuration
const EMAIL_CONFIG = {
  from: process.env['RESEND_FROM_EMAIL'] || "noreply@pohrebni-vence.cz",
  adminEmail: process.env['ADMIN_EMAIL'] || "admin@pohrebni-vence.cz",
  replyTo: process.env['RESEND_REPLY_TO'] || "info@pohrebni-vence.cz",
};

/**
 * Send customer thank you email
 */
export async function sendCustomerThankYouEmail(data: ContactEmailData) {
  try {
    const resend = getResendClient();
    const { data: emailData, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.customerEmail,
      replyTo: EMAIL_CONFIG.replyTo,
      subject: "Děkujeme za Vaši zprávu - Pohřební věnce",
      html: generateCustomerThankYouTemplate(data),
    });

    if (error) {
      console.error("Error sending customer thank you email:", error);
      throw new Error(`Failed to send customer email: ${error.message}`);
    }

    return emailData;
  } catch (error) {
    console.error("Error in sendCustomerThankYouEmail:", error);
    throw error;
  }
}

/**
 * Send admin notification email
 */
export async function sendAdminNotificationEmail(data: AdminNotificationData) {
  try {
    const resend = getResendClient();
    const { data: emailData, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.adminEmail,
      replyTo: data.customerEmail,
      subject: `Nová zpráva z kontaktního formuláře: ${data.subject}`,
      html: generateAdminNotificationTemplate(data),
    });

    if (error) {
      console.error("Error sending admin notification email:", error);
      throw new Error(`Failed to send admin email: ${error.message}`);
    }

    return emailData;
  } catch (error) {
    console.error("Error in sendAdminNotificationEmail:", error);
    throw error;
  }
}

/**
 * Generate customer thank you email template
 */
function generateCustomerThankYouTemplate(data: ContactEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="cs">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Děkujeme za Vaši zprávu</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #8B5A3C 0%, #A0522D 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #ffffff;
          padding: 30px 20px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          text-align: center;
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
          font-size: 14px;
          color: #6b7280;
        }
        .highlight {
          background: #fef3c7;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          border-left: 4px solid #f59e0b;
        }
        .contact-info {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">🌹 Pohřební věnce</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Děkujeme za Vaši zprávu</p>
      </div>

      <div class="content">
        <h2>Vážený/á ${data.customerName},</h2>

        <p>Děkujeme Vám za zprávu, kterou jste nám zaslal/a prostřednictvím našeho kontaktního formuláře. Vaši zprávu jsme obdrželi a budeme se Vám věnovat s náležitou péčí a respektem.</p>

        <div class="highlight">
          <strong>Vaše zpráva byla úspěšně odeslána dne:</strong> ${new Date(
    data.submittedAt
  ).toLocaleDateString("cs-CZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}
        </div>

        <h3>Shrnutí Vaší zprávy:</h3>
        <ul>
          <li><strong>Předmět:</strong> ${data.subject}</li>
          <li><strong>E-mail:</strong> ${data.customerEmail}</li>
          ${data.customerPhone ? `<li><strong>Telefon:</strong> ${data.customerPhone}</li>` : ""}
        </ul>

        <p><strong>Zpráva:</strong></p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 3px solid #8B5A3C;">
          ${data.message.replace(/\n/g, "<br>")}
        </div>

        <div class="contact-info">
          <h3>Kontaktní informace:</h3>
          <p>
            <strong>Telefon:</strong> +420 123 456 789<br>
            <strong>E-mail:</strong> info@pohrebni-vence.cz<br>
            <strong>Adresa:</strong> Hlavní 123, 110 00 Praha 1<br>
            <strong>Otevírací doba:</strong> Po-Pá: 8:00-17:00, So: 9:00-14:00
          </p>
        </div>

        <p>Na Vaši zprávu odpovíme co nejdříve, obvykle do 24 hodin. V naléhavých případech nás neváhejte kontaktovat telefonicky.</p>

        <p>S úctou,<br>
        <strong>Tým Pohřební věnce</strong></p>
      </div>

      <div class="footer">
        <p>Tento e-mail byl automaticky vygenerován. Prosím neodpovídejte na tuto adresu.</p>
        <p>© 2024 Pohřební věnce - Ketingmar s.r.o. Všechna práva vyhrazena.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate admin notification email template
 */
function generateAdminNotificationTemplate(data: AdminNotificationData): string {
  return `
    <!DOCTYPE html>
    <html lang="cs">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nová zpráva z kontaktního formuláře</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #ffffff;
          padding: 30px 20px;
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        .info-item {
          background: #f9fafb;
          padding: 15px;
          border-radius: 6px;
          border-left: 3px solid #8B5A3C;
        }
        .message-box {
          background: #fef3c7;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
          border-left: 4px solid #f59e0b;
        }
        .technical-info {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          font-size: 12px;
          color: #6b7280;
        }
        .urgent {
          background: #fef2f2;
          border-left-color: #dc2626;
          color: #dc2626;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 20px;">🚨 Nová zpráva z kontaktního formuláře</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Pohřební věnce - Admin notifikace</p>
      </div>

      <div class="content">
        <h2>Nová zpráva od zákazníka</h2>

        <div class="info-grid">
          <div class="info-item">
            <strong>Jméno:</strong><br>
            ${data.customerName}
          </div>
          <div class="info-item">
            <strong>E-mail:</strong><br>
            <a href="mailto:${data.customerEmail}">${data.customerEmail}</a>
          </div>
          ${data.customerPhone
      ? `
          <div class="info-item">
            <strong>Telefon:</strong><br>
            <a href="tel:${data.customerPhone}">${data.customerPhone}</a>
          </div>
          `
      : ""
    }
          <div class="info-item">
            <strong>Datum odeslání:</strong><br>
            ${new Date(data.submittedAt).toLocaleDateString("cs-CZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
          </div>
        </div>

        <div class="info-item" style="margin: 20px 0;">
          <strong>Předmět:</strong><br>
          ${data.subject}
        </div>

        <div class="message-box">
          <h3 style="margin-top: 0;">Zpráva zákazníka:</h3>
          <div style="white-space: pre-wrap; font-family: Georgia, serif; font-size: 16px; line-height: 1.7;">
${data.message}
          </div>
        </div>

        <div class="technical-info">
          <h4 style="margin-top: 0;">Technické informace:</h4>
          <p style="margin: 5px 0;"><strong>IP adresa:</strong> ${data.ipAddress || "Neznámá"}</p>
          <p style="margin: 5px 0;"><strong>User Agent:</strong> ${data.userAgent || "Neznámý"}</p>
        </div>

        <div style="background: #dbeafe; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="margin-top: 0; color: #1e40af;">Doporučené akce:</h3>
          <ul style="margin: 10px 0;">
            <li>Odpovězte zákazníkovi do 24 hodin</li>
            <li>Označte zprávu jako přečtenou v admin panelu</li>
            <li>V případě naléhavosti kontaktujte zákazníka telefonicky</li>
          </ul>
        </div>

        <p style="text-align: center; margin-top: 30px;">
          <a href="mailto:${data.customerEmail}?subject=Re: ${data.subject}"
             style="background: #8B5A3C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Odpovědět zákazníkovi
          </a>
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Validate email configuration
 */
export function validateEmailConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env['RESEND_API_KEY']) {
    errors.push("RESEND_API_KEY is not configured");
  }

  if (!process.env['RESEND_FROM_EMAIL']) {
    errors.push("RESEND_FROM_EMAIL is not configured");
  }

  if (!process.env['ADMIN_EMAIL']) {
    errors.push("ADMIN_EMAIL is not configured");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
