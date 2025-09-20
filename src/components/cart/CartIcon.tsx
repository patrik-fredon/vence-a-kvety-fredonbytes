"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/lib/cart/context";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

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
      className={cn(
        "relative inline-flex items-center text-stone-700 hover:text-stone-900 transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded-md",
        className
      )}
      title={t("cart")}
    >
      <ShoppingCartIcon className="w-5 h-5" />

      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center min-w-[1rem] px-1">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}

      <span className="sr-only">
        {t("cart")} ({itemCount} {itemCount === 1 ? "item" : "items"})
      </span>
    </Link>
  );
}
