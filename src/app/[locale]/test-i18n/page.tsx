import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { generateLocalizedMetadata } from "@/lib/i18n/metadata";
import { type Locale } from "@/i18n/config";

interface TestI18nPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: TestI18nPageProps) {
  const { locale } = await params;
  return generateLocalizedMetadata({
    locale: locale as Locale,
    title: "i18n Test Page",
    description: "Test page for internationalization functionality",
  });
}

export default async function TestI18nPage({ params }: TestI18nPageProps) {
  const { locale } = await params;
  const t = useTranslations();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          {locale === "cs" ? "Test internacionalizace" : "Internationalization Test"}
        </h1>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {t("common.selectLanguage")}
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Select Variant:</h3>
              <LanguageToggle currentLocale={locale} />
            </div>

            <div>
              <h3 className="font-medium mb-2">Button Variant:</h3>
              <LanguageToggle currentLocale={locale} variant="buttons" />
            </div>

            <div>
              <h3 className="font-medium mb-2">Button Variant (No Labels):</h3>
              <LanguageToggle
                currentLocale={locale}
                variant="buttons"
                showLabels={false}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {t("navigation.home")} - Translation Test
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Navigation:</h3>
              <ul className="space-y-1 text-sm">
                <li>• {t("navigation.home")}</li>
                <li>• {t("navigation.products")}</li>
                <li>• {t("navigation.about")}</li>
                <li>• {t("navigation.contact")}</li>
                <li>• {t("navigation.cart")}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Common:</h3>
              <ul className="space-y-1 text-sm">
                <li>• {t("common.loading")}</li>
                <li>• {t("common.error")}</li>
                <li>• {t("common.success")}</li>
                <li>• {t("common.save")}</li>
                <li>• {t("common.cancel")}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Product Translations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Product Actions:</h3>
              <ul className="space-y-1 text-sm">
                <li>• {t("product.addToCart")}</li>
                <li>• {t("product.customize")}</li>
                <li>• {t("product.price")}</li>
                <li>• {t("product.availability")}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Cart:</h3>
              <ul className="space-y-1 text-sm">
                <li>• {t("cart.title")}</li>
                <li>• {t("cart.empty")}</li>
                <li>• {t("cart.checkout")}</li>
                <li>• {t("cart.total")}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">
            Current Locale Information
          </h2>

          <div className="space-y-2 text-sm">
            <p><strong>Current Locale:</strong> {locale}</p>
            <p><strong>Language Name:</strong> {locale === "cs" ? "Čeština" : "English"}</p>
            <p><strong>Currency:</strong> CZK</p>
            <p><strong>Date Format:</strong> {new Date().toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US")}</p>
            <p><strong>Number Format:</strong> {(1234.56).toLocaleString(locale === "cs" ? "cs-CZ" : "en-US")}</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-600">
            {locale === "cs"
              ? "Tato stránka testuje funkčnost přepínání jazyků a překladů."
              : "This page tests language switching and translation functionality."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
