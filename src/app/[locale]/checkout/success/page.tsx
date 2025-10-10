/**
 * Payment success page
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { CheckCircleIcon, EnvelopeIcon, PhoneIcon } from "@/lib/icons";
import { ClearCartOnSuccess } from "@/components/checkout/ClearCartOnSuccess";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string; session_id?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });

  return {
    title: t("orderConfirmation"),
    description: "Vaše objednávka byla úspěšně dokončena.",
  };
}

export default async function CheckoutSuccessPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { orderId } = await searchParams;
  const t = await getTranslations({ locale, namespace: "checkout" });

  // Get session_id from query params (Stripe redirects with this)
  const sessionId = (await searchParams).session_id;

  if (!sessionId && !orderId) {
    notFound();
  }

  // Fetch order details from database using session_id
  let order: any = null;
  let error: string | null = null;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    // Query order by session_id or orderId
    const query = supabase
      .from("orders")
      .select("*")
      .limit(1);

    if (sessionId) {
      query.eq("session_id", sessionId);
    } else if (orderId) {
      query.eq("id", orderId);
    }

    const { data, error: dbError } = await query.single();

    if (dbError) {
      console.error("[Success Page] Error fetching order:", dbError);
      error = "Order not found";
    } else {
      order = data;
    }
  } catch (err) {
    console.error("[Success Page] Error:", err);
    error = "Failed to load order details";
  }

  // Clear cart from Redis (fire and forget)
  if (sessionId) {
    try {
      // This will be handled client-side or via API call
      // For now, we'll add a client component to handle this
    } catch (err) {
      console.error("[Success Page] Error clearing cart:", err);
    }
  }

  // If order not found, show basic success message
  if (!order) {
    return (
      <div className="min-h-screen bg-teal-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-elegant text-3xl font-bold text-primary-800 mb-4">
              {t("orderConfirmation")}
            </h1>

            <p className="text-lg text-teal-600 mb-2">
              Děkujeme za vaši objednávku. Platba byla úspěšně zpracována.
            </p>

            {error && (
              <p className="text-sm text-red-600 mt-4">
                {error}. Potvrzení objednávky bylo odesláno na váš email.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`/${locale}/products`}>
              <Button className="flex items-center justify-center">Pokračovat v nákupu</Button>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

  // Parse order data
  const orderNumber = order.order_number;
  const items = order.items || [];
  const customerInfo = order.customer_info || {};
  const deliveryMethod = order.delivery_method || "delivery";
  const deliveryInfo = order.delivery_info || {};
  const pickupLocation = order.pickup_location;
  const subtotal = order.subtotal || 0;
  const deliveryCost = order.delivery_cost || 0;
  const totalAmount = order.total_amount || 0;

  return (
    <>
      <ClearCartOnSuccess />
      <div className="min-h-screen bg-teal-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-elegant text-3xl font-bold text-primary-800 mb-4">
            {t("orderConfirmation")}
          </h1>

          <p className="text-lg text-teal-600 mb-2">
            Děkujeme za vaši objednávku. Platba byla úspěšně zpracována.
          </p>

          <p className="text-sm text-teal-500">Objednávka #{orderNumber}</p>
        </div>

        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-sm border border-teal-200 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-green-50 border-b border-green-200">
            <h2 className="text-lg font-semibold text-green-800">Platba byla úspěšně zpracována</h2>
          </div>

          <div className="p-6">
            <p className="text-teal-700 mb-4">
              Vaše objednávka pohřebních věnců byla úspěšně vytvořena a platba byla zpracována. Na
              váš email ({customerInfo.email}) jsme odeslali potvrzení s detaily objednávky.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Číslo objednávky: {orderNumber}</h3>
              <p className="text-blue-700 text-sm">
                Toto číslo si prosím uložte pro případné dotazy ohledně vaší objednávky.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-teal-200 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-teal-50 border-b border-teal-200">
            <h2 className="text-lg font-semibold text-teal-800">Souhrn objednávky</h2>
          </div>

          <div className="p-6">
            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start pb-4 border-b border-teal-100 last:border-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-teal-800">{item.productName || "Produkt"}</h4>
                    <p className="text-sm text-teal-600">Množství: {item.quantity}</p>
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="mt-1 text-xs text-teal-500">
                        {item.customizations.map((custom: any, idx: number) => (
                          <div key={idx}>
                            {custom.optionName}: {custom.value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-teal-800">{item.price?.toFixed(2)} Kč</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Information */}
            <div className="mb-6 pb-6 border-b border-teal-100">
              <h4 className="font-medium text-teal-800 mb-2">Způsob doručení</h4>
              {deliveryMethod === "delivery" ? (
                <div className="text-sm text-teal-600">
                  <p className="font-medium">Doručení na adresu:</p>
                  <p>{deliveryInfo.street}</p>
                  <p>{deliveryInfo.postalCode} {deliveryInfo.city}</p>
                  <p>{deliveryInfo.country || "CZ"}</p>
                </div>
              ) : (
                <div className="text-sm text-teal-600">
                  <p className="font-medium">Osobní odběr:</p>
                  <p>{pickupLocation || "Prodejna"}</p>
                </div>
              )}
            </div>

            {/* Order Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-teal-700">
                <span>Mezisoučet:</span>
                <span>{subtotal.toFixed(2)} Kč</span>
              </div>
              <div className="flex justify-between text-teal-700">
                <span>Doprava:</span>
                <span>{deliveryCost === 0 ? "Zdarma" : `${deliveryCost.toFixed(2)} Kč`}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-teal-800 pt-2 border-t border-teal-200">
                <span>Celkem:</span>
                <span>{totalAmount.toFixed(2)} Kč</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Co bude následovat?</h3>
          <div className="space-y-3 text-sm text-blue-700">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <p>
                <strong>Potvrzení objednávky:</strong> Na váš email jsme odeslali potvrzení s
                detaily objednávky.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <p>
                <strong>Příprava věnce:</strong> Naši floristé začnou připravovat váš věnec podle
                vašich požadavků.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <p>
                <strong>Doručení:</strong> Věnec bude doručen {deliveryMethod === "delivery" ? "na uvedenou adresu" : "připraven k osobnímu odběru"} v požadovaném
                termínu.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href={`/${locale}/orders`}>
            <Button variant="outline" className="flex items-center justify-center">
              Zobrazit objednávky
            </Button>
          </a>

          <a href={`/${locale}/products`}>
            <Button className="flex items-center justify-center">Pokračovat v nákupu</Button>
          </a>
        </div>

        {/* Contact Information */}
        <div className="text-center mt-12 pt-8 border-t border-teal-200">
          <p className="text-sm text-teal-600 mb-2">Máte otázky k vaší objednávce?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a
              href="mailto:info@pohrebni-vence.cz"
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <EnvelopeIcon className="w-4 h-4 mr-1" />
              info@pohrebni-vence.cz
            </a>
            <a
              href="tel:+420123456789"
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <PhoneIcon className="w-4 h-4 mr-1" />
              +420 123 456 789
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}>
            <Button className="flex items-center justify-center">Pokračovat v nákupu</Button>
          </a>
        </div>

        {/* Contact Information */}
        <div className="text-center mt-12 pt-8 border-t border-teal-200">
          <p className="text-sm text-teal-600 mb-2">Máte otázky k vaší objednávce?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a
              href="mailto:info@pohrebni-vence.cz"
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <EnvelopeIcon className="w-4 h-4 mr-1" />
              info@pohrebni-vence.cz
            </a>
            <a
              href="tel:+420123456789"
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <PhoneIcon className="w-4 h-4 mr-1" />
              +420 123 456 789
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
