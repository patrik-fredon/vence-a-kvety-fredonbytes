import { useTranslations } from "next-intl";
import { AccessibilityToolbar } from "@/components/accessibility/AccessibilityToolbar";
import { SkipLinks } from "@/components/accessibility/SkipLinks";
import type { Locale } from "@/i18n/config";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  locale: string;
}

export function MainLayout({ children, locale }: MainLayoutProps) {
  const t = useTranslations("accessibility");

  return (
    <div className="min-h-screen flex flex-col">
      <SkipLinks />
      <AccessibilityToolbar />

      <Header locale={locale as Locale} />

      <main id="main-content" className="flex-1" tabIndex={-1} aria-label={t("mainContent")}>
        {children}
      </main>

      <Footer locale={locale} />
    </div>
  );
}
