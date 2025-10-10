/**
 * Admin notification email template
 * Includes all order details, customer information, direct link to admin dashboard,
 * highlights urgent delivery dates, and formats for easy processing
 */

import { Link, Text } from "@react-email/components";
import {
  BaseTemplate,
  EmailButton,
  EmailDivider,
  EmailHeading,
  EmailSection,
  EmailText,
  OrderItem,
  PriceSummary,
} from "./base-template";

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
  deliveryMethod: "delivery" | "pickup";
  deliveryAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  pickupLocation?: string;
  deliveryDate?: string;
  locale: "cs" | "en";
  createdAt: string;
  paymentInfo?: {
    transactionId?: string;
    paymentMethod?: string;
    paymentStatus?: string;
  };
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
}: AdminNotificationData) {
  const isCs = locale === "cs";
  const baseUrl = process.env["NEXT_PUBLIC_BASE_URL"] || "https://pohrebni-vence.cz";
  const adminOrderUrl = `${baseUrl}/${locale}/admin/orders/${orderId}`;

  // Check if delivery date is urgent (within 48 hours)
  const isUrgent = deliveryDate
    ? new Date(deliveryDate).getTime() - Date.now() < 48 * 60 * 60 * 1000
    : false;

  const title = isCs ? `🔔 Nová objednávka #${orderNumber}` : `🔔 New Order #${orderNumber}`;

  const previewText = isCs
    ? `Nová objednávka od ${customerName} - ${totalAmount.toLocaleString("cs-CZ")} ${currency}`
    : `New order from ${customerName} - ${totalAmount.toLocaleString("cs-CZ")} ${currency}`;

  return (
    <BaseTemplate locale={locale} title={title} previewText={previewText}>
      {/* Alert Header */}
      <EmailSection
        background={isUrgent ? "accent" : "white"}
        className={isUrgent ? "border-2 border-accent-500" : ""}
      >
        <EmailHeading level={1}>
          {isCs ? "🔔 Nová objednávka přijata" : "🔔 New Order Received"}
        </EmailHeading>

        {isUrgent && (
          <Text className="text-accent-800 font-bold bg-accent-200 p-3 rounded m-0 mb-4">
            ⚠️ {isCs ? "URGENTNÍ: Doručení do 48 hodin!" : "URGENT: Delivery within 48 hours!"}
          </Text>
        )}

        <Text className="text-lg font-semibold text-neutral-800 m-0 mb-2">
          {isCs ? "Číslo objednávky" : "Order Number"}:{" "}
          <strong className="text-primary-700">#{orderNumber}</strong>
        </Text>

        <Text className="text-sm text-neutral-600 m-0 mb-4">
          {isCs ? "Datum přijetí" : "Received"}:{" "}
          {new Date(createdAt).toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>

        <EmailButton href={adminOrderUrl} variant="primary">
          {isCs ? "👉 Zobrazit v administraci" : "👉 View in Admin Dashboard"}
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      {/* Customer Information */}
      <EmailSection background="gray">
        <EmailHeading level={2}>
          👤 {isCs ? "Informace o zákazníkovi" : "Customer Information"}
        </EmailHeading>

        <Text className="text-sm text-neutral-700 m-0 mb-2">
          <strong>{isCs ? "Jméno" : "Name"}:</strong> {customerName}
        </Text>

        <Text className="text-sm text-neutral-700 m-0 mb-2">
          <strong>{isCs ? "Email" : "Email"}:</strong>{" "}
          <Link href={`mailto:${customerEmail}`} className="text-primary-600">
            {customerEmail}
          </Link>
        </Text>

        {customerPhone && (
          <Text className="text-sm text-neutral-700 m-0 mb-2">
            <strong>{isCs ? "Telefon" : "Phone"}:</strong>{" "}
            <Link href={`tel:${customerPhone}`} className="text-primary-600">
              {customerPhone}
            </Link>
          </Text>
        )}

        <Text className="text-sm text-neutral-700 m-0">
          <strong>{isCs ? "Jazyk" : "Language"}:</strong>{" "}
          {locale === "cs" ? "🇨🇿 Čeština" : "🇬🇧 English"}
        </Text>
      </EmailSection>

      <EmailDivider />

      {/* Delivery Information */}
      <EmailSection background={isUrgent ? "accent" : "gray"}>
        <EmailHeading level={2}>
          🚚 {isCs ? "Informace o doručení" : "Delivery Information"}
        </EmailHeading>

        <Text className="font-semibold text-neutral-800 m-0 mb-3">
          {isCs ? "Způsob doručení" : "Delivery Method"}:
        </Text>

        {deliveryMethod === "pickup" ? (
          <>
            <Text className="text-primary-700 font-medium text-lg m-0 mb-3">
              📍 {isCs ? "Osobní odběr" : "Personal Pickup"}
            </Text>

            {pickupLocation && (
              <Text className="text-sm text-neutral-700 m-0 mb-2">
                <strong>{isCs ? "Místo odběru" : "Pickup Location"}:</strong>
                <br />
                {pickupLocation}
              </Text>
            )}

            {deliveryDate && (
              <Text className="text-sm text-neutral-700 m-0 mb-2">
                <strong>{isCs ? "Preferovaný termín odběru" : "Preferred Pickup Date"}:</strong>
                <br />
                <span className={isUrgent ? "text-accent-700 font-bold" : ""}>
                  {new Date(deliveryDate).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Text>
            )}

            <Text className="text-xs text-primary-700 bg-primary-50 p-3 rounded m-0 mt-3">
              💡{" "}
              {isCs
                ? "Akce: Připravit objednávku a kontaktovat zákazníka pro potvrzení termínu odběru."
                : "Action: Prepare order and contact customer to confirm pickup time."}
            </Text>
          </>
        ) : (
          <>
            <Text className="text-primary-700 font-medium text-lg m-0 mb-3">
              🏠 {isCs ? "Doručení na adresu" : "Delivery to Address"}
            </Text>

            {deliveryAddress && (
              <Text className="text-sm text-neutral-700 m-0 mb-3">
                <strong>{isCs ? "Doručovací adresa" : "Delivery Address"}:</strong>
                <br />
                <span className="font-mono bg-white p-2 rounded inline-block">
                  {customerName}
                  <br />
                  {deliveryAddress.street}
                  <br />
                  {deliveryAddress.city}, {deliveryAddress.postalCode}
                  <br />
                  {deliveryAddress.country}
                </span>
              </Text>
            )}

            {deliveryDate && (
              <Text className="text-sm text-neutral-700 m-0 mb-2">
                <strong>{isCs ? "Preferovaný termín doručení" : "Preferred Delivery Date"}:</strong>
                <br />
                <span className={isUrgent ? "text-accent-700 font-bold text-lg" : "font-semibold"}>
                  {new Date(deliveryDate).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Text>
            )}

            <Text className="text-xs text-primary-700 bg-primary-50 p-3 rounded m-0 mt-3">
              💡{" "}
              {isCs
                ? "Akce: Připravit objednávku a kontaktovat zákazníka pro upřesnění času doručení."
                : "Action: Prepare order and contact customer to confirm delivery time."}
            </Text>
          </>
        )}
      </EmailSection>

      <EmailDivider />

      {/* Order Items */}
      <EmailSection>
        <EmailHeading level={2}>🛍️ {isCs ? "Objednané položky" : "Ordered Items"}</EmailHeading>

        <Text className="text-xs text-neutral-600 m-0 mb-4">
          {isCs ? "Celkem položek" : "Total items"}:{" "}
          <strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong>
        </Text>

        {items.map((item, index) => (
          <OrderItem
            key={`${item.productName}-${index}`}
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

      {/* Payment Information */}
      {paymentInfo && (
        <>
          <EmailSection background="gray">
            <EmailHeading level={2}>
              💳 {isCs ? "Informace o platbě" : "Payment Information"}
            </EmailHeading>

            <Text className="text-sm text-neutral-700 m-0 mb-2">
              <strong>{isCs ? "Stav platby" : "Payment Status"}:</strong>{" "}
              <span className="text-green-600 font-semibold">
                ✅ {paymentInfo.paymentStatus || (isCs ? "Zaplaceno" : "Paid")}
              </span>
            </Text>

            {paymentInfo.paymentMethod && (
              <Text className="text-sm text-neutral-700 m-0 mb-2">
                <strong>{isCs ? "Způsob platby" : "Payment Method"}:</strong>{" "}
                {paymentInfo.paymentMethod}
              </Text>
            )}

            {paymentInfo.transactionId && (
              <Text className="text-xs text-neutral-600 m-0 font-mono">
                <strong>{isCs ? "ID transakce" : "Transaction ID"}:</strong>
                <br />
                {paymentInfo.transactionId}
              </Text>
            )}
          </EmailSection>

          <EmailDivider />
        </>
      )}

      {/* Action Checklist */}
      <EmailSection background="accent">
        <EmailHeading level={2}>✅ {isCs ? "Kontrolní seznam" : "Action Checklist"}</EmailHeading>

        <Text className="text-sm text-neutral-700 m-0 mb-2">
          ☐ {isCs ? "Zkontrolovat dostupnost produktů" : "Check product availability"}
        </Text>

        <Text className="text-sm text-neutral-700 m-0 mb-2">
          ☐{" "}
          {isCs
            ? "Připravit objednávku podle specifikací"
            : "Prepare order according to specifications"}
        </Text>

        <Text className="text-sm text-neutral-700 m-0 mb-2">
          ☐{" "}
          {isCs
            ? "Kontaktovat zákazníka pro potvrzení termínu"
            : "Contact customer to confirm timing"}
        </Text>

        <Text className="text-sm text-neutral-700 m-0 mb-2">
          ☐{" "}
          {deliveryMethod === "pickup"
            ? isCs
              ? "Připravit k odběru"
              : "Prepare for pickup"
            : isCs
              ? "Naplánovat doručení"
              : "Schedule delivery"}
        </Text>

        <Text className="text-sm text-neutral-700 m-0 mb-4">
          ☐ {isCs ? "Aktualizovat stav objednávky v systému" : "Update order status in system"}
        </Text>

        <EmailButton href={adminOrderUrl} variant="primary">
          {isCs ? "📝 Zpracovat objednávku" : "📝 Process Order"}
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      {/* Quick Actions */}
      <EmailSection>
        <EmailHeading level={2}>⚡ {isCs ? "Rychlé akce" : "Quick Actions"}</EmailHeading>

        <Text className="text-sm m-0 mb-2">
          <Link href={adminOrderUrl} className="text-primary-600 font-medium">
            👉 {isCs ? "Zobrazit detail objednávky" : "View order details"}
          </Link>
        </Text>

        <Text className="text-sm m-0 mb-2">
          <Link href={`mailto:${customerEmail}`} className="text-primary-600 font-medium">
            📧 {isCs ? "Kontaktovat zákazníka emailem" : "Contact customer via email"}
          </Link>
        </Text>

        {customerPhone && (
          <Text className="text-sm m-0 mb-2">
            <Link href={`tel:${customerPhone}`} className="text-primary-600 font-medium">
              📞 {isCs ? "Zavolat zákazníkovi" : "Call customer"}
            </Link>
          </Text>
        )}

        <Text className="text-sm m-0">
          <Link href={`${baseUrl}/${locale}/admin/orders`} className="text-primary-600 font-medium">
            📋 {isCs ? "Zobrazit všechny objednávky" : "View all orders"}
          </Link>
        </Text>
      </EmailSection>

      <EmailDivider />

      {/* System Information */}
      <EmailSection background="gray">
        <EmailHeading level={3}>
          ℹ️ {isCs ? "Systémové informace" : "System Information"}
        </EmailHeading>

        <Text className="text-xs text-neutral-600 m-0 mb-1">
          <strong>{isCs ? "ID objednávky" : "Order ID"}:</strong>{" "}
          <code className="font-mono">{orderId}</code>
        </Text>

        <Text className="text-xs text-neutral-600 m-0 mb-1">
          <strong>{isCs ? "Číslo objednávky" : "Order Number"}:</strong>{" "}
          <code className="font-mono">#{orderNumber}</code>
        </Text>

        <Text className="text-xs text-neutral-600 m-0">
          <strong>{isCs ? "Vytvořeno" : "Created"}:</strong> {new Date(createdAt).toISOString()}
        </Text>
      </EmailSection>

      {/* Footer Note */}
      <EmailText variant="caption">
        {isCs
          ? "Tento email byl automaticky vygenerován systémem při přijetí nové objednávky. Pro zpracování objednávky použijte administrační rozhraní."
          : "This email was automatically generated by the system upon receiving a new order. Please use the admin dashboard to process the order."}
      </EmailText>
    </BaseTemplate>
  );
}

export default AdminNotificationTemplate;
