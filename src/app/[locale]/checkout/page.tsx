import React from "react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CheckoutPageClient } from "./CheckoutPageClient";

interface CheckoutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });

  return {
    title: t("title"),
    description: "Dokončete svou objednávku pohřebních věnců",
    robots: "noindex, nofollow", // Checkout pages should not be indexed
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params;

  // Validate locale
  if (!["cs", "en"].includes(locale)) {
    notFound();
  }

  return <CheckoutPageClient locale={locale} />;
}
