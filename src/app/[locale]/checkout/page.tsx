import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

interface CheckoutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });

  return {
    title: t("title"),
    description: "Dokončete svou objednávku pohřebních věnců",
    robots: "noindex, nofollow", // Checkout pages should not be indexed
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params;

  // Validate locale
  if (!["cs", "en"].includes(locale)) {
    notFound();
  }

  // Fetch cart items server-side
  const { getServerCart } = await import("@/lib/services/cart-server-service");
  const cart = await getServerCart();

  // Redirect to cart if empty
  if (cart.items.length === 0) {
    const { redirect } = await import("next/navigation");
    redirect(`/${locale}/cart`);
  }

  // Check if delivery method is selected for all items
  const hasDeliveryMethod = cart.items.every((item) =>
    item.customizations?.some((c) => c.optionId === "delivery_method")
  );

  if (!hasDeliveryMethod) {
    // Redirect back to cart with error message
    const { redirect } = await import("next/navigation");
    redirect(`/${locale}/cart?error=delivery_method_required`);
  }

  // Import CheckoutForm
  const { CheckoutForm } = await import("@/components/checkout/CheckoutForm");

  return (
    <div className="min-h-screen bg-funeral-gold">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16 ">

        </div>
      </div>


      {/* Main Content */}
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutForm items={cart.items} locale={locale} />
      </div>
    </div>
  );
}
