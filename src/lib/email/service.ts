/**
 * Email notification service for order management
 * Handles order confirmations, status updates, and customer notifications
 */

import type { Order, OrderStatus } from "@/types/order";

// Email service configuration
interface EmailConfig {
  apiKey: string | undefined;
  fromEmail: string;
  fromName: string;
  baseUrl: string;
}

// Email template data
interface OrderEmailData {
  order: Order;
  customerName: string;
  customerEmail: string;
  locale: "cs" | "en";
}

// Email service class
export class EmailService {
  private config: EmailConfig;

  constructor() {
    this.config = {
      apiKey: process.env['RESEND_API_KEY'],
      fromEmail: process.env['FROM_EMAIL'] || "objednavky@pohrebni-vence.cz",
      fromName: process.env['FROM_NAME'] || "Pohřební věnce",
      baseUrl: process.env['NEXT_PUBLIC_BASE_URL'] || "http://localhost:3000",
    };
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const { order, customerEmail, locale } = data;

      const subject =
        locale === "cs"
          ? `Potvrzení objednávky #${order.orderNumber}`
          : `Order Confirmation #${order.orderNumber}`;

      const htmlContent = this.generateOrderConfirmationHTML(data);
      const textContent = this.generateOrderConfirmationText(data);

      // If Resend is configured, use it; otherwise log for development
      if (this.config.apiKey && process.env['NODE_ENV'] === "production") {
        return await this.sendWithResend({
          to: customerEmail,
          subject,
          html: htmlContent,
          text: textContent,
        });
      } else {
        // Development mode - log email content
        console.log("📧 Order Confirmation Email (Development Mode)");
        console.log("To:", customerEmail);
        console.log("Subject:", subject);
        console.log("Content:", textContent);
        return { success: true };
      }
    } catch (error) {
      console.error("Error sending order confirmation:", error);
      return { success: false, error: "Failed to send confirmation email" };
    }
  }

  /**
   * Send order status update email
   */
  async sendStatusUpdate(
    data: OrderEmailData & { newStatus: OrderStatus }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { order, customerEmail, locale, newStatus } = data;

      const subject =
        locale === "cs"
          ? `Aktualizace objednávky #${order.orderNumber}`
          : `Order Update #${order.orderNumber}`;

      const htmlContent = this.generateStatusUpdateHTML({ ...data, newStatus });
      const textContent = this.generateStatusUpdateText({ ...data, newStatus });

      if (this.config.apiKey && process.env['NODE_ENV'] === "production") {
        return await this.sendWithResend({
          to: customerEmail,
          subject,
          html: htmlContent,
          text: textContent,
        });
      } else {
        console.log("📧 Order Status Update Email (Development Mode)");
        console.log("To:", customerEmail);
        console.log("Subject:", subject);
        console.log("New Status:", newStatus);
        console.log("Content:", textContent);
        return { success: true };
      }
    } catch (error) {
      console.error("Error sending status update:", error);
      return { success: false, error: "Failed to send status update email" };
    }
  }

  /**
   * Send email using Resend service
   */
  private async sendWithResend(emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          to: [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend API error: ${error}`);
      }

      return { success: true };
    } catch (error) {
      console.error("Resend API error:", error);
      return { success: false, error: "Failed to send email via Resend" };
    }
  }

  /**
   * Generate HTML content for order confirmation
   */
  private generateOrderConfirmationHTML(data: OrderEmailData): string {
    const { order, customerName, locale } = data;
    const isCs = locale === "cs";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${isCs ? "Potvrzení objednávky" : "Order Confirmation"}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .item { border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
    .total { font-weight: bold; font-size: 1.2em; color: #1f2937; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isCs ? "Potvrzení objednávky" : "Order Confirmation"}</h1>
      <p>${isCs ? "Objednávka" : "Order"} #${order.orderNumber}</p>
    </div>

    <div class="content">
      <p>${isCs ? "Vážený" : "Dear"} ${customerName},</p>

      <p>${
        isCs
          ? "Děkujeme za vaši objednávku. Níže najdete podrobnosti:"
          : "Thank you for your order. Please find the details below:"
      }</p>

      <div class="order-details">
        <h3>${isCs ? "Objednané položky" : "Ordered Items"}</h3>
        ${order.items
          .map(
            (item) => `
          <div class="item">
            <strong>${item.productName}</strong><br>
            ${isCs ? "Množství" : "Quantity"}: ${item.quantity}<br>
            ${isCs ? "Cena" : "Price"}: ${item.totalPrice.toLocaleString("cs-CZ")} Kč
          </div>
        `
          )
          .join("")}

        <div class="total">
          <p>${
            isCs ? "Celková částka" : "Total Amount"
          }: ${order.totalAmount.toLocaleString("cs-CZ")} Kč</p>
        </div>
      </div>

      <div class="order-details">
        <h3>${isCs ? "Doručení" : "Delivery"}</h3>
        
        ${
          order.deliveryMethod === "pickup"
            ? `
          <p><strong>${isCs ? "Způsob doručení" : "Delivery Method"}:</strong><br>
          ${isCs ? "Osobní odběr" : "Personal Pickup"}</p>
          
          ${
            order.pickupLocation
              ? `
            <p><strong>${isCs ? "Místo odběru" : "Pickup Location"}:</strong><br>
            ${order.pickupLocation}</p>
            
            <p><strong>${isCs ? "Otevírací doba" : "Opening Hours"}:</strong><br>
            ${isCs ? "Po-Pá: 9:00-17:00" : "Mon-Fri: 9:00-17:00"}</p>
          `
              : ""
          }
        `
            : `
          <p><strong>${isCs ? "Způsob doručení" : "Delivery Method"}:</strong><br>
          ${isCs ? "Doručení na adresu" : "Delivery to Address"}</p>
          
          <p><strong>${isCs ? "Adresa" : "Address"}:</strong><br>
          ${order.deliveryInfo.address.street}<br>
          ${order.deliveryInfo.address.city}, ${order.deliveryInfo.address.postalCode}</p>
        `
        }

        ${
          order.deliveryInfo.preferredDate
            ? `
          <p><strong>${isCs ? "Preferovaný termín" : "Preferred Date"}:</strong><br>
          ${new Date(order.deliveryInfo.preferredDate).toLocaleDateString(locale)}</p>
        `
            : ""
        }
      </div>

      <p>${
        isCs
          ? "Budeme vás informovat o dalších krocích zpracování vaší objednávky."
          : "We will keep you informed about the next steps in processing your order."
      }</p>

      <p>${
        isCs
          ? "V případě dotazů nás neváhejte kontaktovat."
          : "Please don't hesitate to contact us if you have any questions."
      }</p>
    </div>

    <div class="footer">
      <p>${this.config.fromName}<br>
      ${isCs ? "Telefon" : "Phone"}: +420 XXX XXX XXX<br>
      Email: ${this.config.fromEmail}</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Generate text content for order confirmation
   */
  private generateOrderConfirmationText(data: OrderEmailData): string {
    const { order, customerName, locale } = data;
    const isCs = locale === "cs";

    return `
${isCs ? "POTVRZENÍ OBJEDNÁVKY" : "ORDER CONFIRMATION"}
${isCs ? "Objednávka" : "Order"} #${order.orderNumber}

${isCs ? "Vážený" : "Dear"} ${customerName},

${
  isCs
    ? "Děkujeme za vaši objednávku. Níže najdete podrobnosti:"
    : "Thank you for your order. Please find the details below:"
}

${isCs ? "OBJEDNANÉ POLOŽKY:" : "ORDERED ITEMS:"}
${order.items
  .map(
    (item) => `
- ${item.productName}
  ${isCs ? "Množství" : "Quantity"}: ${item.quantity}
  ${isCs ? "Cena" : "Price"}: ${item.totalPrice.toLocaleString("cs-CZ")} Kč
`
  )
  .join("")}

${isCs ? "CELKOVÁ ČÁSTKA" : "TOTAL AMOUNT"}: ${order.totalAmount.toLocaleString("cs-CZ")} Kč

${isCs ? "DORUČENÍ:" : "DELIVERY:"}
${isCs ? "Způsob doručení" : "Delivery Method"}: ${
      order.deliveryMethod === "pickup"
        ? isCs
          ? "Osobní odběr"
          : "Personal Pickup"
        : isCs
          ? "Doručení na adresu"
          : "Delivery to Address"
    }

${
  order.deliveryMethod === "pickup" && order.pickupLocation
    ? `
${isCs ? "Místo odběru" : "Pickup Location"}: ${order.pickupLocation}
${isCs ? "Otevírací doba" : "Opening Hours"}: ${isCs ? "Po-Pá: 9:00-17:00" : "Mon-Fri: 9:00-17:00"}
`
    : ""
}

${
  order.deliveryMethod !== "pickup"
    ? `
${isCs ? "Adresa" : "Address"}: ${order.deliveryInfo.address.street}, ${
        order.deliveryInfo.address.city
      }, ${order.deliveryInfo.address.postalCode}
`
    : ""
}

${
  order.deliveryInfo.preferredDate
    ? `${isCs ? "Preferovaný termín" : "Preferred Date"}: ${new Date(
        order.deliveryInfo.preferredDate
      ).toLocaleDateString(locale)}`
    : ""
}

${
  isCs
    ? "Budeme vás informovat o dalších krocích zpracování vaší objednávky."
    : "We will keep you informed about the next steps in processing your order."
}

${
  isCs
    ? "V případě dotazů nás neváhejte kontaktovat."
    : "Please don't hesitate to contact us if you have any questions."
}

${this.config.fromName}
${isCs ? "Telefon" : "Phone"}: +420 XXX XXX XXX
Email: ${this.config.fromEmail}
`;
  }

  /**
   * Generate HTML content for status update
   */
  private generateStatusUpdateHTML(data: OrderEmailData & { newStatus: OrderStatus }): string {
    const { order, customerName, locale, newStatus } = data;
    const isCs = locale === "cs";

    const statusMessages = {
      cs: {
        pending: "Vaše objednávka čeká na zpracování.",
        confirmed: "Vaše objednávka byla potvrzena a je připravována k odeslání.",
        processing: "Vaše objednávka se zpracovává.",
        shipped: "Vaše objednávka byla odeslána a je na cestě.",
        delivered: "Vaše objednávka byla úspěšně doručena.",
        cancelled: "Vaše objednávka byla zrušena.",
      },
      en: {
        pending: "Your order is pending processing.",
        confirmed: "Your order has been confirmed and is being prepared for shipment.",
        processing: "Your order is being processed.",
        shipped: "Your order has been shipped and is on its way.",
        delivered: "Your order has been successfully delivered.",
        cancelled: "Your order has been cancelled.",
      },
    };

    const statusMessage = statusMessages[locale][newStatus] || "";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${isCs ? "Aktualizace objednávky" : "Order Update"}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .status-update { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isCs ? "Aktualizace objednávky" : "Order Update"}</h1>
      <p>${isCs ? "Objednávka" : "Order"} #${order.orderNumber}</p>
    </div>

    <div class="content">
      <p>${isCs ? "Vážený" : "Dear"} ${customerName},</p>

      <div class="status-update">
        <h3>${isCs ? "Nový stav objednávky" : "New Order Status"}: ${newStatus.toUpperCase()}</h3>
        <p>${statusMessage}</p>
      </div>

      <p>${
        isCs
          ? "Děkujeme za vaši důvěru a těšíme se na další spolupráci."
          : "Thank you for your trust and we look forward to serving you again."
      }</p>
    </div>

    <div class="footer">
      <p>${this.config.fromName}<br>
      Email: ${this.config.fromEmail}</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Generate text content for status update
   */
  private generateStatusUpdateText(data: OrderEmailData & { newStatus: OrderStatus }): string {
    const { order, customerName, locale, newStatus } = data;
    const isCs = locale === "cs";

    const statusMessages = {
      cs: {
        pending: "Vaše objednávka čeká na zpracování.",
        confirmed: "Vaše objednávka byla potvrzena a je připravována k odeslání.",
        processing: "Vaše objednávka se zpracovává.",
        shipped: "Vaše objednávka byla odeslána a je na cestě.",
        delivered: "Vaše objednávka byla úspěšně doručena.",
        cancelled: "Vaše objednávka byla zrušena.",
      },
      en: {
        pending: "Your order is pending processing.",
        confirmed: "Your order has been confirmed and is being prepared for shipment.",
        processing: "Your order is being processed.",
        shipped: "Your order has been shipped and is on its way.",
        delivered: "Your order has been successfully delivered.",
        cancelled: "Your order has been cancelled.",
      },
    };

    const statusMessage = statusMessages[locale][newStatus] || "";

    return `
${isCs ? "AKTUALIZACE OBJEDNÁVKY" : "ORDER UPDATE"}
${isCs ? "Objednávka" : "Order"} #${order.orderNumber}

${isCs ? "Vážený" : "Dear"} ${customerName},

${isCs ? "NOVÝ STAV OBJEDNÁVKY" : "NEW ORDER STATUS"}: ${newStatus.toUpperCase()}

${statusMessage}

${
  isCs
    ? "Děkujeme za vaši důvěru a těšíme se na další spolupráci."
    : "Thank you for your trust and we look forward to serving you again."
}

${this.config.fromName}
Email: ${this.config.fromEmail}
`;
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Helper function to send order confirmation
export async function sendOrderConfirmationEmail(
  order: Order,
  locale: "cs" | "en" = "cs"
): Promise<{ success: boolean; error?: string }> {
  const customerName = `${order.customerInfo.firstName} ${order.customerInfo.lastName}`;
  const customerEmail = order.customerInfo.email;

  return emailService.sendOrderConfirmation({
    order,
    customerName,
    customerEmail,
    locale,
  });
}

// Helper function to send status update
export async function sendOrderStatusUpdateEmail(
  order: Order,
  newStatus: OrderStatus,
  locale: "cs" | "en" = "cs"
): Promise<{ success: boolean; error?: string }> {
  const customerName = `${order.customerInfo.firstName} ${order.customerInfo.lastName}`;
  const customerEmail = order.customerInfo.email;

  return emailService.sendStatusUpdate({
    order,
    customerName,
    customerEmail,
    locale,
    newStatus,
  });
}
