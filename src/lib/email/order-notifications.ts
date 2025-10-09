/**
 * Email service for order notifications with retry logic
 * Handles customer confirmations and admin notifications using SMTP
 */

import { render } from '@react-email/render';
import { smtpClient, type EmailResult } from './smtp-client';
import { CustomerConfirmationTemplate, type CustomerConfirmationData } from './templates/customer-confirmation';
import { AdminNotificationTemplate, type AdminNotificationData } from './templates/admin-notification';

// Re-export types for convenience
export type { CustomerConfirmationData, AdminNotificationData };

/**
 * Email service class with retry logic and comprehensive error handling
 */
export class OrderEmailService {
  private maxRetries: number;
  private retryDelay: number;

  constructor(maxRetries = 3, retryDelay = 1000) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * Send customer confirmation email
   */
  async sendCustomerConfirmation(data: CustomerConfirmationData): Promise<EmailResult> {
    try {
      console.log('Preparing customer confirmation email', {
        orderNumber: data.orderNumber,
        customerEmail: data.customerEmail,
        locale: data.locale,
      });

      // Render email templates
      const html = await render(CustomerConfirmationTemplate(data));
      const text = this.generateCustomerConfirmationText(data);

      const subject = data.locale === 'cs' 
        ? `Potvrzení objednávky #${data.orderNumber} - Pohřební věnce`
        : `Order Confirmation #${data.orderNumber} - Funeral Wreaths`;

      // Send email with retry logic
      const result = await this.sendEmailWithRetry({
        to: data.customerEmail,
        subject,
        html,
        text,
      }, this.maxRetries);

      if (result.success) {
        console.log('Customer confirmation email sent successfully', {
          orderNumber: data.orderNumber,
          customerEmail: data.customerEmail,
          messageId: result.messageId,
          retryCount: result.retryCount,
        });
      } else {
        console.error('Failed to send customer confirmation email', {
          orderNumber: data.orderNumber,
          customerEmail: data.customerEmail,
          error: result.error,
          retryCount: result.retryCount,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in sendCustomerConfirmation:', {
        orderNumber: data.orderNumber,
        error: errorMessage,
      });

      return {
        success: false,
        error: `Failed to prepare customer confirmation email: ${errorMessage}`,
      };
    }
  }

  /**
   * Send admin notification email
   */
  async sendAdminNotification(data: AdminNotificationData): Promise<EmailResult> {
    try {
      const adminEmail = process.env['ADMIN_EMAIL'];
      if (!adminEmail) {
        console.error('ADMIN_EMAIL environment variable not set');
        return {
          success: false,
          error: 'Admin email not configured',
        };
      }

      console.log('Preparing admin notification email', {
        orderNumber: data.orderNumber,
        adminEmail,
        totalAmount: data.totalAmount,
        deliveryMethod: data.deliveryMethod,
      });

      // Render email templates
      const html = await render(AdminNotificationTemplate(data));
      const text = this.generateAdminNotificationText(data);

      const subject = `🚨 Nová objednávka #${data.orderNumber} - ${data.customerName} (${data.totalAmount.toLocaleString('cs-CZ')} ${data.currency})`;

      // Send email with retry logic
      const result = await this.sendEmailWithRetry({
        to: adminEmail,
        subject,
        html,
        text,
        replyTo: data.customerEmail, // Allow admin to reply directly to customer
      }, this.maxRetries);

      if (result.success) {
        console.log('Admin notification email sent successfully', {
          orderNumber: data.orderNumber,
          adminEmail,
          messageId: result.messageId,
          retryCount: result.retryCount,
        });
      } else {
        console.error('Failed to send admin notification email', {
          orderNumber: data.orderNumber,
          adminEmail,
          error: result.error,
          retryCount: result.retryCount,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in sendAdminNotification:', {
        orderNumber: data.orderNumber,
        error: errorMessage,
      });

      return {
        success: false,
        error: `Failed to prepare admin notification email: ${errorMessage}`,
      };
    }
  }

  /**
   * Send both customer confirmation and admin notification
   */
  async sendOrderNotifications(
    customerData: CustomerConfirmationData,
    adminData: AdminNotificationData
  ): Promise<{
    customerResult: EmailResult;
    adminResult: EmailResult;
    success: boolean;
  }> {
    console.log('Sending order notifications', {
      orderNumber: customerData.orderNumber,
      customerEmail: customerData.customerEmail,
    });

    // Send both emails concurrently
    const [customerResult, adminResult] = await Promise.all([
      this.sendCustomerConfirmation(customerData),
      this.sendAdminNotification(adminData),
    ]);

    const success = customerResult.success && adminResult.success;

    console.log('Order notifications completed', {
      orderNumber: customerData.orderNumber,
      customerSuccess: customerResult.success,
      adminSuccess: adminResult.success,
      overallSuccess: success,
    });

    return {
      customerResult,
      adminResult,
      success,
    };
  }

  /**
   * Send email with exponential backoff retry logic
   */
  private async sendEmailWithRetry(
    mailOptions: {
      to: string;
      subject: string;
      html: string;
      text: string;
      replyTo?: string;
    },
    maxRetries: number
  ): Promise<EmailResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Initialize SMTP client if needed
        await smtpClient.initialize();

        // Send email
        const result = await smtpClient.sendMail({
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html,
          text: mailOptions.text,
          replyTo: mailOptions.replyTo,
        }, 1); // Don't retry in SMTP client, we handle retries here

        return {
          ...result,
          retryCount: attempt - 1,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        console.error(`Email sending failed (attempt ${attempt}/${maxRetries}):`, {
          to: mailOptions.to,
          subject: mailOptions.subject,
          error: lastError.message,
        });

        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError)) {
          console.error('Non-retryable error encountered, stopping retries:', lastError.message);
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * this.retryDelay; // 2s, 4s, 8s...
          console.log(`Waiting ${delay}ms before retry...`);
          await this.delay(delay);
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      retryCount: maxRetries,
    };
  }

  /**
   * Check if error is non-retryable
   */
  private isNonRetryableError(error: Error): boolean {
    const nonRetryablePatterns = [
      /invalid login/i,
      /authentication failed/i,
      /invalid recipient/i,
      /invalid sender/i,
      /mailbox unavailable/i,
      /recipient address rejected/i,
      /sender address rejected/i,
      /template rendering failed/i,
      /missing required/i,
    ];

    return nonRetryablePatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate plain text version of customer confirmation email
   */
  private generateCustomerConfirmationText(data: CustomerConfirmationData): string {
    const isCs = data.locale === 'cs';
    const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] || 'https://pohrebni-vence.cz';
    const trackingUrl = data.trackingUrl || `${baseUrl}/${data.locale}/orders/${data.orderNumber}`;

    return `
${isCs ? 'POTVRZENÍ OBJEDNÁVKY' : 'ORDER CONFIRMATION'}
${isCs ? 'Pohřební věnce' : 'Funeral Wreaths'}

${isCs ? 'Vážený' : 'Dear'} ${data.customerName},

${isCs 
  ? 'Děkujeme za vaši objednávku. Vaše objednávka byla úspěšně přijata a je nyní zpracovávána s náležitou péčí a respektem.'
  : 'Thank you for your order. Your order has been successfully received and is now being processed with appropriate care and respect.'
}

${isCs ? 'SHRNUTÍ OBJEDNÁVKY' : 'ORDER SUMMARY'}
${isCs ? 'Číslo objednávky' : 'Order Number'}: #${data.orderNumber}
${isCs ? 'Datum objednávky' : 'Order Date'}: ${new Date(data.createdAt).toLocaleDateString(data.locale)}

${isCs ? 'Sledovat objednávku' : 'Track Order'}: ${trackingUrl}

${isCs ? 'OBJEDNANÉ POLOŽKY' : 'ORDERED ITEMS'}:
${data.items.map((item, index) => `
${index + 1}. ${item.productName}
   ${isCs ? 'Množství' : 'Quantity'}: ${item.quantity}
   ${isCs ? 'Cena' : 'Price'}: ${item.price.toLocaleString('cs-CZ')} ${data.currency}
   ${item.customizations ? item.customizations.map(c => `   • ${c.optionName}: ${c.value}`).join('\n') : ''}
`).join('')}

${isCs ? 'SHRNUTÍ CENY' : 'PRICE SUMMARY'}:
${isCs ? 'Mezisoučet' : 'Subtotal'}: ${data.subtotal.toLocaleString('cs-CZ')} ${data.currency}
${isCs ? 'Doručení' : 'Delivery'}: ${data.deliveryCost.toLocaleString('cs-CZ')} ${data.currency}
${isCs ? 'CELKEM' : 'TOTAL'}: ${data.totalAmount.toLocaleString('cs-CZ')} ${data.currency}

${isCs ? 'INFORMACE O DORUČENÍ' : 'DELIVERY INFORMATION'}:
${isCs ? 'Způsob doručení' : 'Delivery Method'}: ${data.deliveryMethod === 'pickup' 
  ? (isCs ? 'Osobní odběr' : 'Personal Pickup')
  : (isCs ? 'Doručení na adresu' : 'Delivery to Address')
}

${data.deliveryMethod === 'pickup' && data.pickupLocation ? `
${isCs ? 'Místo odběru' : 'Pickup Location'}: ${data.pickupLocation}
${isCs ? 'Otevírací doba' : 'Opening Hours'}: ${isCs ? 'Po-Pá: 8:00-17:00, So: 9:00-14:00' : 'Mon-Fri: 8:00-17:00, Sat: 9:00-14:00'}
` : ''}

${data.deliveryMethod === 'delivery' && data.deliveryAddress ? `
${isCs ? 'Doručovací adresa' : 'Delivery Address'}:
${data.deliveryAddress.street}
${data.deliveryAddress.city}, ${data.deliveryAddress.postalCode}
${data.deliveryAddress.country}
` : ''}

${data.deliveryDate ? `
${isCs ? 'Preferovaný termín' : 'Preferred Date'}: ${new Date(data.deliveryDate).toLocaleDateString(data.locale)}
` : ''}

${isCs ? 'DALŠÍ KROKY' : 'NEXT STEPS'}:
1. ${isCs ? 'Vaše objednávka je nyní zpracovávána našimi specialisty' : 'Your order is now being processed by our specialists'}
2. ${isCs ? 'Budeme vás informovat o průběhu přípravy' : 'We will keep you informed about the preparation progress'}
3. ${data.deliveryMethod === 'pickup' 
  ? (isCs ? 'Kontaktujeme vás, až bude objednávka připravena k odběru' : 'We will contact you when ready for pickup')
  : (isCs ? 'Domluvíme si přesný čas doručení' : 'We will arrange the exact delivery time')
}

${isCs ? 'POTŘEBUJETE POMOC?' : 'NEED HELP?'}
${isCs ? 'V případě jakýchkoli dotazů nebo změn v objednávce nás neváhejte kontaktovat:' : 'If you have any questions or need to make changes to your order, please contact us:'}

E-mail: info@pohrebni-vence.cz
Telefon: +420 123 456 789
${isCs ? 'Otevírací doba' : 'Opening Hours'}: ${isCs ? 'Po-Pá: 8:00-17:00, So: 9:00-14:00' : 'Mon-Fri: 8:00-17:00, Sat: 9:00-14:00'}

${isCs 
  ? 'Děkujeme za vaši důvěru v této těžké chvíli. Jsme tu pro vás a postáráme se o vše s maximální péčí a respektem.'
  : 'Thank you for your trust during this difficult time. We are here for you and will take care of everything with maximum care and respect.'
}

${isCs ? 'S úctou,' : 'With respect,'}
${isCs ? 'Tým Pohřební věnce' : 'Funeral Wreaths Team'}

---
© 2024 ${isCs ? 'Pohřební věnce - Ketingmar s.r.o.' : 'Funeral Wreaths - Ketingmar Ltd.'}
`;
  }

  /**
   * Generate plain text version of admin notification email
   */
  private generateAdminNotificationText(data: AdminNotificationData): string {
    const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] || 'https://pohrebni-vence.cz';
    const adminUrl = `${baseUrl}/cs/admin/orders/${data.orderId}`;
    
    const isUrgentDelivery = data.deliveryDate ? 
      new Date(data.deliveryDate).getTime() - new Date().getTime() < 2 * 24 * 60 * 60 * 1000 : false;

    return `
🚨 NOVÁ OBJEDNÁVKA PŘIJATA
Pohřební věnce - Admin notifikace

Objednávka #${data.orderNumber}
Přijato: ${new Date(data.createdAt).toLocaleDateString('cs-CZ')}

${isUrgentDelivery ? `
⚠️ URGENTNÍ DORUČENÍ
Požadované datum: ${new Date(data.deliveryDate!).toLocaleDateString('cs-CZ')}
` : ''}

Admin panel: ${adminUrl}

INFORMACE O ZÁKAZNÍKOVI:
Jméno: ${data.customerName}
E-mail: ${data.customerEmail}
${data.customerPhone ? `Telefon: ${data.customerPhone}` : ''}
Jazyk: ${data.locale === 'cs' ? 'Čeština' : 'Angličtina'}

OBJEDNANÉ POLOŽKY (${data.items.length}):
${data.items.map((item, index) => `
${index + 1}. ${item.productName}
   Množství: ${item.quantity}
   Cena: ${item.price.toLocaleString('cs-CZ')} ${data.currency}
   ${item.customizations ? item.customizations.map(c => `   • ${c.optionName}: ${c.value}`).join('\n') : ''}
`).join('')}

SHRNUTÍ CENY:
Mezisoučet: ${data.subtotal.toLocaleString('cs-CZ')} ${data.currency}
Doručení: ${data.deliveryCost.toLocaleString('cs-CZ')} ${data.currency}
CELKEM: ${data.totalAmount.toLocaleString('cs-CZ')} ${data.currency}

INFORMACE O DORUČENÍ:
Způsob: ${data.deliveryMethod === 'pickup' ? 'Osobní odběr' : 'Doručení na adresu'}

${data.deliveryMethod === 'pickup' && data.pickupLocation ? `
Místo odběru: ${data.pickupLocation}
` : ''}

${data.deliveryMethod === 'delivery' && data.deliveryAddress ? `
Doručovací adresa:
${data.deliveryAddress.street}
${data.deliveryAddress.city}, ${data.deliveryAddress.postalCode}
${data.deliveryAddress.country}
` : ''}

${data.deliveryDate ? `
${isUrgentDelivery ? '⚠️ URGENTNÍ' : ''} Preferovaný termín: ${new Date(data.deliveryDate).toLocaleDateString('cs-CZ')}
` : ''}

${data.paymentInfo ? `
INFORMACE O PLATBĚ:
Způsob platby: ${data.paymentInfo.method}
${data.paymentInfo.transactionId ? `ID transakce: ${data.paymentInfo.transactionId}` : ''}
Stav platby: ${data.paymentInfo.status}
` : ''}

${data.specialInstructions ? `
SPECIÁLNÍ POKYNY:
${data.specialInstructions}
` : ''}

DOPORUČENÉ AKCE:
1. Zkontrolovat dostupnost položek
2. Naplánovat výrobu
3. Kontaktovat zákazníka
${isUrgentDelivery ? '4. ⚠️ PRIORITA: Urgentní termín - zpracovat přednostně!' : ''}
${isUrgentDelivery ? '5.' : '4.'} Aktualizovat stav na "zpracovává se"

TECHNICKÉ INFORMACE:
ID objednávky: ${data.orderId}
Čas přijetí: ${new Date(data.createdAt).toISOString()}
Celková hodnota: ${data.totalAmount} ${data.currency}
Počet položek: ${data.items.reduce((sum, item) => sum + item.quantity, 0)}

---
Tento e-mail byl automaticky vygenerován při přijetí nové objednávky.
Pro správu objednávky použijte admin panel: ${adminUrl}
`;
  }
}

// Export singleton instance
export const orderEmailService = new OrderEmailService();

// Export convenience functions
export async function sendCustomerConfirmation(data: CustomerConfirmationData): Promise<EmailResult> {
  return orderEmailService.sendCustomerConfirmation(data);
}

export async function sendAdminNotification(data: AdminNotificationData): Promise<EmailResult> {
  return orderEmailService.sendAdminNotification(data);
}

export async function sendOrderNotifications(
  customerData: CustomerConfirmationData,
  adminData: AdminNotificationData
) {
  return orderEmailService.sendOrderNotifications(customerData, adminData);
}

// Utility function to create email data from order object
export function createEmailDataFromOrder(order: any, locale: 'cs' | 'en' = 'cs'): {
  customerData: CustomerConfirmationData;
  adminData: AdminNotificationData;
} {
  const baseData = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
    customerEmail: order.customerInfo.email,
    customerPhone: order.customerInfo.phone,
    items: order.items.map((item: any) => ({
      productName: item.productName,
      quantity: item.quantity,
      price: item.totalPrice,
      customizations: item.customizations,
    })),
    subtotal: order.subtotal,
    deliveryCost: order.deliveryCost,
    totalAmount: order.totalAmount,
    currency: order.currency || 'Kč',
    deliveryMethod: order.deliveryMethod,
    deliveryAddress: order.deliveryInfo?.address,
    pickupLocation: order.pickupLocation,
    deliveryDate: order.deliveryInfo?.preferredDate,
    locale,
    createdAt: order.createdAt,
  };

  const customerData: CustomerConfirmationData = {
    ...baseData,
    trackingUrl: `${process.env['NEXT_PUBLIC_BASE_URL'] || 'https://pohrebni-vence.cz'}/${locale}/orders/${order.orderNumber}`,
  };

  const adminData: AdminNotificationData = {
    ...baseData,
    ...(order.paymentInfo && {
      paymentInfo: {
        method: order.paymentInfo.method,
        transactionId: order.paymentInfo.transactionId,
        status: order.paymentInfo.status,
      }
    }),
    ...(order.specialInstructions && {
      specialInstructions: order.specialInstructions
    }),
  };

  return { customerData, adminData };
}