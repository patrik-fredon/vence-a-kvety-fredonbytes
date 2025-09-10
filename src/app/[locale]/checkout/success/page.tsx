/**
 * Payment success page
 */

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import {
  CheckCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });

  return {
    title: t('orderConfirmation'),
    description: 'Vaše objednávka byla úspěšně dokončena.',
  };
}

export default async function CheckoutSuccessPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { orderId } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'checkout' });

  if (!orderId) {
    notFound();
  }

  // Fetch order details
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    console.error('Error fetching order:', error);
    notFound();
  }

  const customerInfo = order.customer_info;
  const deliveryInfo = order.delivery_info;
  const paymentInfo = order.payment_info;

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-elegant text-3xl font-bold text-primary-800 mb-4">
            {t('orderConfirmation')}
          </h1>

          <p className="text-lg text-neutral-600 mb-2">
            Děkujeme za vaši objednávku. Platba byla úspěšně zpracována.
          </p>

          <p className="text-sm text-neutral-500">
            Objednávka #{order.order_number}
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-green-50 border-b border-green-200">
            <h2 className="text-lg font-semibold text-green-800">
              Detaily objednávky
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Items */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">
                Objednané položky
              </h3>
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">
                        {item.productName}
                      </p>
                      <p className="text-sm text-neutral-600">
                        Množství: {item.quantity}
                      </p>
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="text-xs text-neutral-500 mt-1">
                          {item.customizations.map((custom: any, idx: number) => (
                            <span key={idx} className="mr-2">
                              {custom.name}: {custom.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-neutral-900">
                        {new Intl.NumberFormat(locale === 'cs' ? 'cs-CZ' : 'en-US', {
                          style: 'currency',
                          currency: 'CZK',
                        }).format(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-neutral-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Mezisoučet:</span>
                  <span className="text-neutral-900">
                    {new Intl.NumberFormat(locale === 'cs' ? 'cs-CZ' : 'en-US', {
                      style: 'currency',
                      currency: 'CZK',
                    }).format(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Doprava:</span>
                  <span className="text-neutral-900">
                    {new Intl.NumberFormat(locale === 'cs' ? 'cs-CZ' : 'en-US', {
                      style: 'currency',
                      currency: 'CZK',
                    }).format(order.delivery_cost)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-neutral-200 pt-2">
                  <span className="text-neutral-900">Celkem:</span>
                  <span className="text-primary-600">
                    {new Intl.NumberFormat(locale === 'cs' ? 'cs-CZ' : 'en-US', {
                      style: 'currency',
                      currency: 'CZK',
                    }).format(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <EnvelopeIcon className="w-5 h-5 mr-2 text-primary-600" />
              Kontaktní údaje
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Jméno:</span> {customerInfo.firstName} {customerInfo.lastName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {customerInfo.email}
              </p>
              {customerInfo.phone && (
                <p>
                  <span className="font-medium">Telefon:</span> {customerInfo.phone}
                </p>
              )}
              {customerInfo.company && (
                <p>
                  <span className="font-medium">Společnost:</span> {customerInfo.company}
                </p>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2 text-primary-600" />
              Doručení
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Adresa:</span><br />
                {deliveryInfo.address.street}<br />
                {deliveryInfo.address.city}, {deliveryInfo.address.postalCode}
              </p>
              {deliveryInfo.preferredDate && (
                <p>
                  <span className="font-medium">Datum doručení:</span>{' '}
                  {new Date(deliveryInfo.preferredDate).toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-US')}
                </p>
              )}
              {deliveryInfo.recipientName && (
                <p>
                  <span className="font-medium">Příjemce:</span> {deliveryInfo.recipientName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            Co bude následovat?
          </h3>
          <div className="space-y-3 text-sm text-blue-700">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <p>
                <strong>Potvrzení objednávky:</strong> Na váš email jsme odeslali potvrzení s detaily objednávky.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <p>
                <strong>Příprava věnce:</strong> Naši floristé začnou připravovat váš věnec podle vašich požadavků.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <p>
                <strong>Doručení:</strong> Věnec bude doručen na uvedenou adresu v požadovaném termínu.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            href={`/${locale}/profile`}
            variant="outline"
            className="flex items-center justify-center"
          >
            Zobrazit objednávky
          </Button>

          <Button
            href={`/${locale}/products`}
            className="flex items-center justify-center"
          >
            Pokračovat v nákupu
          </Button>
        </div>

        {/* Contact Information */}
        <div className="text-center mt-12 pt-8 border-t border-neutral-200">
          <p className="text-sm text-neutral-600 mb-2">
            Máte otázky k vaší objednávce?
          </p>
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
