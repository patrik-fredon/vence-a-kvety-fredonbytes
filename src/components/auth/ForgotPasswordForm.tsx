"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useResetPassword } from "@/lib/auth/hooks";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { resetPassword, loading, error } = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await resetPassword({ email });

    if (result.success) {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 border border-green-200 mb-6">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-light text-stone-900 mb-4">E-mail odeslán</h2>
              <p className="text-stone-600 mb-6 leading-relaxed">
                Pokud existuje účet s e-mailem <strong className="text-stone-900">{email}</strong>, odeslali jsme vám odkaz pro
                obnovení hesla.
              </p>
              <p className="text-sm text-stone-500 mb-8 leading-relaxed">
                Zkontrolujte svou e-mailovou schránku a klikněte na odkaz pro vytvoření nového hesla.
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors duration-200"
              >
                ← Zpět na přihlášení
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light text-stone-900 mb-2">Zapomenuté heslo</h2>
            <p className="text-stone-600 leading-relaxed">
              Zadejte svůj e-mail a my vám pošleme odkaz pro obnovení hesla
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="email"
              name="email"
              type="email"
              label="E-mailová adresa"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
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
              disabled={loading || !email}
              loading={loading}
              loadingText="Odesílání..."
            >
              Odeslat odkaz
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <Link
              href="/auth/signin"
              className="text-sm text-stone-600 hover:text-amber-600 transition-colors duration-200"
            >
              ← Zpět na přihlášení
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
