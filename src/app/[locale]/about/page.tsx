import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { generateAboutPageMetadata } from "@/components/seo/PageMetadata";
import {
  generateLocalBusinessStructuredData,
  generateOrganizationStructuredData,
  StructuredData,
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
  const tAbout = await getTranslations({ locale, namespace: "about" });

  // Generate structured data
  const organizationStructuredData = generateOrganizationStructuredData(locale);
  const localBusinessStructuredData = generateLocalBusinessStructuredData(locale);

  return (
    <>
      <StructuredData data={organizationStructuredData} />
      <StructuredData data={localBusinessStructuredData} />

      <div className="py-8">

          {/* Hero Text */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className=" rounded-lg p-8 mb-8">
              <h1 className="text-4xl md:text-5xl font-light mb-8 text-teal-800 leading-tight text-balance">
                {tAbout("title")}
              </h1>
              <p className="text-lg text-teal-800 leading-relaxed mb-8">{tAbout("mission")}</p>
            </div>
          </div>
          <div className="container mx-auto px-4">
          {/* Main Image - Reduced height */}
          <div className="mb-16">
            <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 bg-funeral-gold rounded-lg  shadow-xl overflow-hidden">
              <Image
                src="https://cdn.fredonbytes.com/lily-arrangement-with-greenery-studio.webp"
                alt={tAbout("companyDescription")}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                priority
              />
            </div>
          </div>

          {/* Logo Section - Integrated into design */}
          <div className="flex items-center justify-center mb-16">
            <Image
              src="/logo.svg"
              alt="Vence a kvety logo"
              width={256}
              height={100}
              className="w-48 h-auto sm:w-56 md:w-64 lg:w-72"
              priority
            />
          </div>

          {/* Story Content */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="prose prose-lg prose-stone mx-auto">
              <p className="text-teal-800 leading-relaxed mb-6">{tAbout("story")}</p>

              <p className="text-teal-800 leading-relaxed mb-6">{tAbout("values")}</p>

              <p className="text-teal-800 leading-relaxed">{tAbout("commitment")}</p>
            </div>
          </div>

          {/* Image Grid with Gold-Outlined Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="overflow-hidden rounded-lg">
              <div className="aspect-square bg-funeral-gold relative">
                <Image
                  src="https://cdn.fredonbytes.com/dewy-white-lilies-floral-design.webp"
                  alt={tAbout("companyDescription")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>

            <div className="border-2 border-amber-300 bg-teal-800 backdrop-blur-lg rounded-lg overflow-hidden hover:border-amber-200 transition-colors duration-300">
              <div className="aspect-square flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4   flex items-center justify-center">
                    <Image
                      src="/logo.svg"
                      alt="Vence a kvety logo"
                      width={256}
                      height={100}
                      className="w-48 h-auto sm:w-56 md:w-64 lg:w-72"
                      priority
                    />
                  </div>
                  <h2 className="text-lg font-medium mb-2 text-amber-300">
                    {tAbout("valuesTitle")}
                  </h2>
                  <p className="text-sm text-amber-200">{tAbout("valuesDescription")}</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg">
              <div className="aspect-square bg-funeral-gold relative">
                <Image
                  src="https://cdn.fredonbytes.com/handmade-lily-wreath-with-twine-rustic.webp"
                  alt={tAbout("companyDescription")}
                  fill
                  className="object-cover "
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>

            <div className="border-2 border-amber-300 bg-teal-800 shadow-2xl backdrop-blur-lg rounded-lg overflow-hidden hover:border-amber-200 transition-colors duration-300">
              <div className="aspect-square flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4  flex items-center justify-center">
                    <Image
                      src="/logo.svg"
                      alt="Vence a kvety logo"
                      width={256}
                      height={100}
                      className="w-48 h-auto sm:w-56 md:w-64 lg:w-72"
                      priority
                    />
                  </div>
                  <h2 className="text-lg font-medium mb-2 text-amber-200">
                    {tAbout("storyTitle")}
                  </h2>
                  <p className="text-sm text-amber-100">{tAbout("storyDescription")}</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg">
              <div className="aspect-square bg-funeral-teal relative">
                <Image
                  src="https://cdn.fredonbytes.com/lily-funeral-wreath-making-process.webp"
                  alt={tAbout("companyDescription")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>

            <div className="border-2 border-amber-300 bg-teal-800 backdrop-blur-lg rounded-lg shadow-2xl overflow-hidden hover:border-amber-200 transition-colors duration-300">
              <div className="aspect-square flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4  flex items-center justify-center">
                    <Image
                      src="/logo.svg"
                      alt="Vence a kvety logo"
                      width={256}
                      height={100}
                      className="w-48 h-auto sm:w-56 md:w-64 lg:w-72"
                      priority
                    />
                  </div>
                  <h2 className="text-lg font-medium mb-2  text-amber-200">
                    {tAbout("commitmentTitle")}
                  </h2>
                  <p className="text-sm text-amber-100">{tAbout("commitmentDescription")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
