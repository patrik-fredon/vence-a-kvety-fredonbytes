/**
 * Payment error page
 */

import {
  ArrowPathIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  ShoppingCartIcon,
} from "@/lib/icons";
import type { Metadata } from "next";
import React from "react";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string; error?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Chyba platby",
    description: "Došlo k chybě při zpracování platby. Zkuste to znovu nebo nás kontaktujte.",
  };
}

export default async function CheckoutErrorPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { orderId, error } = await searchParams;

  const commonErrors: Record<string, { title: string; description: string; solution: string }> = {
    card_declined: {
      title: "Karta byla zamítnuta",
      description: "Vaše banka nebo poskytovatel karty zamítl platbu.",
      solution: "Zkuste jinou kartu nebo kontaktujte svou banku.",
    },
    insufficient_funds: {
      title: "Nedostatek prostředků",
      description: "Na kartě není dostatek prostředků pro dokončení platby.",
      solution: "Zkuste jinou kartu nebo dobijte účet.",
    },
    expired_card: {
      title: "Karta vypršela",
      description: "Platnost vaší karty již vypršela.",
      solution: "Použijte kartu s platnou dobou platnosti.",
    },
    incorrect_cvc: {
      title: "Nesprávný CVC kód",
      description: "Zadaný bezpečnostní kód karty není správný.",
      solution: "Zkontrolujte CVC kód na zadní straně karty.",
    },
    processing_error: {
      title: "Chyba zpracování",
      description: "Došlo k technické chybě při zpracování platby.",
      solution: "Zkuste to znovu za několik minut.",
    },
    network_error: {
      title: "Chyba připojení",
      description: "Problém s internetovým připojením během platby.",
      solution: "Zkontrolujte připojení a zkuste to znovu.",
    },
  };

  const errorInfo =
    error && commonErrors[error]
      ? commonErrors[error]
      : {
        title: "Neočekávaná chyba",
        description: "Došlo k neočekávané chybě při zpracování platby.",
        solution: "Zkuste to znovu nebo nás kontaktujte pro pomoc.",
      };

  return (
    <div className="min-h-screen bg-teal-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />
          </div>

          <h1 className="text-elegant text-3xl font-bold text-teal-800 mb-4">
            Chyba při platbě
          </h1>

          <p className="text-lg text-teal-600 mb-2">
            Bohužel se nepodařilo zpracovat vaši platbu.
          </p>

          {orderId && <p className="text-sm text-teal-500">Objednávka #{orderId}</p>}
        </div>

        {/* Error Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-teal-200 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <h2 className="text-lg font-semibold text-red-800 flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {errorInfo.title}
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <p className="text-teal-700">{errorInfo.description}</p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Doporučené řešení</h3>
                <p className="text-blue-700 text-sm">{errorInfo.solution}</p>
              </div>

              {error && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <p className="text-xs text-teal-600">
                    <span className="font-medium">Kód chyby:</span> {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Troubleshooting Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-teal-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-teal-800 mb-4">Kroky k vyřešení problému</h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-teal-800">Zkontrolujte údaje karty</p>
                <p className="text-sm text-teal-600">
                  Ověřte číslo karty, datum vypršení platnosti a CVC kód.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-teal-800">Zkuste jiný způsob platby</p>
                <p className="text-sm text-teal-600">
                  Použijte jinou kartu nebo zvolte GoPay pro více možností platby.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-teal-800">Kontaktujte banku</p>
                <p className="text-sm text-teal-600">
                  Pokud problém přetrvává, kontaktujte svou banku nebo poskytovatele karty.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                4
              </div>
              <div>
                <p className="font-medium text-teal-800">Kontaktujte nás</p>
                <p className="text-sm text-teal-600">
                  Náš tým zákaznické podpory vám rád pomůže vyřešit problém.
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
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Zkusit znovu
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

        {/* Emergency Contact */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-orange-800 mb-4">
            Potřebujete okamžitou pomoc?
          </h3>

          <p className="text-orange-700 text-sm mb-4">
            Pokud je vaše objednávka urgentní nebo potřebujete pomoc s dokončením platby,
            kontaktujte nás přímo:
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="tel:+420123456789"
              className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <PhoneIcon className="w-4 h-4 mr-2" />
              Zavolat: +420 123 456 789
            </a>

            <a
              href="mailto:info@pohrebni-vence.cz?subject=Chyba%20platby%20-%20objednávka%20%23${orderId || 'neznámá'}"
              className="flex items-center justify-center px-4 py-2 bg-white border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              Napsat email
            </a>
          </div>
        </div>

        {/* Additional Information */}
        <div className="text-center text-sm text-teal-500">
          <p className="mb-2">
            Všechny platby jsou zpracovávány bezpečně prostřednictvím certifikovaných poskytovatelů.
          </p>
          <p>Vaše platební údaje nejsou ukládány na našich serverech.</p>
        </div>
      </div>
    </div>
  );
}
