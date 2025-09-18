import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  StructuredData,
  generateOrganizationStructuredData,
  generateWebsiteStructuredData,
  generateLocalBusinessStructuredData,
  generateFAQStructuredData
} from "@/components/seo/StructuredData";
import { generateHomepageMetadata } from "@/components/seo/PageMetadata";

interface HomeProps {
  params: Promise<{ locale: string }>;
}

// Generate metadata for homepage
export async function generateMetadata({ params }: HomeProps) {
  const { locale } = await params;
  return generateHomepageMetadata(locale);
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  const t = await getTranslations("home");

  // Generate structured data for home page
  const organizationStructuredData = generateOrganizationStructuredData(locale);
  const websiteStructuredData = generateWebsiteStructuredData(locale);
  const localBusinessStructuredData = generateLocalBusinessStructuredData(locale);

  // Generate FAQ structured data for common questions
  const faqs = [
    {
      question: locale === 'cs' ? 'Jak rychle dokážete dodat pohřební věnec?' : 'How quickly can you deliver a funeral wreath?',
      answer: locale === 'cs'
        ? 'Standardně dodáváme následující pracovní den. V naléhavých případech nabízíme expresní dodání do 12 hodin nebo dodání tentýž den do 4 hodin.'
        : 'We typically deliver the next business day. For urgent cases, we offer express delivery within 12 hours or same-day delivery within 4 hours.'
    },
    {
      question: locale === 'cs' ? 'Můžu si přizpůsobit věnec podle svých představ?' : 'Can I customize the wreath according to my preferences?',
      answer: locale === 'cs'
        ? 'Ano, nabízíme široké možnosti přizpůsobení včetně velikosti, druhů květin, barev stuh a osobního vzkazu. Naši floristé vám pomohou vytvořit jedinečný věnec.'
        : 'Yes, we offer extensive customization options including size, flower types, ribbon colors, and personal messages. Our florists will help you create a unique wreath.'
    },
    {
      question: locale === 'cs' ? 'Jaké způsoby platby přijímáte?' : 'What payment methods do you accept?',
      answer: locale === 'cs'
        ? 'Přijímáme platby kartou přes Stripe, bankovní převody a české platební metody přes GoPay včetně platby kartou, bankovním převodem nebo mobilními peněženkami.'
        : 'We accept card payments via Stripe, bank transfers, and Czech payment methods via GoPay including card payments, bank transfers, or mobile wallets.'
    }
  ];

  const faqStructuredData = generateFAQStructuredData(faqs, locale);

  return (
    <>
      <StructuredData data={organizationStructuredData} />
      <StructuredData data={websiteStructuredData} />
      <StructuredData data={localBusinessStructuredData} />
      <StructuredData data={faqStructuredData} />
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-elegant text-5xl md:text-6xl font-semibold text-primary-800 mb-6">
            {t("hero.title")}
          </h1>
          <p className="text-xl md:text-2xl text-neutral-700 mb-8 leading-relaxed">{t("hero.subtitle")}</p>
          <p className="text-lg text-neutral-600 mb-12 max-w-2xl mx-auto">{t("hero.description")}</p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href={`/${locale}/products`}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors shadow-elegant"
            >
              {t("hero.cta")}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="border-2 border-primary-600 text-primary-700 hover:bg-primary-50 px-8 py-4 rounded-lg font-medium text-lg transition-colors"
            >
              {t("contactUs")}
            </Link>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="mt-20 max-w-4xl mx-auto text-center">
          <blockquote className="text-2xl md:text-3xl text-primary-700 font-elegant italic mb-6">
            "{t("philosophy.quote")}"
          </blockquote>
          <p className="text-lg text-neutral-600 leading-relaxed">
            {t("philosophy.text")}
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mt-20 max-w-6xl mx-auto">
          <h2 className="text-elegant text-3xl md:text-4xl font-semibold text-primary-800 text-center mb-12">
            {t("benefits.title")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="text-center p-6 bg-white/50 rounded-xl shadow-soft">
                <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-3">
                  {t(`benefits.items.${index}.title`)}
                </h3>
                <p className="text-neutral-600">
                  {t(`benefits.items.${index}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
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
