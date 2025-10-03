import { getTranslations } from "next-intl/server";
import { generateAboutPageMetadata } from "@/components/seo/PageMetadata";
import {
  generateLocalBusinessStructuredData,
  generateOrganizationStructuredData,
  StructuredData,
} from "@/components/seo/StructuredData";
import { AboutCard } from "@/components/ui/Card";

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
  const tAbout = await getTranslations({ locale, namespace: "about" });

  // Generate structured data
  const organizationStructuredData = generateOrganizationStructuredData(locale);
  const localBusinessStructuredData = generateLocalBusinessStructuredData(locale);

  return (
    <>
      <StructuredData data={organizationStructuredData} />
      <StructuredData data={localBusinessStructuredData} />

      <div className="py-16">
        <div className="container mx-auto px-4">
          {/* Hero Text */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="bg-funeral-teal rounded-lg p-8 mb-8">
              <h1 className="text-4xl md:text-5xl font-light mb-8 text-amber-100 leading-tight text-balance">
                {tAbout('title')}
              </h1>
              <p className="text-lg text-amber-200 leading-relaxed mb-8">
                {tAbout('mission')}
              </p>
            </div>
          </div>

          {/* Main Image */}
          <div className="mb-16">
            <div className="aspect-[16/9] bg-funeral-gold rounded-lg overflow-hidden">
              <img
                src="https://cdn.fredonbytes.com/lily-arrangement-with-greenery-studio.webp"
                alt={tAbout('companyDescription')}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Story Content */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="prose prose-lg prose-stone mx-auto">
              <p className="text-teal-800 leading-relaxed mb-6">
                {tAbout('story')}
              </p>

              <p className="text-teal-800 leading-relaxed mb-6">
                {tAbout('values')}
              </p>

              <p className="text-teal-800 leading-relaxed">
                {tAbout('commitment')}
              </p>
            </div>
          </div>

          {/* Brand Logo */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-funeral-gold rounded-full mb-4">
              <div className="text-2xl font-light text-teal-900">BL</div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            <AboutCard className="overflow-hidden border-0">
              <div className="aspect-square bg-funeral-gold relative">
                <img
                  src="https://cdn.fredonbytes.com/dewy-white-lilies-floral-design.webp"
                  alt={tAbout('companyDescription')}
                  className="w-full h-full object-cover"
                />

              </div>
            </AboutCard>

            <AboutCard className="overflow-hidden border-0">
              <div className="aspect-square bg-teal-900 flex items-center justify-center text-teal-900 p-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 border-2 border-amber-400 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-funeral-gold rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">{tAbout('valuesTitle')}</h3>
                  <p className="text-sm text-teal-900">
                    {tAbout('companyDescription')}
                  </p>
                </div>
              </div>
            </AboutCard>

            <AboutCard className="overflow-hidden border-0">
              <div className="aspect-square bg-funeral-gold relative">
                <img
                  src="https://cdn.fredonbytes.com/handmade-lily-wreath-with-twine-rustic.webp"
                  alt={tAbout('companyDescription')}
                  className="w-full h-full object-cover"
                />
              </div>
            </AboutCard>

            <AboutCard className="overflow-hidden border-0">
              <div className="aspect-square bg-teal-900 flex items-center justify-center text-teal-900 p-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 border-2 border-amber-400 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-funeral-gold rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">{tAbout('storyTitle')}</h3>
                  <p className="text-sm text-teal-900">
                    {tAbout('companyDescription')}
                  </p>
                </div>
              </div>
            </AboutCard>

            <AboutCard className="overflow-hidden border-0">
              <div className="aspect-square bg-funeral-gold relative">
                <img
                  src="https://cdn.fredonbytes.com/lily-funeral-wreath-making-process.webp"
                  alt={tAbout('companyDescription')}
                  className="w-full h-full object-cover"
                />

              </div>
            </AboutCard>

            <AboutCard className="overflow-hidden border-0">
              <div className="aspect-square bg-teal-900 flex items-center justify-center text-teal-900 p-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 border-2 border-amber-400 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-funeral-gold rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">{tAbout('commitmentTitle')}</h3>
                  <p className="text-sm text-teal-900">
                    {tAbout('companyDescription')}
                  </p>
                </div>
              </div>
            </AboutCard>
          </div>
        </div>
      </div>
    </>
  );

}
