'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  locale?: string;
}

export function SuccessModal({ isOpen, onClose, customerName, locale = 'cs' }: SuccessModalProps) {
  const content = locale === 'cs' ? {
    title: 'Zpráva odeslána',
    successTitle: 'Úspěšně odesláno!',
    thankYou: customerName ? `Děkujeme, ${customerName.split(' ')[0]}!` : 'Děkujeme!',
    successMessage: 'Vaše zpráva byla úspěšně odeslána.',
    confirmationSent: 'Na Vaši e-mailovou adresu jsme odeslali potvrzení o přijetí zprávy',
    responseTime: 'Odpovíme Vám obvykle do 24 hodin',
    urgentContact: 'V naléhavých případech nás kontaktujte telefonicky na',
    importantInfo: 'Důležité informace',
    openingHours: 'Otevírací doba: Po-Pá: 8:00-17:00, So: 9:00-14:00',
    address: 'Adresa: Hlavní 123, 110 00 Praha 1',
    closeButton: 'Zavřít',
    browseProducts: 'Prohlédnout věnce'
  } : {
    title: 'Message Sent',
    successTitle: 'Successfully sent!',
    thankYou: customerName ? `Thank you, ${customerName.split(' ')[0]}!` : 'Thank you!',
    successMessage: 'Your message has been sent successfully.',
    confirmationSent: 'We have sent a confirmation of receipt to your email address',
    responseTime: 'We usually respond within 24 hours',
    urgentContact: 'For urgent cases, contact us by phone at',
    importantInfo: 'Important Information',
    openingHours: 'Opening hours: Mon-Fri: 8:00-17:00, Sat: 9:00-14:00',
    address: 'Address: Hlavní 123, 110 00 Praha 1',
    closeButton: 'Close',
    browseProducts: 'Browse Wreaths'
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-stone-900/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                <Card variant="elevated" padding="none">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-semibold leading-6 text-stone-900"
                        >
                          {content.title}
                        </Dialog.Title>
                      </div>
                      <button
                        type="button"
                        className="rounded-md text-stone-400 hover:text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-500/20 transition-colors"
                        onClick={onClose}
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Success Message */}
                    <Card variant="outlined" className="border-green-200 bg-green-50 mb-6">
                      <CardContent className="p-4">
                        <div className="flex">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-semibold text-green-800">
                              {content.successTitle}
                            </h4>
                            <p className="text-sm text-green-700 mt-1">
                              {content.thankYou} {content.successMessage}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Information List */}
                    <div className="space-y-3 text-sm text-stone-600 mb-6">
                      <div className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-stone-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p>{content.confirmationSent}</p>
                      </div>

                      <div className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-stone-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p>{content.responseTime}</p>
                      </div>

                      <div className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-stone-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p>
                          {content.urgentContact} <strong className="text-stone-900">+420 123 456 789</strong>
                        </p>
                      </div>
                    </div>

                    {/* Important Information */}
                    <Card variant="outlined" className="border-amber-200 bg-amber-50 mb-6">
                      <CardContent className="p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-semibold text-amber-800">
                              {content.importantInfo}
                            </h4>
                            <div className="text-sm text-amber-700 mt-1 space-y-1">
                              <p><strong>{content.openingHours}</strong></p>
                              <p><strong>{content.address}</strong></p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                      >
                        {content.closeButton}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          onClose();
                          // Navigate to products page
                          window.location.href = `/${locale}/products`;
                        }}
                        className="flex-1"
                      >
                        {content.browseProducts}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
