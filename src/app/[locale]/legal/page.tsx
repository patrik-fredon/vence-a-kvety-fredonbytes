import { getTranslations } from "next-intl/server";
import { generateLegalMetadata } from "@/components/seo/PageMetadata";

interface LegalProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LegalProps) {
  const { locale } = await params;
  return generateLegalMetadata(locale);
}

export default async function LegalPage() {
  const t = await getTranslations("legal");
  //TODO add missing keys to messages next-intl
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 max-w-4xl">
      <h1 className="text-elegant text-2xl sm:text-3xl md:text-4xl font-semibold text-amber-100 mb-6 md:mb-8">
        {t("title")}
      </h1>

      <div className="prose prose-lg max-w-none">
        <section className="mb-12">
          <h2 className="text-elegant text-2xl font-semibold text-primary-800 mb-4">
            {t("terms.title")}
          </h2>
          <div className="space-y-4 text-teal-700">
            <p>{t("terms.content.intro")}</p>
            <p>{t("terms.content.services")}</p>
            <p>{t("terms.content.orders")}</p>
            <p>{t("terms.content.payment")}</p>
            <p>{t("terms.content.delivery")}</p>
            <p>{t("terms.content.returns")}</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-elegant text-2xl font-semibold text-primary-800 mb-4">
            {t("privacy.title")}
          </h2>
          <div className="space-y-4 text-teal-700">
            <p>{t("privacy.content.intro")}</p>
            <p>{t("privacy.content.collection")}</p>
            <p>{t("privacy.content.usage")}</p>
            <p>{t("privacy.content.sharing")}</p>
            <p>{t("privacy.content.security")}</p>
            <p>{t("privacy.content.rights")}</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-elegant text-2xl font-semibold text-primary-800 mb-4">
            {t("gdpr.title")}
          </h2>
          <div className="space-y-4 text-teal-700">
            <p>{t("gdpr.content.intro")}</p>
            <p>{t("gdpr.content.rights")}</p>
            <p>{t("gdpr.content.access")}</p>
            <p>{t("gdpr.content.deletion")}</p>
            <p>{t("gdpr.content.contact")}</p>
          </div>
        </section>

        <section>
          <h2 className="text-elegant text-2xl font-semibold text-primary-800 mb-4">
            {t("cookies.title")}
          </h2>
          <div className="space-y-4 text-teal-700">
            <p>{t("cookies.content.intro")}</p>
            <p>{t("cookies.content.types")}</p>
            <p>{t("cookies.content.management")}</p>
            <p>{t("cookies.content.thirdParty")}</p>
          </div>
        </section>
      </div>

      <div className="mt-12 p-6 bg-teal-50 rounded-lg">
        <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-3">
          {t("contact.title")}
        </h3>
        <p className="text-teal-700 mb-4">{t("contact.description")}</p>
        <div className="space-y-2 text-teal-700">
          <p>
            <strong>{t("contact.email")}:</strong> info@pohrebni-vence.cz
          </p>
          <p>
            <strong>{t("contact.phone")}:</strong> +420 123 456 789
          </p>
          <p>
            <strong>{t("contact.address")}:</strong> {t("contact.addressValue")}
          </p>
        </div>
      </div>
    </div>
  );
}
