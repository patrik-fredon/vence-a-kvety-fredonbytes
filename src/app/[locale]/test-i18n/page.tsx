import { getTranslations } from "next-intl/server";
import { CurrencyExample } from "@/components/examples/CurrencyExample";

interface TestI18nProps {
  params: Promise<{ locale: string }>;
}

export default async function TestI18n({ params }: TestI18nProps) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Internationalization Test Page</h1>

      <div className="space-y-8">
        {/* Basic translations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Basic Translations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">Navigation</h3>
              <ul className="space-y-1 text-sm">
                <li>Home: {t("navigation.home")}</li>
                <li>Products: {t("navigation.products")}</li>
                <li>About: {t("navigation.about")}</li>
                <li>Contact: {t("navigation.contact")}</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">Common</h3>
              <ul className="space-y-1 text-sm">
                <li>Loading: {t("common.loading")}</li>
                <li>Error: {t("common.error")}</li>
                <li>Success: {t("common.success")}</li>
                <li>Save: {t("common.save")}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Home page translations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Home Page Content</h2>
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-medium mb-2">{t("home.title")}</h3>
            <p className="text-sm text-gray-600 mb-2">{t("home.subtitle")}</p>
            <p className="text-sm text-gray-600">{t("home.description")}</p>
          </div>
        </section>

        {/* Currency formatting */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Currency Formatting</h2>
          <CurrencyExample />
        </section>

        {/* Locale info */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Locale Information</h2>
          <div className="p-4 bg-gray-50 rounded">
            <p>
              <strong>Current Locale:</strong> {locale}
            </p>
            <p>
              <strong>Date Format:</strong>{" "}
              {new Date().toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US")}
            </p>
            <p>
              <strong>Number Format:</strong>{" "}
              {(12345.67).toLocaleString(locale === "cs" ? "cs-CZ" : "en-US")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
