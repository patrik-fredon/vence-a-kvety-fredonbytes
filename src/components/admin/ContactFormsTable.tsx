"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

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
  locale,
}: ContactFormsTableProps) {
  const router = useRouter();
  const [selectedForm, setSelectedForm] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: "bg-amber-100 text-amber-800", label: "Nová" },
      read: { color: "bg-blue-100 text-blue-800", label: "Přečtená" },
      replied: { color: "bg-green-100 text-green-800", label: "Zodpovězená" },
      archived: { color: "bg-stone-100 text-stone-800", label: "Archivovaná" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const openModal = (form: any) => {
    setSelectedForm(form);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedForm(null);
    setIsModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("cs-CZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = async (formId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/contact-forms/${formId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <>
      <Card padding="none">
        <div className="px-6 py-4 border-b border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Hledat podle jména, e-mailu nebo předmětu..."
                defaultValue={currentSearch}
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                iconPosition="left"
                onChange={(e) => {
                  const params = new URLSearchParams(window.location.search);
                  if (e.target.value) {
                    params.set("search", e.target.value);
                  } else {
                    params.delete("search");
                  }
                  params.set("page", "1");
                  router.push(`/${locale}/admin/contact-forms?${params.toString()}`);
                }}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-stone-700">Stav:</label>
              <select
                value={currentStatus}
                onChange={(e) => {
                  const params = new URLSearchParams(window.location.search);
                  if (e.target.value !== "all") {
                    params.set("status", e.target.value);
                  } else {
                    params.delete("status");
                  }
                  params.set("page", "1");
                  router.push(`/${locale}/admin/contact-forms?${params.toString()}`);
                }}
                className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-funeral-gold text-stone-900"
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
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Kontakt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Předmět
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Stav
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-funeral-gold divide-y divide-stone-200">
              {contactForms.map((form) => (
                <tr key={form.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-stone-900">{form.name}</div>
                      <div className="text-sm text-stone-500">{form.email}</div>
                      {form.phone && <div className="text-sm text-stone-500">{form.phone}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-stone-900 max-w-xs truncate">{form.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(form.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                    {formatDate(form.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal(form)}>
                        Zobrazit
                      </Button>
                      <select
                        value={form.status}
                        onChange={(e) => handleStatusChange(form.id, e.target.value)}
                        className="text-xs border border-stone-300 rounded px-2 py-1 bg-funeral-gold text-stone-900 focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
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
          <div className="px-6 py-4 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-stone-700">
                Stránka {currentPage} z {totalPages}
              </div>
              <div className="flex items-center gap-2">
                {currentPage > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams(window.location.search);
                      params.set("page", (currentPage - 1).toString());
                      router.push(`/${locale}/admin/contact-forms?${params.toString()}`);
                    }}
                  >
                    Předchozí
                  </Button>
                )}
                {currentPage < totalPages && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams(window.location.search);
                      params.set("page", (currentPage + 1).toString());
                      router.push(`/${locale}/admin/contact-forms?${params.toString()}`);
                    }}
                  >
                    Další
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal */}
      {isModalOpen && selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-stone-900">Detail zprávy</h3>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <XMarkIcon className="w-6 h-6" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Jméno</label>
                <p className="text-sm text-stone-900">{selectedForm.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">E-mail</label>
                <p className="text-sm text-stone-900">
                  <a
                    href={`mailto:${selectedForm.email}`}
                    className="text-amber-600 hover:text-amber-800"
                  >
                    {selectedForm.email}
                  </a>
                </p>
              </div>

              {selectedForm.phone && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Telefon</label>
                  <p className="text-sm text-stone-900">
                    <a
                      href={`tel:${selectedForm.phone}`}
                      className="text-amber-600 hover:text-amber-800"
                    >
                      {selectedForm.phone}
                    </a>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Předmět</label>
                <p className="text-sm text-stone-900">{selectedForm.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Zpráva</label>
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-sm text-stone-900 whitespace-pre-wrap">
                    {selectedForm.message}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-stone-500">
                <div>
                  <label className="block font-medium mb-1">Datum odeslání</label>
                  <p>{formatDate(selectedForm.created_at)}</p>
                </div>
                <div>
                  <label className="block font-medium mb-1">Stav</label>
                  <p>{getStatusBadge(selectedForm.status)}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <Button variant="outline" onClick={closeModal}>
                  Zavřít
                </Button>
                <Button
                  onClick={() =>
                    window.open(
                      `mailto:${selectedForm.email}?subject=Re: ${selectedForm.subject}`,
                      "_blank"
                    )
                  }
                >
                  Odpovědět
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
