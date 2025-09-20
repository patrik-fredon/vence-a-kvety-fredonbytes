"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
    <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light text-stone-900 mb-2">Přihlášení</h2>
            <p className="text-stone-600">Přihlaste se do svého účtu</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="email"
              name="email"
              type="email"
              label="E-mailová adresa"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={loading}
              className="transition-all duration-200"
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
              className="transition-all duration-200"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 shadow-sm hover:shadow-md" 
              disabled={loading}
              loading={loading}
              loadingText="Přihlašování..."
            >
              Přihlásit se
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-stone-600 hover:text-amber-600 transition-colors duration-200"
              >
                Zapomněli jste heslo?
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-stone-500">nebo</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-sm text-stone-600">
                Nemáte účet?{" "}
                <Link
                  href="/auth/signup"
                  className="text-amber-600 hover:text-amber-700 font-medium transition-colors duration-200"
                >
                  Zaregistrujte se
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
