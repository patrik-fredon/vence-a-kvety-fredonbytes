/**
 * Payment success page
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { CheckCircleIcon, EnvelopeIcon, PhoneIcon } from "@/lib/icons";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });

  return {
    title: t("orderConfirmation"),
    description: "Vaše objednávka byla úspěšně dokončena.",
  };
}

export default async function CheckoutSuccessPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { orderId } = await searchParams;
  const t = await getTranslations({ locale, namespace: "checkout" });

  if (!orderId) {
    notFound();
  }

  // For now, we'll show a simple success message
  // In a real implementation, you would fetch order details from the database
  // const supabase = createServerClient();
  // const { data: order, error } = await supabase
  //   .from('orders')
  //   .select('*')
  //   .eq('id', orderId)
  //   .single();

  return (
    <div className="min-h-screen bg-teal-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-elegant text-3xl font-bold text-primary-800 mb-4">
            {t("orderConfirmation")}
          </h1>

          <p className="text-lg text-teal-600 mb-2">
            Děkujeme za vaši objednávku. Platba byla úspěšně zpracována.
          </p>

          <p className="text-sm text-teal-500">Objednávka #{orderId}</p>
        </div>

        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-sm border border-teal-200 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-green-50 border-b border-green-200">
            <h2 className="text-lg font-semibold text-green-800">Platba byla úspěšně zpracována</h2>
          </div>

          <div className="p-6">
            <p className="text-teal-700 mb-4">
              Vaše objednávka pohřebních věnců byla úspěšně vytvořena a platba byla zpracována. Na
              váš email jsme odeslali potvrzení s detaily objednávky.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Číslo objednávky: {orderId}</h3>
              <p className="text-blue-700 text-sm">
                Toto číslo si prosím uložte pro případné dotazy ohledně vaší objednávky.
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Co bude následovat?</h3>
          <div className="space-y-3 text-sm text-blue-700">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <p>
                <strong>Potvrzení objednávky:</strong> Na váš email jsme odeslali potvrzení s
                detaily objednávky.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <p>
                <strong>Příprava věnce:</strong> Naši floristé začnou připravovat váš věnec podle
                vašich požadavků.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <p>
                <strong>Doručení:</strong> Věnec bude doručen na uvedenou adresu v požadovaném
                termínu.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href={`/${locale}/profile`}>
            <Button variant="outline" className="flex items-center justify-center">
              Zobrazit objednávky
            </Button>
          </a>

          <a href={`/${locale}/products`}>
            <Button className="flex items-center justify-center">Pokračovat v nákupu</Button>
          </a>
        </div>

        {/* Contact Information */}
        <div className="text-center mt-12 pt-8 border-t border-teal-200">
          <p className="text-sm text-teal-600 mb-2">Máte otázky k vaší objednávce?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a
              href="mailto:info@pohrebni-vence.cz"
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <EnvelopeIcon className="w-4 h-4 mr-1" />
              info@pohrebni-vence.cz
            </a>
            <a
              href="tel:+420123456789"
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <PhoneIcon className="w-4 h-4 mr-1" />
              +420 123 456 789
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
