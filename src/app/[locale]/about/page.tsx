import { getTranslations } from "next-intl/server";
import { generateAboutPageMetadata } from "@/components/seo/PageMetadata";
import {
  StructuredData,
  generateOrganizationStructuredData,
  generateLocalBusinessStructuredData
} from "@/components/seo/StructuredData";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

// Generate metadata for About page
export async function generateMetadata({ params }: AboutPageProps) {
  const { locale } = await params;
  return generateAboutPageMetadata(locale);
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const t = await getTranslations("about");

  // Generate structured data
  const organizationStructuredData = generateOrganizationStructuredData(locale);
  const localBusinessStructuredData = generateLocalBusinessStructuredData(locale);

  return (
    <>
      <StructuredData data={organizationStructuredData} />
      <StructuredData data={localBusinessStructuredData} />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-elegant text-4xl md:text-5xl font-semibold text-primary-800 text-center mb-4">
            {t("title")}
          </h1>

          <p className="text-lg text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
            {t("mission")}
          </p>

          <div className="space-y-12">
            {/* Company Story */}
            <div className="bg-white rounded-xl shadow-soft p-8">
              <h2 className="text-elegant text-2xl md:text-3xl font-semibold text-primary-800 mb-6">
                Naše příběh
              </h2>
              <p className="text-neutral-700 leading-relaxed text-lg">
                {t("story")}
              </p>
            </div>

            {/* Values and Quality */}
            <div className="bg-white rounded-xl shadow-soft p-8">
              <h2 className="text-elegant text-2xl md:text-3xl font-semibold text-primary-800 mb-6">
                Kvalita a péče
              </h2>
              <p className="text-neutral-700 leading-relaxed text-lg">
                {t("values")}
              </p>
            </div>

            {/* Commitment */}
            <div className="bg-white rounded-xl shadow-soft p-8">
              <h2 className="text-elegant text-2xl md:text-3xl font-semibold text-primary-800 mb-6">
                Náš závazek
              </h2>
              <p className="text-neutral-700 leading-relaxed text-lg">
                {t("commitment")}
              </p>
            </div>

            {/* Company Information */}
            <div className="bg-primary-50 rounded-xl p-8 text-center">
              <h2 className="text-elegant text-2xl md:text-3xl font-semibold text-primary-800 mb-4">
                Ketingmar s.r.o.
              </h2>
              <p className="text-neutral-700 mb-6">
                Rodinná květinová dílnička s tradicí a důrazem na kvalitu
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`/${locale}/products`}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Prohlédnout naše věnce
                </a>
                <a
                  href={`/${locale}/contact`}
                  className="border-2 border-primary-600 text-primary-700 hover:bg-primary-50 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Kontaktovat nás
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
