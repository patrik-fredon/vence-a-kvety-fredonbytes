import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/components/auth";
import { CartProvider } from "@/lib/cart/context";
import { AccessibilityProvider } from "@/lib/accessibility/context";
import { MonitoringProvider } from "@/components/monitoring/MonitoringProvider";
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
  const messages = await getMessages({ locale });

  // Get user for monitoring context
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <NextIntlClientProvider messages={messages}>
      <MonitoringProvider {...(user?.id && { userId: user.id })}>
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
