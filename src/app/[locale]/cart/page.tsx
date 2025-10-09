import { getTranslations } from "next-intl/server";
import { ShoppingCart } from "@/components/cart/ShoppingCart";

interface CartPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params;
  const t = await getTranslations("cart");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-elegant text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 md:mb-4 text-teal-900">
            {t("title")}
          </h2>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full border border-amber-300">
            <svg
              className="w-5 h-5 text-teal-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm sm:text-base font-medium text-teal-800">
              {t("freeDeliveryRibbon")}
            </span>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 min-h-screen">
        <ShoppingCart locale={locale} showHeader={false} />
      </div>
    </div>
  );
}
