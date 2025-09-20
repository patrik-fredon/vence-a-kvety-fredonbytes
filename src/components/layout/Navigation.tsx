"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface NavigationProps {
  locale: string;
  mobile?: boolean;
  onItemClick?: () => void;
}

// Mock categories - will be replaced with actual data from API
const mockCategories = [
  {
    id: "1",
    name: { cs: "Klasické věnce", en: "Classic Wreaths" },
    slug: "classic-wreaths",
    subcategories: [
      { id: "1-1", name: { cs: "Růžové věnce", en: "Rose Wreaths" }, slug: "rose-wreaths" },
      { id: "1-2", name: { cs: "Bílé věnce", en: "White Wreaths" }, slug: "white-wreaths" },
      { id: "1-3", name: { cs: "Smíšené věnce", en: "Mixed Wreaths" }, slug: "mixed-wreaths" },
    ],
  },
  {
    id: "2",
    name: { cs: "Moderní aranžmá", en: "Modern Arrangements" },
    slug: "modern-arrangements",
    subcategories: [
      { id: "2-1", name: { cs: "Minimalistické", en: "Minimalist" }, slug: "minimalist" },
      { id: "2-2", name: { cs: "Designové", en: "Designer" }, slug: "designer" },
    ],
  },
  {
    id: "3",
    name: { cs: "Sezónní věnce", en: "Seasonal Wreaths" },
    slug: "seasonal-wreaths",
    subcategories: [
      { id: "3-1", name: { cs: "Jarní", en: "Spring" }, slug: "spring" },
      { id: "3-2", name: { cs: "Letní", en: "Summer" }, slug: "summer" },
      { id: "3-3", name: { cs: "Podzimní", en: "Autumn" }, slug: "autumn" },
      { id: "3-4", name: { cs: "Zimní", en: "Winter" }, slug: "winter" },
    ],
  },
];

export function Navigation({ locale, mobile = false, onItemClick }: NavigationProps) {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    if (!mobile) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }

    return undefined;
  }, [mobile]);

  const isActiveLink = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleDropdownToggle = (categoryId: string) => {
    setOpenDropdown(openDropdown === categoryId ? null : categoryId);
  };

  const handleLinkClick = () => {
    setOpenDropdown(null);
    onItemClick?.();
  };

  const navItems = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/products`, label: t("products"), hasDropdown: true },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  // For mobile navigation, use enhanced stone-based design
  if (mobile) {
    return (
      <nav
        className="space-y-1"
        role="navigation"
        aria-label="Mobilní navigace"
      >
        {navItems.map((item) => (
          <div key={item.href}>
            {item.hasDropdown ? (
              <div>
                <button
                  onClick={() => handleDropdownToggle("products")}
                  className={cn(
                    "w-full flex items-center justify-between p-4 text-left rounded-lg transition-all duration-200",
                    isActiveLink(item.href)
                      ? "text-stone-900 bg-stone-100 font-semibold shadow-sm"
                      : "text-stone-700 hover:text-stone-900 hover:bg-stone-50 font-medium"
                  )}
                >
                  <span className="text-base">{item.label}</span>
                  <ChevronDownIcon
                    className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      openDropdown === "products" ? "rotate-180" : ""
                    )}
                  />
                </button>

                {openDropdown === "products" && (
                  <div className="mt-2 ml-4 space-y-1 animate-slide-down">
                    <Link
                      href={`/${locale}/products`}
                      className="block p-3 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors duration-200 font-medium"
                      onClick={handleLinkClick}
                    >
                      {t("products")} - Všechny
                    </Link>
                    {mockCategories.map((category) => (
                      <div key={category.id} className="space-y-1">
                        <Link
                          href={`/${locale}/products/${category.slug}`}
                          className="block p-3 text-sm font-semibold text-stone-800 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors duration-200"
                          onClick={handleLinkClick}
                        >
                          {category.name[locale as "cs" | "en"]}
                        </Link>
                        {category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            href={`/${locale}/products/${category.slug}/${subcategory.slug}`}
                            className="block p-2 pl-8 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors duration-200"
                            onClick={handleLinkClick}
                          >
                            {subcategory.name[locale as "cs" | "en"]}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "block p-4 rounded-lg transition-all duration-200 text-base",
                  isActiveLink(item.href)
                    ? "text-stone-900 bg-stone-100 font-semibold shadow-sm"
                    : "text-stone-700 hover:text-stone-900 hover:bg-stone-50 font-medium"
                )}
                onClick={handleLinkClick}
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    );
  }

  // Desktop navigation is now handled directly in Header component
  // This fallback should not be used in the new design
  return (
    <nav
      id="main-navigation"
      className="flex items-center space-x-8"
      ref={dropdownRef}
      role="navigation"
      aria-label="Hlavní navigace"
    >
      {navItems.map((item) => (
        <div key={item.href} className="relative">
          {item.hasDropdown ? (
            <div>
              <button
                onClick={() => handleDropdownToggle("products")}
                onMouseEnter={() => setOpenDropdown("products")}
                className={cn(
                  "flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActiveLink(item.href)
                    ? "text-stone-900 bg-stone-100"
                    : "text-stone-700 hover:text-stone-900 hover:bg-stone-50"
                )}
                aria-expanded={openDropdown === "products"}
                aria-haspopup="true"
              >
                <span>{item.label}</span>
                <ChevronDownIcon
                  className={cn(
                    "w-4 h-4 transition-transform",
                    openDropdown === "products" ? "rotate-180" : ""
                  )}
                />
              </button>

              {openDropdown === "products" && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg min-w-[280px] animate-scale-in z-50"
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <div className="p-4">
                    <Link
                      href={`/${locale}/products`}
                      className="block p-2 text-sm font-medium text-stone-900 hover:bg-stone-50 rounded-lg transition-colors mb-2"
                      onClick={handleLinkClick}
                    >
                      {t("products")} - Všechny
                    </Link>

                    <div className="space-y-3">
                      {mockCategories.map((category) => (
                        <div key={category.id}>
                          <Link
                            href={`/${locale}/products/${category.slug}`}
                            className="block p-2 text-sm font-medium text-stone-800 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors"
                            onClick={handleLinkClick}
                          >
                            {category.name[locale as "cs" | "en"]}
                          </Link>
                          <div className="ml-4 space-y-1">
                            {category.subcategories.map((subcategory) => (
                              <Link
                                key={subcategory.id}
                                href={`/${locale}/products/${category.slug}/${subcategory.slug}`}
                                className="block p-1.5 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded transition-colors"
                                onClick={handleLinkClick}
                              >
                                {subcategory.name[locale as "cs" | "en"]}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActiveLink(item.href)
                  ? "text-stone-900 bg-stone-100"
                  : "text-stone-700 hover:text-stone-900 hover:bg-stone-50"
              )}
              onClick={handleLinkClick}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
