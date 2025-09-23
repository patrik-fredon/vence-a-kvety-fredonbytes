"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useAuth, useSignOut } from "@/lib/auth/hooks";

interface AuthStatusProps {
  locale: string;
}

export function AuthStatus({ locale }: AuthStatusProps) {
  const t = useTranslations("auth");
  const { user, loading, isAuthenticated } = useAuth();
  const { signOut, loading: signOutLoading } = useSignOut();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse bg-gray-200 h-8 w-20 rounded" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="hidden sm:block">
          <span className="text-sm text-gray-700">
            {locale === "cs" ? "Vítejte" : "Welcome"}, {user.name || user.email}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link href={`/${locale}/profile`}>
            <Button variant="outline" size="sm">
              {t("profile")}
            </Button>
          </Link>

          <Button variant="outline" size="sm" onClick={handleSignOut} disabled={signOutLoading}>
            {signOutLoading ? (locale === "cs" ? "Odhlašování..." : "Signing out...") : t("logout")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link href={`/${locale}/auth/signin`}>
        <Button variant="outline" size="sm">
          {t("login")}
        </Button>
      </Link>

      <Link href={`/${locale}/auth/signup`}>
        <Button size="sm">{t("register")}</Button>
      </Link>
    </div>
  );
}
