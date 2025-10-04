"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/lib/icons";
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
      {
        id: "1-1",
        name: { cs: "Růžové věnce", en: "Rose Wreaths" },
        slug: "rose-wreaths",
      },
      {
        id: "1-2",
        name: { cs: "Bílé věnce", en: "White Wreaths" },
        slug: "white-wreaths",
      },
      {
        id: "1-3",
        name: { cs: "Smíšené věnce", en: "Mixed Wreaths" },
        slug: "mixed-wreaths",
      },
    ],
  },
  {
    id: "2",
    name: { cs: "Moderní aranžmá", en: "Modern Arrangements" },
    slug: "modern-arrangements",
    subcategories: [
      {
        id: "2-1",
        name: { cs: "Minimalistické", en: "Minimalist" },
        slug: "minimalist",
      },
      {
        id: "2-2",
        name: { cs: "Designové", en: "Designer" },
        slug: "designer",
      },
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
  const tAccessibility = useTranslations("accessibility");
  const tProduct = useTranslations("product");
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
      <nav className="space-y-1" role="navigation" aria-label={tAccessibility("mobileNavigation")}>
        {navItems.map((item) => (
          <div key={item.href}>
            {item.hasDropdown ? (
              <div>
                <button
                  onClick={() => handleDropdownToggle("products")}
                  className={cn(
                    "w-full flex items-center justify-between p-4 text-left rounded-lg transition-all duration-200",
                    isActiveLink(item.href)
                      ? "text-stone-900 bg-accent font-semibold shadow-xl"
                      : "text-stone-700 hover:text-primary-light hover:bg-stone-50 font-medium"
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
                      className="block p-3 text-sm text-primary hover:text-accent-light hover:bg-accent rounded-lg transition-colors duration-200 font-medium shadow-xl"
                      onClick={handleLinkClick}
                    >
                      {tProduct("allProducts")}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "block p-4 rounded-lg transition-all duration-200 text-base",
                  isActiveLink(item.href)
                    ? "text-primary bg-accent font-semibold shadow-xl"
                    : "text-primary-dark hover:text-primary-light hover:bg-accent font-medium"
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
      aria-label={tAccessibility("mainNavigation")}
    >
      {navItems.map((item) => (
        <div key={item.href} className="relative">
          {item.hasDropdown ? (
            <div>
              <button
                onClick={() => handleDropdownToggle("products")}
                onMouseEnter={() => setOpenDropdown("products")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDropdownToggle("products");
                  } else if (e.key === "Escape") {
                    setOpenDropdown(null);
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setOpenDropdown("products");
                    // Focus first item in dropdown
                    setTimeout(() => {
                      const firstItem = dropdownRef.current?.querySelector("a");
                      firstItem?.focus();
                    }, 0);
                  }
                }}
                className={cn(
                  "flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2",
                  isActiveLink(item.href)
                    ? "text-primary bg-accent"
                    : "text-accent hover:text-primary-light hover:bg-stone-50"
                )}
                aria-expanded={openDropdown === "products"}
                aria-haspopup="true"
                aria-controls="products-dropdown"
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
                  id="products-dropdown"
                  className="absolute top-full left-0 mt-1 bg-funeral-gold border border-stone-200 rounded-lg shadow-lg min-w-[280px] animate-scale-in z-50"
                  onMouseLeave={() => setOpenDropdown(null)}
                  role="menu"
                  aria-labelledby="products-button"
                >
                  <div className="p-4">
                    <Link
                      href={`/${locale}/products`}
                      className="block p-2 text-sm font-medium text-stone-900 hover:bg-stone-50 rounded-lg transition-colors mb-2"
                      onClick={handleLinkClick}
                    >
                      {tProduct("allProducts")}
                    </Link>

                    <div className="space-y-3">
                      {mockCategories.map((category) => (
                        <div key={category.id}>
                          <Link
                            href={`/${locale}/products/${category.slug}`}
                            className="block p-2 text-sm font-medium text-primary-dark hover:text-primary-light hover:bg-stone-50 rounded-lg transition-colors"
                            onClick={handleLinkClick}
                          >
                            {category.name[locale as "cs" | "en"]}
                          </Link>
                          <div className="ml-4 space-y-1">
                            {category.subcategories.map((subcategory) => (
                              <Link
                                key={subcategory.id}
                                href={`/${locale}/products/${category.slug}/${subcategory.slug}`}
                                className="block p-1.5 text-sm text-primary-dark hover:text-accent-light hover:bg-accent rounded transition-colors"
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
                  ? "text-primary bg-accent"
                  : "text-accent hover:text-primary-light hover:bg-accent"
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
