import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CheckoutPageClient } from "./CheckoutPageClient";

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

  // Check if delivery method is selected (Requirement 2.7)
  const hasDeliveryMethod = cart.items.some((item) =>
    item.customizations?.some((c) => c.optionId === "delivery_method")
  );

  if (!hasDeliveryMethod) {
    // Redirect back to cart with error message
    const { redirect } = await import("next/navigation");
    redirect(`/${locale}/cart?error=delivery_method_required`);
  }

  // Create embedded checkout session
  const { createEmbeddedCheckoutSession } = await import("@/lib/stripe/embedded-checkout");

  let checkoutSession: { clientSecret: string; sessionId: string } | null = null;
  let sessionError: string | null = null;

  try {
    checkoutSession = await createEmbeddedCheckoutSession({
      cartItems: cart.items,
      locale: locale as "cs" | "en",
      metadata: {
        itemCount: cart.items.length.toString(),
      },
    });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    sessionError = error instanceof Error ? error.message : "Failed to create checkout session";
  }

  return (
    <CheckoutPageClient
      locale={locale}
      initialCart={cart}
      checkoutSession={checkoutSession}
      sessionError={sessionError}
    />
  );
}
