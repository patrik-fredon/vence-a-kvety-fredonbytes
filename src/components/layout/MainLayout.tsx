import { useTranslations } from "next-intl";
import { AccessibilityToolbar } from "@/components/accessibility/AccessibilityToolbar";
import { SkipLinks } from "@/components/accessibility/SkipLinks";
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
      <SkipLinks locale={locale} />
      <AccessibilityToolbar locale={locale} />

      <Header locale={locale} />

      <main
        id="main-content"
        className="flex-1"
        tabIndex={-1}
        role="main"
        aria-label={t("mainContent")}
      >
        {children}
      </main>

      <Footer locale={locale} />
    </div>
  );
}
