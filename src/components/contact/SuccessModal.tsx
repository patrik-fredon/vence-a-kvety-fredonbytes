'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
}

export function SuccessModal({ isOpen, onClose, customerName }: SuccessModalProps) {
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Zpráva odeslána
                    </Dialog.Title>
                  </div>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-2">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex">
                      <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-green-800">
                          Úspěšně odesláno!
                        </h4>
                        <p className="text-sm text-green-700 mt-1">
                          {customerName ? `Děkujeme, ${customerName.split(' ')[0]}!` : 'Děkujeme!'} Vaše zpráva byla úspěšně odeslána.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <p>Na Vaši e-mailovou adresu jsme odeslali potvrzení o přijetí zprávy</p>
                    </div>

                    <div className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <p>Odpovíme Vám obvykle do 24 hodin</p>
                    </div>

                    <div className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <p>V naléhavých případech nás kontaktujte telefonicky na <strong>+420 123 456 789</strong></p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-amber-800">
                          Důležité informace
                        </h4>
                        <div className="text-sm text-amber-700 mt-1">
                          <p><strong>Otevírací doba:</strong> Po-Pá: 8:00-17:00, So: 9:00-14:00</p>
                          <p><strong>Adresa:</strong> Hlavní 123, 110 00 Praha 1</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Zavřít
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      onClose();
                      // Navigate to products or home page
                      window.location.href = '/cs/products';
                    }}
                    className="flex-1"
                  >
                    Prohlédnout věnce
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
