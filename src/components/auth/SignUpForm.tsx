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

    if (!formData.email) {
      errors.email = "E-mail je povinný";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "E-mail není ve správném formátu";
    }

    if (!formData.password) {
      errors.password = "Heslo je povinné";
    } else if (formData.password.length < 6) {
      errors.password = "Heslo musí mít alespoň 6 znaků";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Hesla se neshodují";
    }

    if (!formData.name) {
      errors.name = "Jméno je povinné";
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
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone || undefined,
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
    <div className="max-w-md mx-auto">
      <div className="bg-white py-8 px-6 shadow rounded-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Registrace</h2>
          <p className="mt-2 text-sm text-gray-600 text-center">Vytvořte si nový účet</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            name="name"
            type="text"
            label="Jméno a příjmení"
            value={formData.name}
            onChange={handleChange}
            error={validationErrors.name}
            required
            autoComplete="name"
            disabled={loading}
          />

          <Input
            id="email"
            name="email"
            type="email"
            label="E-mail"
            value={formData.email}
            onChange={handleChange}
            error={validationErrors.email}
            required
            autoComplete="email"
            disabled={loading}
          />

          <Input
            id="phone"
            name="phone"
            type="tel"
            label="Telefon (volitelné)"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
            disabled={loading}
            helpText="Telefon použijeme pro komunikaci ohledně objednávky"
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Heslo"
            value={formData.password}
            onChange={handleChange}
            error={validationErrors.password}
            required
            autoComplete="new-password"
            disabled={loading}
            helpText="Minimálně 6 znaků"
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Potvrzení hesla"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={validationErrors.confirmPassword}
            required
            autoComplete="new-password"
            disabled={loading}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrování..." : "Zaregistrovat se"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">
            Již máte účet?{" "}
            <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Přihlaste se
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
