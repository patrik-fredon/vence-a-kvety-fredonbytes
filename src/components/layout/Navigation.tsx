"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface NavigationProps {
  locale: string;
  mobile?: boolean;
  onItemClick?: () => void;
}

export function Navigation({ locale, mobile = false, onItemClick }: NavigationProps) {
  const t = useTranslations("navigation");
  const tAccessibility = useTranslations("accessibility");
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLinkClick = () => {
    onItemClick?.();
  };

  const navItems = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/products`, label: t("products") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  // For mobile navigation, use enhanced stone-based design
  if (mobile) {
    return (
      <nav className="space-y-1" aria-label={tAccessibility("mobileNavigation")}>
        {navItems.map((item) => (
          <Link
            key={item.href}
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
      aria-label={tAccessibility("mainNavigation")}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
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
      ))}
    </nav>
  );
}
