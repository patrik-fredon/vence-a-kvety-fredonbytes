'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContactForm } from '@/types/contact';

interface ContactFormsTableProps {
  contactForms: any[];
  currentPage: number;
  totalPages: number;
  currentStatus: string;
  currentSearch: string;
  locale: string;
}

export function ContactFormsTable({
  contactForms,
  currentPage,
  totalPages,
  currentStatus,
  currentSearch,
  locale
}: ContactFormsTableProps) {
  const router = useRouter();
  const [selectedForm, setSelectedForm] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-yellow-100 text-yellow-800', label: 'Nová' },
      read: { color: 'bg-blue-100 text-blue-800', label: 'Přečtená' },
      replied: { color: 'bg-green-100 text-green-800', label: 'Zodpovězená' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Archivovaná' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = async (formId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/contact-forms/${formId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openModal = (form: any) => {
    setSelectedForm(form);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedForm(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Hledat podle jména, e-mailu nebo předmětu..."
              defaultValue={currentSearch}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              onChange={(e) => {
                const params = new URLSearchParams(window.location.search);
                if (e.target.value) {
                  params.set('search', e.target.value);
                } else {
                  params.delete('search');
                }
                params.set('page', '1');
                router.push(`/${locale}/admin/contact-forms?${params.toString()}`);
              }}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-700">Stav:</label>
            <select
              value={currentStatus}
              onChange={(e) => {
                const params = new URLSearchParams(window.location.search);
                if (e.target.value !== 'all') {
                  params.set('status', e.target.value);
                } else {
                  params.delete('status');
                }
                params.set('page', '1');
                router.push(`/${locale}/admin/contact-forms?${params.toString()}`);
              }}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Všechny</option>
              <option value="new">Nové</option>
              <option value="read">Přečtené</option>
              <option value="replied">Zodpovězené</option>
              <option value="archived">Archivované</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Kontakt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Předmět
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Stav
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Datum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Akce
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {contactForms.map((form) => (
              <tr key={form.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{form.name}</div>
                    <div className="text-sm text-neutral-500">{form.email}</div>
                    {form.phone && (
                      <div className="text-sm text-neutral-500">{form.phone}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-neutral-900 max-w-xs truncate">
                    {form.subject}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(form.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {formatDate(form.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(form)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Zobrazit
                    </button>
                    <select
                      value={form.status}
                      onChange={(e) => handleStatusChange(form.id, e.target.value)}
                      className="text-xs border border-neutral-300 rounded px-2 py-1"
                    >
                      <option value="new">Nová</option>
                      <option value="read">Přečtená</option>
                      <option value="replied">Zodpovězená</option>
                      <option value="archived">Archivovaná</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-700">
              Stránka {currentPage} z {totalPages}
            </div>
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    params.set('page', (currentPage - 1).toString());
                    router.push(`/${locale}/admin/contact-forms?${params.toString()}`);
                  }}
                  className="px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  Předchozí
                </button>
              )}
              {currentPage < totalPages && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    params.set('page', (currentPage + 1).toString());
                    router.push(`/${locale}/admin/contact-forms?${params.toString()}`);
                  }}
                  className="px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  Další
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Detail zprávy
                </h3>
                <button
                  onClick={closeModal}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Jméno
                  </label>
                  <p className="text-sm text-neutral-900">{selectedForm.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    E-mail
                  </label>
                  <p className="text-sm text-neutral-900">
                    <a href={`mailto:${selectedForm.email}`} className="text-primary-600 hover:text-primary-800">
                      {selectedForm.email}
                    </a>
                  </p>
                </div>

                {selectedForm.phone && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Telefon
                    </label>
                    <p className="text-sm text-neutral-900">
                      <a href={`tel:${selectedForm.phone}`} className="text-primary-600 hover:text-primary-800">
                        {selectedForm.phone}
                      </a>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Předmět
                  </label>
                  <p className="text-sm text-neutral-900">{selectedForm.subject}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Zpráva
                  </label>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-sm text-neutral-900 whitespace-pre-wrap">
                      {selectedForm.message}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-neutral-500">
                  <div>
                    <label className="block font-medium mb-1">Datum odeslání</label>
                    <p>{formatDate(selectedForm.created_at)}</p>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Stav</label>
                    <p>{getStatusBadge(selectedForm.status)}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50"
                  >
                    Zavřít
                  </button>
                  <a
                    href={`mailto:${selectedForm.email}?subject=Re: ${selectedForm.subject}`}
                    className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Odpovědět
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
