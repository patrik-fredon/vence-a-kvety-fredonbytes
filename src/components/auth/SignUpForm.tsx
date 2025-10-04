"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSignUp } from "@/lib/auth/hooks";

export function SignUpForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { signUp, loading, error } = useSignUp();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!(formData as any)["email"]) {
      errors["email"] = "E-mail je povinný";
    } else if (!/\S+@\S+\.\S+/.test((formData as any)["email"])) {
      errors["email"] = "E-mail není ve správném formátu";
    }

    if (!(formData as any)["password"]) {
      errors["password"] = "Heslo je povinné";
    } else if ((formData as any)["password"].length < 6) {
      errors["password"] = "Heslo musí mít alespoň 6 znaků";
    }

    if ((formData as any)["password"] !== (formData as any)["confirmPassword"]) {
      errors["confirmPassword"] = "Hesla se neshodují";
    }

    if (!(formData as any)["name"]) {
      errors["name"] = "Jméno je povinné";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await signUp({
      email: (formData as any)["email"],
      password: (formData as any)["password"],
      name: (formData as any)["name"],
      phone: (formData as any)["phone"] || "",
    });

    if (result.success) {
      router.push("/auth/verify-email");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [e.target.name]: "",
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light text-stone-900 mb-2">Registrace</h2>
            <p className="text-stone-600">Vytvořte si nový účet</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="name"
              name="name"
              type="text"
              label="Jméno a příjmení"
              value={(formData as any)["name"]}
              onChange={handleChange}
              error={validationErrors["name"] || ""}
              required
              autoComplete="name"
              disabled={loading}
              className="transition-all duration-200"
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="E-mailová adresa"
              value={(formData as any)["email"]}
              onChange={handleChange}
              error={validationErrors["email"] || ""}
              required
              autoComplete="email"
              disabled={loading}
              className="transition-all duration-200"
            />

            <Input
              id="phone"
              name="phone"
              type="tel"
              label="Telefon (volitelné)"
              value={(formData as any)["phone"]}
              onChange={handleChange}
              autoComplete="tel"
              disabled={loading}
              helpText="Telefon použijeme pro komunikaci ohledně objednávky"
              className="transition-all duration-200"
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Heslo"
              value={(formData as any)["password"]}
              onChange={handleChange}
              error={validationErrors["password"] || ""}
              required
              autoComplete="new-password"
              disabled={loading}
              helpText="Minimálně 6 znaků"
              className="transition-all duration-200"
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Potvrzení hesla"
              value={(formData as any)["confirmPassword"]}
              onChange={handleChange}
              error={validationErrors["confirmPassword"] || ""}
              required
              autoComplete="new-password"
              disabled={loading}
              className="transition-all duration-200"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
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
              loadingText="Registrování..."
            >
              Zaregistrovat se
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-stone-500">nebo</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-sm text-stone-600">
                Již máte účet?{" "}
                <Link
                  href="/auth/signin"
                  className="text-amber-600 hover:text-amber-700 font-medium transition-colors duration-200"
                >
                  Přihlaste se
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
