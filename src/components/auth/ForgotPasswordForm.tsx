"use client";

import Link from "next/link";
import { useState } from "react";
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
      <div className="max-w-md mx-auto">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">E-mail odeslán</h2>
            <p className="text-gray-600 mb-6">
              Pokud existuje účet s e-mailem <strong>{email}</strong>, odeslali jsme vám odkaz pro
              obnovení hesla.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Zkontrolujte svou e-mailovou schránku a klikněte na odkaz pro vytvoření nového hesla.
            </p>
            <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Zpět na přihlášení
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white py-8 px-6 shadow rounded-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Zapomenuté heslo</h2>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Zadejte svůj e-mail a my vám pošleme odkaz pro obnovení hesla
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            label="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || !email}>
            {loading ? "Odesílání..." : "Odeslat odkaz"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/signin" className="text-sm text-indigo-600 hover:text-indigo-500">
            Zpět na přihlášení
          </Link>
        </div>
      </div>
    </div>
  );
}
