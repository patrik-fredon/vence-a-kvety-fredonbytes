import { AccessibilityToolbar } from "@/components/accessibility/AccessibilityToolbar";
import { SkipLinks } from "@/components/accessibility/SkipLinks";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  locale: string;
}

export function MainLayout({ children, locale }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip links for keyboard navigation */}
      <SkipLinks locale={locale} />

      {/* Accessibility toolbar */}
      <AccessibilityToolbar locale={locale} />

      <Header locale={locale} />

      <main
        id="main-content"
        className="flex-1"
        tabIndex={-1}
        role="main"
        aria-label="Hlavní obsah"
      >
        {children}
      </main>

      <Footer locale={locale} />
    </div>
  );
}
