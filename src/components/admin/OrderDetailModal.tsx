'use client';

import { useState } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  itemCount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  preferredDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  internalNotes?: string;
}

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: string, internalNotes?: string) => void;
}

const statusOptions = [
  { value: 'pending', label: 'Čekající' },
  { value: 'confirmed', label: 'Potvrzeno' },
  { value: 'processing', label: 'Zpracovává se' },
  { value: 'shipped', label: 'Odesláno' },
  { value: 'delivered', label: 'Doručeno' },
  { value: 'cancelled', label: 'Zrušeno' }
];

export default function OrderDetailModal({ order, onClose, onStatusUpdate }: OrderDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [internalNotes, setInternalNotes] = useState(order.internalNotes || '');
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status && internalNotes === (order.internalNotes || '')) {
      return;
    }

    setLoading(true);
    try {
      await onStatusUpdate(order.id, selectedStatus, internalNotes);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Transition appear show={true} as={Fragment}>
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Detail objednávky #{order.orderNumber}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Order status and basic info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Informace o objednávce</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Číslo objednávky:</span>
                          <span className="font-medium">#{order.orderNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Stav:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {statusOptions.find(s => s.value === order.status)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Celková částka:</span>
                          <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Počet položek:</span>
                          <span>{order.itemCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Platební metoda:</span>
                          <span>{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Stav platby:</span>
                          <span>{order.paymentStatus}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Zákazník</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Jméno:</span>
                          <span className="font-medium">{order.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email:</span>
                          <span>{order.customerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Telefon:</span>
                          <span>{order.customerPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Doručení</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Adresa:</span>
                        <p className="font-medium">{order.deliveryAddress}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Preferovaný termín:</span>
                        <p className="font-medium">
                          {new Date(order.preferredDate).toLocaleDateString('cs-CZ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Časové údaje</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Vytvořeno:</span>
                        <p>{new Date(order.createdAt).toLocaleString('cs-CZ')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Aktualizováno:</span>
                        <p>{new Date(order.updatedAt).toLocaleString('cs-CZ')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer notes */}
                  {order.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Poznámky zákazníka</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Status update section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Aktualizace stavu</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nový stav
                        </label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interní poznámky
                        </label>
                        <textarea
                          rows={3}
                          value={internalNotes}
                          onChange={(e) => setInternalNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Interní poznámky pro administrátory..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Zavřít
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={loading || (selectedStatus === order.status && internalNotes === (order.internalNotes || ''))}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Ukládám...' : 'Uložit změny'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
