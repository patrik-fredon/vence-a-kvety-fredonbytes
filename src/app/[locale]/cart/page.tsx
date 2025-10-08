import { getTranslations } from "next-intl/server";
import { ShoppingCart } from "@/components/cart/ShoppingCart";

interface CartPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params;
  const t = await getTranslations("cart");

  return (

    <div className="max-w-4xl mx-auto ">
      {/* TODO translation */}
       <div className="m-8 mx-auto w-4xl text-center justify-center">
        <h2 className="flex justify-center items-center text-elegant text-4xl font-semibold mb-8">
          {t("title")}
        </h2>
        </div>
        <div className="container mx-auto px-4 py-12 min-h-screen">
        <ShoppingCart locale={locale} showHeader={false} />
      </div>
    </div>
  );
}
