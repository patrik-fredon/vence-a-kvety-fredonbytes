"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUpdatePassword } from "@/lib/auth/hooks";

export function ResetPasswordForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { updatePassword, loading, error } = useUpdatePassword();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!(formData as any)["password"]) {
      errors["password"] = "Heslo je povinné";
    } else if ((formData as any)["password"].length < 6) {
      errors["password"] = "Heslo musí mít alespoň 6 znaků";
    }

    if ((formData as any)["password"] !== (formData as any)["confirmPassword"]) {
      errors["confirmPassword"] = "Hesla se neshodují";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await updatePassword(formData);

    if (result.success) {
      router.push("/auth/signin?message=password-updated");
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
            <h2 className="text-3xl font-light text-stone-900 mb-2">Nové heslo</h2>
            <p className="text-stone-600">Zadejte své nové heslo</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="password"
              name="password"
              type="password"
              label="Nové heslo"
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
              loadingText="Ukládání..."
            >
              Uložit heslo
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
