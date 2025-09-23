import { getTranslations } from "next-intl/server";
import { ShoppingCart } from "@/components/cart/ShoppingCart";

interface CartPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params;
  const t = await getTranslations("cart");

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-elegant text-4xl font-semibold mb-8">{t("title")}</h2>

        <ShoppingCart locale={locale} showHeader={false} />
      </div>
    </div>
  );
}
