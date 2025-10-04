"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name_cs: string;
  name_en: string;
  description_cs?: string;
  description_en?: string;
  slug: string;
  base_price: number;
  category_id?: string;
  active: boolean;
  featured: boolean;
  stock_quantity?: number;
  low_stock_threshold?: number;
  track_inventory?: boolean;
}

interface Category {
  id: string;
  name_cs: string;
  name_en: string;
  slug: string;
}

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function ProductForm({ product, categories, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name_cs: "",
    name_en: "",
    description_cs: "",
    description_en: "",
    slug: "",
    base_price: 0,
    category_id: "",
    active: true,
    featured: false,
    stock_quantity: 0,
    low_stock_threshold: 5,
    track_inventory: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name_cs: product.name_cs || "",
        name_en: product.name_en || "",
        description_cs: product.description_cs || "",
        description_en: product.description_en || "",
        slug: product.slug || "",
        base_price: product.base_price || 0,
        category_id: product.category_id || "",
        active: product.active ?? true,
        featured: product.featured ?? false,
        stock_quantity: product.stock_quantity || 0,
        low_stock_threshold: product.low_stock_threshold || 5,
        track_inventory: product.track_inventory ?? false,
      });
    }
  }, [product]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[áàäâ]/g, "a")
      .replace(/[éèëê]/g, "e")
      .replace(/[íìïî]/g, "i")
      .replace(/[óòöô]/g, "o")
      .replace(/[úùüû]/g, "u")
      .replace(/[ýÿ]/g, "y")
      .replace(/[ñ]/g, "n")
      .replace(/[ç]/g, "c")
      .replace(/[š]/g, "s")
      .replace(/[č]/g, "c")
      .replace(/[ř]/g, "r")
      .replace(/[ž]/g, "z")
      .replace(/[ť]/g, "t")
      .replace(/[ď]/g, "d")
      .replace(/[ň]/g, "n")
      .replace(/[ů]/g, "u")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug from Czech name
    if (field === "name_cs" && !product) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!(formData as any).name_cs.trim()) {
      newErrors.name_cs = "Český název je povinný";
    }

    if (!(formData as any).name_en.trim()) {
      newErrors.name_en = "Anglický název je povinný";
    }

    if (!(formData as any).slug.trim()) {
      newErrors.slug = "URL slug je povinný";
    }

    if ((formData as any).base_price <= 0) {
      newErrors.base_price = "Cena musí být větší než 0";
    }

    if (!(formData as any).category_id) {
      newErrors.category_id = "Kategorie je povinná";
    }

    if ((formData as any).track_inventory && (formData as any).stock_quantity < 0) {
      newErrors.stock_quantity = "Počet kusů nemůže být záporný";
    }

    if ((formData as any).track_inventory && (formData as any).low_stock_threshold < 0) {
      newErrors.low_stock_threshold = "Práh pro upozornění nemůže být záporný";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {product ? "Upravit produkt" : "Přidat nový produkt"}
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Základní informace</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Czech name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Název (čeština) *
              </label>
              <input
                type="text"
                value={(formData as any).name_cs}
                onChange={(e) => handleInputChange("name_cs", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  (errors as any).name_cs ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Název produktu v češtině"
              />
              {(errors as any).name_cs && (
                <p className="mt-1 text-sm text-red-600">{(errors as any).name_cs}</p>
              )}
            </div>

            {/* English name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Název (angličtina) *
              </label>
              <input
                type="text"
                value={(formData as any).name_en}
                onChange={(e) => handleInputChange("name_en", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  (errors as any).name_en ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Product name in English"
              />
              {(errors as any).name_en && (
                <p className="mt-1 text-sm text-red-600">{(errors as any).name_en}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL slug *</label>
              <input
                type="text"
                value={(formData as any).slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  (errors as any).slug ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="url-slug-produktu"
              />
              {(errors as any).slug && (
                <p className="mt-1 text-sm text-red-600">{(errors as any).slug}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie *</label>
              <select
                value={(formData as any).category_id}
                onChange={(e) => handleInputChange("category_id", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  (errors as any).category_id ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Vyberte kategorii</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_cs}
                  </option>
                ))}
              </select>
              {(errors as any).category_id && (
                <p className="mt-1 text-sm text-red-600">{(errors as any).category_id}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Základní cena (Kč) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={(formData as any).base_price}
                onChange={(e) =>
                  handleInputChange("base_price", Number.parseFloat(e.target.value) || 0)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  (errors as any).base_price ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
              {(errors as any).base_price && (
                <p className="mt-1 text-sm text-red-600">{(errors as any).base_price}</p>
              )}
            </div>
          </div>

          {/* Descriptions */}
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Popis (čeština)
              </label>
              <textarea
                rows={4}
                value={formData.description_cs}
                onChange={(e) => handleInputChange("description_cs", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailní popis produktu v češtině"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Popis (angličtina)
              </label>
              <textarea
                rows={4}
                value={formData.description_en}
                onChange={(e) => handleInputChange("description_en", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed product description in English"
              />
            </div>
          </div>
        </div>

        {/* Inventory Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Správa zásob</h3>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.track_inventory}
                onChange={(e) => handleInputChange("track_inventory", e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Sledovat skladové zásoby</span>
            </label>

            {formData.track_inventory && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Počet kusů na skladě
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={(formData as any).stock_quantity}
                    onChange={(e) =>
                      handleInputChange("stock_quantity", Number.parseInt(e.target.value, 10) || 0)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.stock_quantity ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.stock_quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock_quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Práh pro upozornění na nízké zásoby
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={(formData as any).low_stock_threshold}
                    onChange={(e) =>
                      handleInputChange(
                        "low_stock_threshold",
                        Number.parseInt(e.target.value, 10) || 0
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.low_stock_threshold ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.low_stock_threshold && (
                    <p className="mt-1 text-sm text-red-600">{errors.low_stock_threshold}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Stav produktu</h3>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange("active", e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Aktivní (zobrazit na webu)</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleInputChange("featured", e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Doporučený produkt</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Zrušit
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Ukládám..." : product ? "Uložit změny" : "Vytvořit produkt"}
          </button>
        </div>
      </form>
    </div>
  );
}
