import {
  StructuredData,
  generateOrganizationStructuredData,
  generateWebsiteStructuredData,
  generateLocalBusinessStructuredData,
  generateFAQStructuredData
} from "@/components/seo/StructuredData";
import { generateHomepageMetadata } from "@/components/seo/PageMetadata";
import { RefactoredPageLayout } from "@/components/layout/RefactoredPageLayout";

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

  // Company logo configuration for RefactoredPageLayout
  const companyLogo = {
    src: "/logo.svg",
    alt: locale === 'cs'
      ? 'Logo společnosti specializující se na pohřební věnce a květinové aranžmá'
      : 'Company logo specializing in funeral wreaths and floral arrangements',
    width: 300,
    height: 200
  };

  return (
    <>
      {/* SEO and Structured Data - maintained from original implementation */}
      <StructuredData data={organizationStructuredData} />
      <StructuredData data={websiteStructuredData} />
      <StructuredData data={localBusinessStructuredData} />
      <StructuredData data={faqStructuredData} />

      {/* New RefactoredPageLayout with integrated hero and product sections */}
      <RefactoredPageLayout
        locale={locale}
        companyLogo={companyLogo}
      />
    </>
  );
}
