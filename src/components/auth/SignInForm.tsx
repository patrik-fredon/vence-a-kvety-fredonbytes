"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSignIn } from "@/lib/auth/hooks";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { signIn, loading, error } = useSignIn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signIn(formData);

    if (result.success) {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white py-8 px-6 shadow rounded-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Přihlášení</h2>
          <p className="mt-2 text-sm text-gray-600 text-center">Přihlaste se do svého účtu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            label="E-mail"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            disabled={loading}
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Heslo"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            disabled={loading}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Přihlašování..." : "Přihlásit se"}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Zapomněli jste heslo?
            </Link>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Nemáte účet?{" "}
              <Link
                href="/auth/signup"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Zaregistrujte se
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
