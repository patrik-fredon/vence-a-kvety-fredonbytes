"use client";

import { CheckCircleIcon, CreditCardIcon, MapPinIcon, UserIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

import type { CartItem } from "@/types/cart";
import type { CheckoutFormData } from "@/types/order";
import { OrderSummary } from "../OrderSummary";

interface ReviewStepProps {
  formData: CheckoutFormData;
  items: CartItem[];
  subtotal: number;
  deliveryCost: number;
  totalAmount: number;
  estimatedDeliveryDate?: Date;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
  onAgreeToTermsChange: (agree: boolean) => void;
  onSubscribeNewsletterChange: (subscribe: boolean) => void;
  locale: string;
}

export function ReviewStep({
  formData,
  items,
  subtotal,
  deliveryCost,
  totalAmount,
  estimatedDeliveryDate,
  agreeToTerms,
  subscribeNewsletter,
  onAgreeToTermsChange,
  onSubscribeNewsletterChange,
  locale,
}: ReviewStepProps) {
  const tDelivery = useTranslations("delivery");

  const { customerInfo, deliveryInfo, paymentMethod } = formData;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-elegant text-2xl font-bold text-amber-300 mb-2">
          Kontrola objednávky
        </h2>
        <p className="text-amber-300">Zkontrolujte všechny údaje před dokončením objednávky.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Order Details */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-funeral-gold border border-amber-100 rounded-lg p-6">
            <h3 className="text-xl font-bold text-teal-800 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Kontaktní údaje
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-teal-800">Jméno:</span>
                <span className="ml-2 text-teal-800">
                  {customerInfo.firstName} {customerInfo.lastName}
                </span>
              </div>

              <div>
                <span className="font-medium text-teal-800">E-mail:</span>
                <span className="ml-2 text-teal-800">{customerInfo.email}</span>
              </div>

              <div>
                <span className="font-medium text-teal-800">Telefon:</span>
                <span className="ml-2 text-teal-800">{customerInfo.phone}</span>
              </div>

              {customerInfo.company && (
                <div>
                  <span className="font-medium text-teal-800">Společnost:</span>
                  <span className="ml-2 text-teal-800">{customerInfo.company}</span>
                </div>
              )}

              {customerInfo.note && (
                <div>
                  <span className="font-medium text-teal-800">Poznámka:</span>
                  <span className="ml-2 text-teal-800">{customerInfo.note}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-funeral-gold border border-amber-100 rounded-lg p-6">
            <h3 className="text-xl font-bold text-teal-800 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2" />
              Doručení
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-teal-800">Adresa:</span>
                <div className="ml-2 text-teal-800">
                  {deliveryInfo.address?.street}
                  <br />
                  {deliveryInfo.address?.postalCode} {deliveryInfo.address?.city}
                  <br />
                  {deliveryInfo.address?.country}
                </div>
              </div>

              <div>
                <span className="font-medium text-teal-800">Způsob doručení:</span>
                <span className="ml-2 text-teal-800">
                  {deliveryInfo.urgency === "standard" && "Standardní doručení"}
                  {deliveryInfo.urgency === "express" && "Expresní doručení"}
                  {deliveryInfo.urgency === "same-day" && "Doručení tentýž den"}
                </span>
              </div>

              {deliveryInfo.preferredDate && (
                <div>
                  <span className="font-medium text-teal-800">Datum doručení:</span>
                  <span className="ml-2 text-teal-800">
                    {deliveryInfo.preferredDate.toLocaleDateString(
                      locale === "cs" ? "cs-CZ" : "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              )}

              {deliveryInfo.preferredTimeSlot && (
                <div>
                  <span className="font-medium text-teal-800">Čas doručení:</span>
                  <span className="ml-2 text-teal-800">
                    {tDelivery(`calendar.${deliveryInfo.preferredTimeSlot}`)}
                  </span>
                </div>
              )}

              {deliveryInfo.recipientName && (
                <div>
                  <span className="font-medium text-teal-800">Příjemce:</span>
                  <span className="ml-2 text-teal-800">{deliveryInfo.recipientName}</span>
                </div>
              )}

              {deliveryInfo.recipientPhone && (
                <div>
                  <span className="font-medium text-teal-800">Telefon příjemce:</span>
                  <span className="ml-2 text-teal-800">{deliveryInfo.recipientPhone}</span>
                </div>
              )}

              {deliveryInfo.specialInstructions && (
                <div>
                  <span className="font-medium text-teal-800">Speciální pokyny:</span>
                  <span className="ml-2 text-teal-800">{deliveryInfo.specialInstructions}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-funeral-gold border border-amber-100 rounded-lg p-6">
            <h3 className="text-xl font-bold text-teal-800 mb-4 flex items-center">
              <CreditCardIcon className="w-5 h-5 mr-2" />
              Platba
            </h3>

            <div className="text-sm">
              <span className="font-medium text-teal-800">Způsob platby:</span>
              <span className="ml-2 text-teal-800">
                {paymentMethod === "stripe" && "Platební karta (Stripe)"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <OrderSummary
            items={items}
            subtotal={subtotal}
            deliveryCost={deliveryCost}
            totalAmount={totalAmount}
            {...(estimatedDeliveryDate && { estimatedDeliveryDate })}
            locale={locale}
          />
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="agreeToTerms"
            checked={agreeToTerms}
            onChange={(e) => onAgreeToTermsChange(e.target.checked)}
            className="mt-1 w-4 h-4 text-amber-200 border-amber-300 rounded "
            required
          />
          <label htmlFor="agreeToTerms" className="text-sm text-amber-100">
            Souhlasím s{" "}
            <a
              href="/terms"
              target="_blank"
              className="text-amber-200 hover:text-teal-800 underline"
              rel="noopener"
            >
              obchodními podmínkami
            </a>{" "}
            a{" "}
            <a
              href="/privacy"
              target="_blank"
              className="text-amber-200 hover:text-funeral-gold/50 underline"
              rel="noopener"
            >
              zásadami ochrany osobních údajů
            </a>
            . *
          </label>
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="subscribeNewsletter"
            checked={subscribeNewsletter}
            onChange={(e) => onSubscribeNewsletterChange(e.target.checked)}
            className="mt-1 w-4 h-4 text-amber-100 border-amber-300 rounded "
          />
          <label htmlFor="subscribeNewsletter" className="text-sm text-amber-100">
            Chci dostávat novinky a speciální nabídky na e-mail (volitelné)
          </label>
        </div>
      </div>

      {/* Final Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Připraveno k odeslání</p>
            <p>
              Po kliknutí na "Dokončit objednávku" bude vytvořena vaše objednávka a budete
              přesměrováni na platební bránu. Na váš e-mail pošleme potvrzení objednávky.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
