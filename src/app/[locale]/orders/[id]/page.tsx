import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderTracking } from "@/components/order/OrderTracking";

interface OrderTrackingPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: OrderTrackingPageProps): Promise<Metadata> {
  const { locale, id } = await params;

  return {
    title:
      locale === "cs"
        ? `Sledování objednávky #${id.slice(-8).toUpperCase()} | Pohřební věnce`
        : `Order Tracking #${id.slice(-8).toUpperCase()} | Funeral Wreaths`,
    description:
      locale === "cs"
        ? "Sledujte stav vaší objednávky pohřebních věnců v reálném čase."
        : "Track your funeral wreath order status in real-time.",
  };
}

export default async function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { locale, id } = await params;

  // Validate order ID format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrderTracking orderId={id} locale={locale} />
      </div>
    </div>
  );
}
