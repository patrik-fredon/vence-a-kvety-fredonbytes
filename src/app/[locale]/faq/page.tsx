import { getTranslations } from "next-intl/server";
import { FAQAccordion } from "@/components/faq";
import { generateFAQPageMetadata } from "@/components/seo/PageMetadata";
import {
  generateFAQStructuredData,
  generateOrganizationStructuredData,
  StructuredData,
} from "@/components/seo/StructuredData";

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
      answer: t("items.0.answer"),
    },
    {
      question: t("items.1.question"),
      answer: t("items.1.answer"),
    },
    {
      question: t("items.2.question"),
      answer: t("items.2.answer"),
    },
    {
      question: t("items.3.question"),
      answer: t("items.3.answer"),
      image: {
        src: "https://cdn.fredonbytes.com/wreath-size-comparsion.webp",
        alt:
          locale === "cs"
            ? "Porovnání velikostí věnců s lidskou postavou"
            : "Wreath size comparison with human figure",
        description:
          locale === "cs"
            ? "Ilustrace ukazuje poměr velikostí našich věnců (malý, střední, velký) ve srovnání s průměrnou lidskou postavou pro lepší představu o rozměrech."
            : "Illustration showing the size ratio of our wreaths (small, medium, large) compared to an average human figure for better understanding of dimensions.",
      },
    },
  ];

  // Generate structured data - fix: remove the second parameter (locale)
  const faqStructuredData = generateFAQStructuredData(faqItems);
  const organizationStructuredData = generateOrganizationStructuredData(locale);

  return (
    <>
      <StructuredData data={faqStructuredData} />
      <StructuredData data={organizationStructuredData} />

      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-elegant text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-teal-800 text-center mb-3 md:mb-4 px-4">
            {t("title")}
          </h1>

          <p className="text-base sm:text-lg text-teal-900 text-center mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto px-4">
            Odpovědi na nejčastější otázky o našich pohřebních věncích a službách.
          </p>

          <FAQAccordion items={faqItems} />
        </div>
      </div>
    </>
  );
}
