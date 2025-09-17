"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React from "react";
import { useCart } from "@/lib/cart/context";

interface CartIconProps {
  locale: string;
  className?: string;
}

export function CartIcon({ locale, className = "" }: CartIconProps) {
  const t = useTranslations("navigation");
  const { state } = useCart();

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link
      href={`/${locale}/cart`}
      className={`relative inline-flex items-center p-2 text-neutral-700 hover:text-primary-600 transition-colors ${className}`}
      title={t("cart")}
    >
      <ShoppingCartIcon className="w-6 h-6" />

      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}

      <span className="sr-only">
        {t("cart")} ({itemCount} {itemCount === 1 ? "item" : "items"})
      </span>
    </Link>
  );
}
