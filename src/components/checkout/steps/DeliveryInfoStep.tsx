'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { DeliveryInfo } from '@/types/order';
import { DeliveryUrgency, DeliveryTimeSlot } from '@/types/delivery';
import { Input } from '@/components/ui/Input';
import { DeliveryOptionsSelector } from '@/components/delivery/DeliveryOptionsSelector';
import { DeliveryCalendar } from '@/components/delivery/DeliveryCalendar';

interface DeliveryInfoStepProps {
  deliveryInfo: Partial<DeliveryInfo>;
  errors?: Partial<Record<keyof DeliveryInfo, string>>;
  onChange: (deliveryInfo: Partial<DeliveryInfo>) => void;
  locale: string;
}

export function DeliveryInfoStep({
  deliveryInfo,
  errors = {},
  onChange,
  locale
}: DeliveryInfoStepProps) {
  const t = useTranslations('checkout');
  const tDelivery = useTranslations('delivery');

  const [showCalendar, setShowCalendar] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  // Load available delivery dates when address or urgency changes
  useEffect(() => {
    const loadAvailableDates = async () => {
      if (deliveryInfo.address?.postalCode && deliveryInfo.urgency) {
        try {
          const response = await fetch('/api/delivery/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              postalCode: deliveryInfo.address.postalCode,
              urgency: deliveryInfo.urgency
            })
          });

          const data = await response.json();
          if (data.success && data.calendar) {
            const dates = data.calendar.availableDates
              .filter((avail: any) => avail.available)
              .map((avail: any) => new Date(avail.date));
            setAvailableDates(dates);
          }
        } catch (error) {
          console.error('Error loading available dates:', error);
        }
      }
    };

    loadAvailableDates();
  }, [deliveryInfo.address?.postalCode, deliveryInfo.urgency]);

  const handleAddressChange = (field: string, value: string) => {
    const currentAddress = deliveryInfo.address || {
      street: '',
      city: '',
      postalCode: '',
      country: 'CZ'
    };

    const newAddress = {
      ...currentAddress,
      [field]: value
    };

    onChange({
      ...deliveryInfo,
      address: newAddress
    });
  };

  const handleUrgencyChange = (urgency: DeliveryUrgency) => {
    onChange({
      ...deliveryInfo,
      urgency
    });
  };

  const handleDateSelect = (date: Date) => {
    onChange({
      ...deliveryInfo,
      preferredDate: date
    });
    setShowCalendar(false);
  };

  const handleTimeSlotChange = (timeSlot: DeliveryTimeSlot) => {
    onChange({
      ...deliveryInfo,
      preferredTimeSlot: timeSlot
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-elegant text-2xl font-semibold text-primary-800 mb-2">
          {t('deliveryInfo')}
        </h2>
        <p className="text-neutral-600">
          Zadejte adresu doručení a vyberte způsob dodání.
        </p>
      </div>

      {/* Delivery Address */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-neutral-800 flex items-center">
          <MapPinIcon className="w-5 h-5 mr-2" />
          Adresa doručení
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {/* Street Address */}
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-neutral-700 mb-2">
              Ulice a číslo popisné *
            </label>
            <Input
              id="street"
              type="text"
              value={deliveryInfo.address?.street || ''}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              error={errors.address}
              placeholder="Např. Václavské náměstí 1"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-2">
                Město *
              </label>
              <Input
                id="city"
                type="text"
                value={deliveryInfo.address?.city || ''}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                error={errors.address}
                placeholder="Praha"
                required
              />
            </div>

            {/* Postal Code */}
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-neutral-700 mb-2">
                PSČ *
              </label>
              <Input
                id="postalCode"
                type="text"
                value={deliveryInfo.address?.postalCode || ''}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                error={errors.address}
                placeholder="110 00"
                required
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-neutral-700 mb-2">
                Země *
              </label>
              <select
                id="country"
                value={deliveryInfo.address?.country || 'CZ'}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="CZ">Česká republika</option>
                <option value="SK">Slovensko</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Options */}
      {deliveryInfo.address?.postalCode && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2" />
            Způsob doručení
          </h3>

          <DeliveryOptionsSelector
            address={deliveryInfo.address}
            selectedUrgency={deliveryInfo.urgency || 'standard'}
            onUrgencyChange={handleUrgencyChange}
          />
        </div>
      )}

      {/* Delivery Date Selection */}
      {deliveryInfo.urgency && availableDates.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Datum doručení
          </h3>

          <div>
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full md:w-auto px-4 py-3 border border-neutral-300 rounded-lg text-left hover:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {deliveryInfo.preferredDate ? (
                <span className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-primary-600" />
                  {deliveryInfo.preferredDate.toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              ) : (
                <span className="flex items-center text-neutral-500">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Vyberte datum doručení
                </span>
              )}
            </button>

            {showCalendar && (
              <div className="mt-4 p-4 border border-neutral-200 rounded-lg bg-white">
                <DeliveryCalendar
                  selectedDate={deliveryInfo.preferredDate}
                  onDateSelect={handleDateSelect}
                  urgency={deliveryInfo.urgency}
                  postalCode={deliveryInfo.address?.postalCode}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Time Slot Selection */}
      {deliveryInfo.preferredDate && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">
            Čas doručení
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(['morning', 'afternoon', 'evening', 'anytime'] as DeliveryTimeSlot[]).map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => handleTimeSlotChange(slot)}
                className={`
                  p-4 border-2 rounded-lg text-left transition-colors
                  ${deliveryInfo.preferredTimeSlot === slot
                    ? 'border-primary-500 bg-primary-50 text-primary-900'
                    : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300'
                  }
                `}
              >
                <div className="font-medium">
                  {tDelivery(`calendar.${slot}`)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recipient Information (Optional) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-800 flex items-center">
          <UserIcon className="w-5 h-5 mr-2" />
          Informace o příjemci (volitelné)
        </h3>

        <p className="text-sm text-neutral-600">
          Pokud se liší od objednavatele, zadejte kontakt na příjemce.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="recipientName" className="block text-sm font-medium text-neutral-700 mb-2">
              Jméno příjemce
            </label>
            <Input
              id="recipientName"
              type="text"
              value={deliveryInfo.recipientName || ''}
              onChange={(e) => onChange({ ...deliveryInfo, recipientName: e.target.value })}
              error={errors.recipientName}
              placeholder="Jméno a příjmení příjemce"
            />
          </div>

          <div>
            <label htmlFor="recipientPhone" className="block text-sm font-medium text-neutral-700 mb-2">
              Telefon příjemce
            </label>
            <Input
              id="recipientPhone"
              type="tel"
              value={deliveryInfo.recipientPhone || ''}
              onChange={(e) => onChange({ ...deliveryInfo, recipientPhone: e.target.value })}
              error={errors.recipientPhone}
              placeholder="+420 123 456 789"
            />
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      <div>
        <label htmlFor="specialInstructions" className="block text-sm font-medium text-neutral-700 mb-2">
          Speciální pokyny pro doručení (volitelné)
        </label>
        <textarea
          id="specialInstructions"
          value={deliveryInfo.specialInstructions || ''}
          onChange={(e) => onChange({ ...deliveryInfo, specialInstructions: e.target.value })}
          placeholder="Např. 'Zazvonit u vrátnice', 'Nechat u sousedů', apod."
          rows={3}
          className={`
            w-full px-4 py-3 border rounded-lg resize-none
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${errors.specialInstructions
              ? 'border-red-300 bg-red-50'
              : 'border-neutral-300 bg-white'
            }
          `}
        />
        {errors.specialInstructions && (
          <p className="mt-1 text-sm text-red-600">{errors.specialInstructions}</p>
        )}
        <p className="mt-1 text-xs text-neutral-500">
          Maximálně 500 znaků
        </p>
      </div>
    </div>
  );
}
