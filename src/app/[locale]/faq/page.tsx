import { getTranslations } from "next-intl/server";
import { generateFAQPageMetadata } from "@/components/seo/PageMetadata";
import {
  StructuredData,
  generateFAQStructuredData,
  generateOrganizationStructuredData
} from "@/components/seo/StructuredData";
import { FAQAccordion } from "@/components/faq";

interface FAQPageProps {
  params: Promise<{ locale: string }>;
}

// Generate metadata for FAQ page
export async function generateMetadata({ params }: FAQPageProps) {
  const { locale } = await params;
  return generateFAQPageMetadata(locale);
}

export default async function FAQPage({ params }: FAQPageProps) {
  const { locale } = await params;
  const t = await getTranslations("faq");

  // Get FAQ items from translations
  const faqItems = [
    {
      question: t("items.0.question"),
      answer: t("items.0.answer")
    },
    {
      question: t("items.1.question"),
      answer: t("items.1.answer")
    },
    {
      question: t("items.2.question"),
      answer: t("items.2.answer")
    }
  ];

  // Generate structured data
  const faqStructuredData = generateFAQStructuredData(faqItems, locale);
  const organizationStructuredData = generateOrganizationStructuredData(locale);

  return (
    <>
      <StructuredData data={faqStructuredData} />
      <StructuredData data={organizationStructuredData} />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-elegant text-4xl md:text-5xl font-semibold text-primary-800 text-center mb-4">
            {t("title")}
          </h1>

          <p className="text-lg text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
            Odpovědi na nejčastější otázky o našich pohřebních věncích a službách.
          </p>

          <FAQAccordion items={faqItems} />
        </div>
      </div>
    </>
  );
}
