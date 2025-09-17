import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { MainLayout } from "@/components/layout/MainLayout";
import { MonitoringProvider } from "@/components/monitoring/MonitoringProvider";
import { type Locale, locales } from "@/i18n/config";
import { AccessibilityProvider } from "@/lib/accessibility/context";
import { CartProvider } from "@/lib/cart/context";
import { generateLocalizedMetadata } from "@/lib/i18n/metadata";
import { createClient } from "@/lib/supabase/server";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleLayoutProps) {
  const { locale } = await params;
  return generateLocalizedMetadata({ locale: locale as Locale });
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  // Get user for monitoring context
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <NextIntlClientProvider messages={messages}>
      <MonitoringProvider userId={user?.id}>
        <AccessibilityProvider>
          <AuthProvider>
            <CartProvider>
              <MainLayout locale={locale}>{children}</MainLayout>
            </CartProvider>
          </AuthProvider>
        </AccessibilityProvider>
      </MonitoringProvider>
    </NextIntlClientProvider>
  );
}
