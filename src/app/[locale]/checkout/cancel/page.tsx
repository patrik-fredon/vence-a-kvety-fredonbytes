/**
 * Payment cancellation page
 */

import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Platba zrušena",
    description: "Platba byla zrušena. Můžete se vrátit a zkusit to znovu.",
  };
}

export default async function CheckoutCancelPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { orderId } = await searchParams;

  return (
    <div className="min-h-screen bg-teal-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cancel Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
            <XCircleIcon className="w-12 h-12 text-orange-600" />
          </div>

          <h1 className="text-elegant text-3xl font-bold text-teal-800 mb-4">
            Platba byla zrušena
          </h1>

          <p className="text-lg text-teal-600 mb-2">
            Vaše platba nebyla dokončena. Objednávka zůstává aktivní.
          </p>

          {orderId && <p className="text-sm text-teal-500">Objednávka #{orderId}</p>}
        </div>

        {/* Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-teal-200 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
            <h2 className="text-lg font-semibold text-orange-800 flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              Co se stalo?
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-4 text-sm text-teal-700">
              <p>Platba byla přerušena nebo zrušena. Možné důvody:</p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Klikli jste na tlačítko "Zpět" nebo "Zrušit" v platební bráně</li>
                <li>Vypršel časový limit pro dokončení platby</li>
                <li>Došlo k technické chybě během zpracování</li>
                <li>Platba byla zamítnuta bankou nebo poskytovatelem karty</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h3 className="font-medium text-blue-800 mb-2">Vaše objednávka je stále aktivní</h3>
                <p className="text-blue-700 text-sm">
                  Můžete se vrátit k dokončení platby nebo zvolit jiný způsob platby. Objednávka
                  bude automaticky zrušena po 24 hodinách, pokud nebude zaplacena.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-teal-800 mb-4">Co můžete udělat?</h3>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-teal-800">Zkuste platbu znovu</p>
                <p className="text-sm text-teal-600">
                  Vraťte se k objednávce a zkuste dokončit platbu znovu se stejným nebo jiným
                  způsobem platby.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-teal-800">Kontaktujte nás</p>
                <p className="text-sm text-teal-600">
                  Pokud problém přetrvává, kontaktujte naši zákaznickou podporu pro pomoc.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-teal-800">Upravte objednávku</p>
                <p className="text-sm text-teal-600">
                  Můžete se vrátit do košíku a upravit objednávku před dokončením platby.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          {orderId ? (
            <a href={`/${locale}/checkout?orderId=${orderId}`}>
              <Button className="flex items-center justify-center">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Vrátit se k platbě
              </Button>
            </a>
          ) : (
            <a href={`/${locale}/cart`}>
              <Button className="flex items-center justify-center">
                <ShoppingCartIcon className="w-4 h-4 mr-2" />
                Zobrazit košík
              </Button>
            </a>
          )}

          <a href={`/${locale}/products`}>
            <Button variant="outline" className="flex items-center justify-center">
              Pokračovat v nákupu
            </Button>
          </a>
        </div>

        {/* Contact Information */}
        <div className="text-center pt-8 border-t border-teal-200">
          <p className="text-sm text-teal-600 mb-4">Potřebujete pomoc s dokončením objednávky?</p>

          <div className="bg-white rounded-lg border border-teal-200 p-4 inline-block">
            <h4 className="font-medium text-teal-800 mb-2">Kontaktujte zákaznickou podporu</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center space-x-4">
                <a
                  href="mailto:info@pohrebni-vence.cz"
                  className="text-primary-600 hover:text-primary-700 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-label="Email icon"
                  >
                    <title>Email</title>
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  info@pohrebni-vence.cz
                </a>
                <a
                  href="tel:+420123456789"
                  className="text-primary-600 hover:text-primary-700 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-label="Phone icon"
                  >
                    <title>Phone</title>
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  +420 123 456 789
                </a>
              </div>
              <p className="text-teal-500">Pondělí - Pátek: 8:00 - 18:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
