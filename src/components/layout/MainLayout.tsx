import { Header } from "./Header";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  locale: string;
}

export function MainLayout({ children, locale }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
