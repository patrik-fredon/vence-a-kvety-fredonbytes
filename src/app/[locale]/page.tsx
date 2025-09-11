import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  StructuredData,
  generateOrganizationStructuredData,
  generateWebsiteStructuredData
} from "@/components/seo/StructuredData";

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  const t = await getTranslations("home");

  // Generate structured data for home page
  const organizationStructuredData = generateOrganizationStructuredData(locale);
  const websiteStructuredData = generateWebsiteStructuredData(locale);

  return (
    <>
      <StructuredData data={organizationStructuredData} />
      <StructuredData data={websiteStructuredData} />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-elegant text-5xl md:text-6xl font-semibold text-primary-800 mb-6">
            {t("title")}
          </h1>
          <p className="text-xl md:text-2xl text-neutral-700 mb-8 leading-relaxed">{t("subtitle")}</p>
          <p className="text-lg text-neutral-600 mb-12 max-w-2xl mx-auto">{t("description")}</p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href={`/${locale}/products`}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors shadow-elegant"
            >
              {t("browseWreaths")}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="border-2 border-primary-600 text-primary-700 hover:bg-primary-50 px-8 py-4 rounded-lg font-medium text-lg transition-colors"
            >
              {t("contactUs")}
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-6 bg-white/50 rounded-xl shadow-soft">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌹</span>
            </div>
            <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-3">
              {t("features.handcrafted.title")}
            </h3>
            <p className="text-neutral-600">{t("features.handcrafted.description")}</p>
          </div>

          <div className="text-center p-6 bg-white/50 rounded-xl shadow-soft">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚚</span>
            </div>
            <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-3">
              {t("features.fastDelivery.title")}
            </h3>
            <p className="text-neutral-600">{t("features.fastDelivery.description")}</p>
          </div>

          <div className="text-center p-6 bg-white/50 rounded-xl shadow-soft">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💝</span>
            </div>
            <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-3">
              {t("features.personalApproach.title")}
            </h3>
            <p className="text-neutral-600">{t("features.personalApproach.description")}</p>
          </div>
        </div>
      </div>
    </>
  );
}
