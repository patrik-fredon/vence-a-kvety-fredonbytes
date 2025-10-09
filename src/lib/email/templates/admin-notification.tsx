/**
 * Admin notification email template
 * Includes all order details, customer information, direct link to admin dashboard,
 * highlights urgent delivery dates, and formats for easy processing
 */

import { Section, Text, Link } from '@react-email/components';
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

export interface AdminNotificationData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
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
  paymentInfo?: {
    method: string;
    transactionId?: string;
    status: string;
  };
  specialInstructions?: string;
}

export function AdminNotificationTemplate({ 
  orderId,
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
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
  paymentInfo,
  specialInstructions
}: AdminNotificationData) {
  const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] || 'https://pohrebni-vence.cz';
  const adminUrl = `${baseUrl}/${locale}/admin/orders/${orderId}`;
  
  // Check if delivery is urgent (within 2 days)
  const isUrgentDelivery = deliveryDate ? 
    new Date(deliveryDate).getTime() - new Date().getTime() < 2 * 24 * 60 * 60 * 1000 : false;

  const title = `🚨 Nová objednávka #${orderNumber} - Admin notifikace`;
  const previewText = `Nová objednávka od ${customerName} - ${totalAmount.toLocaleString('cs-CZ')} ${currency}`;

  return (
    <BaseTemplate 
      locale="cs" 
      title={title}
      previewText={previewText}
    >
      {/* Alert Header */}
      <EmailSection background="accent">
        <EmailHeading level={1}>
          🚨 Nová objednávka přijata
        </EmailHeading>

        <Text className="text-lg font-semibold text-neutral-800 m-0 mb-2">
          Objednávka #{orderNumber}
        </Text>

        <Text className="text-sm text-neutral-600 m-0 mb-4">
          Přijato: {new Date(createdAt).toLocaleDateString('cs-CZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>

        {isUrgentDelivery && (
          <Section className="bg-red-100 border-l-4 border-red-500 p-4 rounded mb-4">
            <Text className="text-red-700 font-bold m-0 mb-1">
              ⚠️ URGENTNÍ DORUČENÍ
            </Text>
            <Text className="text-red-600 text-sm m-0">
              Požadované datum doručení: {new Date(deliveryDate!).toLocaleDateString('cs-CZ')}
            </Text>
          </Section>
        )}

        <EmailButton href={adminUrl} variant="primary">
          🔗 Otevřít v admin panelu
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      {/* Customer Information */}
      <EmailSection>
        <EmailHeading level={2}>
          👤 Informace o zákazníkovi
        </EmailHeading>

        <Section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section className="bg-neutral-50 p-4 rounded">
            <Text className="font-semibold text-neutral-800 m-0 mb-2">
              Jméno zákazníka
            </Text>
            <Text className="text-lg text-neutral-700 m-0">
              {customerName}
            </Text>
          </Section>

          <Section className="bg-neutral-50 p-4 rounded">
            <Text className="font-semibold text-neutral-800 m-0 mb-2">
              E-mail
            </Text>
            <Text className="text-sm text-neutral-700 m-0">
              <Link href={`mailto:${customerEmail}`} className="text-primary-600">
                {customerEmail}
              </Link>
            </Text>
          </Section>

          {customerPhone && (
            <Section className="bg-neutral-50 p-4 rounded">
              <Text className="font-semibold text-neutral-800 m-0 mb-2">
                Telefon
              </Text>
              <Text className="text-sm text-neutral-700 m-0">
                <Link href={`tel:${customerPhone}`} className="text-primary-600">
                  {customerPhone}
                </Link>
              </Text>
            </Section>
          )}

          <Section className="bg-neutral-50 p-4 rounded">
            <Text className="font-semibold text-neutral-800 m-0 mb-2">
              Jazyk objednávky
            </Text>
            <Text className="text-sm text-neutral-700 m-0">
              {locale === 'cs' ? '🇨🇿 Čeština' : '🇬🇧 Angličtina'}
            </Text>
          </Section>
        </Section>

        <Section className="mt-4 text-center">
          <EmailButton 
            href={`mailto:${customerEmail}?subject=Re: Objednávka #${orderNumber}`}
            variant="secondary"
          >
            📧 Odpovědět zákazníkovi
          </EmailButton>
        </Section>
      </EmailSection>

      <EmailDivider />

      {/* Order Items */}
      <EmailSection>
        <EmailHeading level={2}>
          📦 Objednané položky ({items.length})
        </EmailHeading>

        {items.map((item, index) => (
          <OrderItem
            key={index}
            name={item.productName}
            quantity={item.quantity}
            price={item.price}
            {...(item.customizations && { customizations: item.customizations })}
            locale="cs"
          />
        ))}
      </EmailSection>

      {/* Price Summary */}
      <PriceSummary
        subtotal={subtotal}
        deliveryCost={deliveryCost}
        totalAmount={totalAmount}
        currency={currency}
        locale="cs"
      />

      <EmailDivider />

      {/* Delivery Information */}
      <EmailSection>
        <EmailHeading level={2}>
          🚚 Informace o doručení
        </EmailHeading>

        {deliveryMethod === 'pickup' ? (
          <EmailSection background="gray">
            <Text className="text-primary-700 font-medium text-lg m-0 mb-3">
              📍 Osobní odběr
            </Text>
            
            {pickupLocation && (
              <Text className="text-sm text-neutral-600 m-0 mb-2">
                <strong>Místo odběru:</strong><br />
                {pickupLocation}
              </Text>
            )}

            {deliveryDate && (
              <Section className={`p-3 rounded mb-3 ${isUrgentDelivery ? 'bg-red-100 border-red-300' : 'bg-blue-100 border-blue-300'} border`}>
                <Text className={`font-semibold m-0 mb-1 ${isUrgentDelivery ? 'text-red-700' : 'text-blue-700'}`}>
                  {isUrgentDelivery ? '⚠️ URGENTNÍ' : '📅'} Preferovaný termín odběru:
                </Text>
                <Text className={`text-sm m-0 ${isUrgentDelivery ? 'text-red-600' : 'text-blue-600'}`}>
                  {new Date(deliveryDate).toLocaleDateString('cs-CZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </Section>
            )}

            <Section className="bg-accent-100 p-3 rounded">
              <Text className="text-accent-700 font-medium text-sm m-0">
                💡 Akce: Připravit objednávku a kontaktovat zákazníka pro domluvení odběru
              </Text>
            </Section>
          </EmailSection>
        ) : (
          <EmailSection background="gray">
            <Text className="text-primary-700 font-medium text-lg m-0 mb-3">
              🏠 Doručení na adresu
            </Text>
            
            {deliveryAddress && (
              <Section className="bg-white p-4 rounded border mb-3">
                <Text className="font-semibold text-neutral-800 m-0 mb-2">
                  📍 Doručovací adresa:
                </Text>
                <Text className="text-sm text-neutral-700 m-0">
                  {deliveryAddress.street}<br />
                  {deliveryAddress.city}, {deliveryAddress.postalCode}<br />
                  {deliveryAddress.country}
                </Text>
              </Section>
            )}

            {deliveryDate && (
              <Section className={`p-3 rounded mb-3 ${isUrgentDelivery ? 'bg-red-100 border-red-300' : 'bg-blue-100 border-blue-300'} border`}>
                <Text className={`font-semibold m-0 mb-1 ${isUrgentDelivery ? 'text-red-700' : 'text-blue-700'}`}>
                  {isUrgentDelivery ? '⚠️ URGENTNÍ' : '📅'} Preferovaný termín doručení:
                </Text>
                <Text className={`text-sm m-0 ${isUrgentDelivery ? 'text-red-600' : 'text-blue-600'}`}>
                  {new Date(deliveryDate).toLocaleDateString('cs-CZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </Section>
            )}

            <Section className="bg-accent-100 p-3 rounded">
              <Text className="text-accent-700 font-medium text-sm m-0">
                💡 Akce: Připravit objednávku a naplánovat doručení na požadovaný termín
              </Text>
            </Section>
          </EmailSection>
        )}
      </EmailSection>

      <EmailDivider />

      {/* Payment Information */}
      {paymentInfo && (
        <>
          <EmailSection>
            <EmailHeading level={2}>
              💳 Informace o platbě
            </EmailHeading>

            <Section className="bg-neutral-50 p-4 rounded">
              <Text className="text-sm text-neutral-600 m-0 mb-2">
                <strong>Způsob platby:</strong> {paymentInfo.method}
              </Text>
              
              {paymentInfo.transactionId && (
                <Text className="text-sm text-neutral-600 m-0 mb-2">
                  <strong>ID transakce:</strong> {paymentInfo.transactionId}
                </Text>
              )}
              
              <Text className="text-sm text-neutral-600 m-0">
                <strong>Stav platby:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  paymentInfo.status === 'completed' ? 'bg-green-100 text-green-700' :
                  paymentInfo.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {paymentInfo.status}
                </span>
              </Text>
            </Section>
          </EmailSection>

          <EmailDivider />
        </>
      )}

      {/* Special Instructions */}
      {specialInstructions && (
        <>
          <EmailSection>
            <EmailHeading level={2}>
              📝 Speciální pokyny
            </EmailHeading>

            <Section className="bg-accent-50 border-l-4 border-accent-400 p-4 rounded">
              <Text className="text-neutral-700 m-0 whitespace-pre-wrap">
                {specialInstructions}
              </Text>
            </Section>
          </EmailSection>

          <EmailDivider />
        </>
      )}

      {/* Action Items */}
      <EmailSection background="accent">
        <EmailHeading level={2}>
          ✅ Doporučené akce
        </EmailHeading>

        <Text className="text-sm text-neutral-700 m-0 mb-2">
          1. <strong>Zkontrolovat dostupnost položek</strong> - Ověřit skladové zásoby
        </Text>

        <Text className="text-sm text-neutral-700 m-0 mb-2">
          2. <strong>Naplánovat výrobu</strong> - Přidat do výrobního plánu
        </Text>

        <Text className="text-sm text-neutral-700 m-0 mb-2">
          3. <strong>Kontaktovat zákazníka</strong> - Potvrdit detaily objednávky
        </Text>

        {isUrgentDelivery && (
          <Text className="text-sm text-red-700 bg-red-100 p-3 rounded m-0 mb-2">
            4. <strong>⚠️ PRIORITA:</strong> Urgentní termín - zpracovat přednostně!
          </Text>
        )}

        <Text className="text-sm text-neutral-700 m-0 mb-4">
          {isUrgentDelivery ? '5.' : '4.'} <strong>Aktualizovat stav</strong> - Označit jako "zpracovává se"
        </Text>

        <Section className="text-center">
          <EmailButton href={adminUrl} variant="primary">
            🔧 Spravovat objednávku
          </EmailButton>
        </Section>
      </EmailSection>

      <EmailDivider />

      {/* Technical Information */}
      <EmailSection>
        <EmailHeading level={2}>
          🔧 Technické informace
        </EmailHeading>

        <Section className="bg-neutral-50 p-4 rounded text-xs text-neutral-500">
          <Text className="m-0 mb-1">
            <strong>ID objednávky:</strong> {orderId}
          </Text>
          <Text className="m-0 mb-1">
            <strong>Čas přijetí:</strong> {new Date(createdAt).toISOString()}
          </Text>
          <Text className="m-0 mb-1">
            <strong>Celková hodnota:</strong> {totalAmount} {currency}
          </Text>
          <Text className="m-0">
            <strong>Počet položek:</strong> {items.reduce((sum, item) => sum + item.quantity, 0)}
          </Text>
        </Section>
      </EmailSection>

      <EmailDivider />

      {/* Footer Note */}
      <EmailText variant="small">
        Tento e-mail byl automaticky vygenerován při přijetí nové objednávky. 
        Pro správu objednávky použijte admin panel nebo odpovězte přímo zákazníkovi.
      </EmailText>

      <EmailText variant="small">
        <strong>Důležité:</strong> Nezapomeňte aktualizovat stav objednávky v systému 
        a informovat zákazníka o průběhu zpracování.
      </EmailText>
    </BaseTemplate>
  );
}

export default AdminNotificationTemplate;