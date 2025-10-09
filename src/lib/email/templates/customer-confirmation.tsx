/**
 * Customer confirmation email template
 * Includes order number, items list, total amount, delivery information, 
 * order tracking link, and company branding
 */

import { Text, Link } from '@react-email/components';
import { 
  BaseTemplate, 
  EmailHeading, 
  EmailText, 
  EmailSection, 
  EmailButton,
  EmailDivider,
  OrderItem,
  PriceSummary
} from './base-template';

export interface CustomerConfirmationData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    customizations?: Array<{
      optionName: string;
      value: string;
    }>;
  }>;
  subtotal: number;
  deliveryCost: number;
  totalAmount: number;
  currency: string;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  pickupLocation?: string;
  deliveryDate?: string;
  locale: 'cs' | 'en';
  createdAt: string;
  trackingUrl?: string;
}

export function CustomerConfirmationTemplate({ 
  orderNumber,
  customerName,
  items,
  subtotal,
  deliveryCost,
  totalAmount,
  currency,
  deliveryMethod,
  deliveryAddress,
  pickupLocation,
  deliveryDate,
  locale,
  createdAt,
  trackingUrl
}: CustomerConfirmationData) {
  const isCs = locale === 'cs';
  const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] || 'https://pohrebni-vence.cz';
  const finalTrackingUrl = trackingUrl || `${baseUrl}/${locale}/orders/${orderNumber}`;

  const title = isCs 
    ? `Potvrzení objednávky #${orderNumber}` 
    : `Order Confirmation #${orderNumber}`;

  const previewText = isCs
    ? `Vaše objednávka #${orderNumber} byla úspěšně přijata. Děkujeme za vaši důvěru.`
    : `Your order #${orderNumber} has been successfully received. Thank you for your trust.`;

  return (
    <BaseTemplate 
      locale={locale} 
      title={title}
      previewText={previewText}
    >
      {/* Greeting */}
      <EmailHeading level={1}>
        {isCs ? 'Potvrzení objednávky' : 'Order Confirmation'}
      </EmailHeading>

      <EmailText>
        {isCs ? 'Vážený' : 'Dear'} <strong>{customerName}</strong>,
      </EmailText>

      <EmailText>
        {isCs 
          ? 'Děkujeme za vaši objednávku. Vaše objednávka byla úspěšně přijata a je nyní zpracovávána s náležitou péčí a respektem.'
          : 'Thank you for your order. Your order has been successfully received and is now being processed with appropriate care and respect.'
        }
      </EmailText>

      {/* Order Summary */}
      <EmailSection background="accent">
        <EmailHeading level={2}>
          📋 {isCs ? 'Shrnutí objednávky' : 'Order Summary'}
        </EmailHeading>
        
        <Text className="text-lg font-semibold text-neutral-800 m-0 mb-2">
          {isCs ? 'Číslo objednávky' : 'Order Number'}: <strong>#{orderNumber}</strong>
        </Text>
        
        <Text className="text-sm text-neutral-600 m-0 mb-4">
          {isCs ? 'Datum objednávky' : 'Order Date'}: {new Date(createdAt).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>

        <EmailButton href={finalTrackingUrl} variant="primary">
          {isCs ? '📦 Sledovat objednávku' : '📦 Track Order'}
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      {/* Order Items */}
      <EmailSection>
        <EmailHeading level={2}>
          🛍️ {isCs ? 'Objednané položky' : 'Ordered Items'}
        </EmailHeading>

        {items.map((item, index) => (
          <OrderItem
            key={index}
            name={item.productName}
            quantity={item.quantity}
            price={item.price}
            {...(item.customizations && { customizations: item.customizations })}
            locale={locale}
          />
        ))}
      </EmailSection>

      {/* Price Summary */}
      <PriceSummary
        subtotal={subtotal}
        deliveryCost={deliveryCost}
        totalAmount={totalAmount}
        currency={currency}
        locale={locale}
      />

      <EmailDivider />

      {/* Delivery Information */}
      <EmailSection>
        <EmailHeading level={2}>
          🚚 {isCs ? 'Informace o doručení' : 'Delivery Information'}
        </EmailHeading>

        <Text className="font-semibold text-neutral-800 m-0 mb-2">
          {isCs ? 'Způsob doručení' : 'Delivery Method'}:
        </Text>

        {deliveryMethod === 'pickup' ? (
          <EmailSection background="gray">
            <Text className="text-primary-700 font-medium m-0 mb-2">
              📍 {isCs ? 'Osobní odběr' : 'Personal Pickup'}
            </Text>
            
            {pickupLocation && (
              <Text className="text-sm text-neutral-600 m-0 mb-2">
                <strong>{isCs ? 'Místo odběru' : 'Pickup Location'}:</strong><br />
                {pickupLocation}
              </Text>
            )}
            
            <Text className="text-sm text-neutral-600 m-0 mb-2">
              <strong>{isCs ? 'Otevírací doba' : 'Opening Hours'}:</strong><br />
              {isCs ? 'Po-Pá: 8:00-17:00, So: 9:00-14:00' : 'Mon-Fri: 8:00-17:00, Sat: 9:00-14:00'}
            </Text>

            <Text className="text-sm text-accent-700 bg-accent-100 p-3 rounded m-0">
              ℹ️ {isCs 
                ? 'Budeme vás kontaktovat, jakmile bude vaše objednávka připravena k odběru.'
                : 'We will contact you when your order is ready for pickup.'
              }
            </Text>
          </EmailSection>
        ) : (
          <EmailSection background="gray">
            <Text className="text-primary-700 font-medium m-0 mb-2">
              🏠 {isCs ? 'Doručení na adresu' : 'Delivery to Address'}
            </Text>
            
            {deliveryAddress && (
              <Text className="text-sm text-neutral-600 m-0 mb-2">
                <strong>{isCs ? 'Doručovací adresa' : 'Delivery Address'}:</strong><br />
                {deliveryAddress.street}<br />
                {deliveryAddress.city}, {deliveryAddress.postalCode}<br />
                {deliveryAddress.country}
              </Text>
            )}

            {deliveryDate && (
              <Text className="text-sm text-neutral-600 m-0 mb-2">
                <strong>{isCs ? 'Preferovaný termín' : 'Preferred Date'}:</strong><br />
                {new Date(deliveryDate).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            )}

            <Text className="text-sm text-accent-700 bg-accent-100 p-3 rounded m-0">
              ℹ️ {isCs 
                ? 'Budeme vás kontaktovat před doručením pro upřesnění času.'
                : 'We will contact you before delivery to confirm the time.'
              }
            </Text>
          </EmailSection>
        )}
      </EmailSection>

      <EmailDivider />

      {/* Next Steps */}
      <EmailSection background="accent">
        <EmailHeading level={2}>
          ⏭️ {isCs ? 'Další kroky' : 'Next Steps'}
        </EmailHeading>

        <Text className="text-sm text-neutral-700 m-0 mb-2">
          1. {isCs 
            ? 'Vaše objednávka je nyní zpracovávána našimi specialisty'
            : 'Your order is now being processed by our specialists'
          }
        </Text>

        <Text className="text-sm text-neutral-700 m-0 mb-2">
          2. {isCs 
            ? 'Budeme vás informovat o průběhu přípravy'
            : 'We will keep you informed about the preparation progress'
          }
        </Text>

        <Text className="text-sm text-neutral-700 m-0 mb-4">
          3. {deliveryMethod === 'pickup' 
            ? (isCs ? 'Kontaktujeme vás, až bude objednávka připravena k odběru' : 'We will contact you when ready for pickup')
            : (isCs ? 'Domluvíme si přesný čas doručení' : 'We will arrange the exact delivery time')
          }
        </Text>

        <Text className="text-xs text-neutral-600 m-0">
          💡 {isCs 
            ? 'Sledovat stav objednávky můžete kdykoli pomocí odkazu výše.'
            : 'You can track your order status anytime using the link above.'
          }
        </Text>
      </EmailSection>

      <EmailDivider />

      {/* Support Information */}
      <EmailSection>
        <EmailHeading level={2}>
          💬 {isCs ? 'Potřebujete pomoc?' : 'Need Help?'}
        </EmailHeading>

        <EmailText variant="small">
          {isCs 
            ? 'V případě jakýchkoli dotazů nebo změn v objednávce nás neváhejte kontaktovat:'
            : 'If you have any questions or need to make changes to your order, please contact us:'
          }
        </EmailText>

        <Text className="text-sm text-neutral-600 m-0 mb-2">
          📧 <Link href="mailto:info@pohrebni-vence.cz" className="text-primary-600">
            info@pohrebni-vence.cz
          </Link>
        </Text>

        <Text className="text-sm text-neutral-600 m-0 mb-4">
          📞 <Link href="tel:+420123456789" className="text-primary-600">
            +420 123 456 789
          </Link>
        </Text>

        <Text className="text-xs text-neutral-500 m-0">
          {isCs 
            ? 'Náš tým je k dispozici Po-Pá: 8:00-17:00, So: 9:00-14:00'
            : 'Our team is available Mon-Fri: 8:00-17:00, Sat: 9:00-14:00'
          }
        </Text>
      </EmailSection>

      <EmailDivider />

      {/* Closing */}
      <EmailText>
        {isCs 
          ? 'Děkujeme za vaši důvěru v této těžké chvíli. Jsme tu pro vás a postáráme se o vše s maximální péčí a respektem.'
          : 'Thank you for your trust during this difficult time. We are here for you and will take care of everything with maximum care and respect.'
        }
      </EmailText>

      <EmailText>
        {isCs ? 'S úctou,' : 'With respect,'}
        <br />
        <strong>{isCs ? 'Tým Pohřební věnce' : 'Funeral Wreaths Team'}</strong>
      </EmailText>
    </BaseTemplate>
  );
}

export default CustomerConfirmationTemplate;