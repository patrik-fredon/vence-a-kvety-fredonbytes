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
        src: "/wreath-size-comparison.svg",
        alt: locale === "cs" ? "Porovnání velikostí věnců s lidskou postavou" : "Wreath size comparison with human figure",
        description: locale === "cs"
          ? "Ilustrace ukazuje poměr velikostí našich věnců (malý, střední, velký) ve srovnání s průměrnou lidskou postavou pro lepší představu o rozměrech."
          : "Illustration showing the size ratio of our wreaths (small, medium, large) compared to an average human figure for better understanding of dimensions."
      }
    },
  ];

  // Generate structured data
  const faqStructuredData = generateFAQStructuredData(faqItems);
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
