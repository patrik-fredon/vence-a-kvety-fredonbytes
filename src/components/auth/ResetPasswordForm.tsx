'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUpdatePassword } from '@/lib/auth/hooks'

export function ResetPasswordForm() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const { updatePassword, loading, error } = useUpdatePassword()

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.password) {
      errors.password = 'Heslo je povinné'
    } else if (formData.password.length < 6) {
      errors.password = 'Heslo musí mít alespoň 6 znaků'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Hesla se neshodují'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const result = await updatePassword(formData)

    if (result.success) {
      router.push('/auth/signin?message=password-updated')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))

    // Clear validation error when user starts typing
    if (validationErrors[e.target.name]) {
      setValidationErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }))
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white py-8 px-6 shadow rounded-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Nové heslo
          </h2>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Zadejte své nové heslo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="password"
            name="password"
            type="password"
            label="Nové heslo"
            value={formData.password}
            onChange={handleChange}
            error={validationErrors.password}
            required
            autoComplete="new-password"
            disabled={loading}
            helperText="Minimálně 6 znaků"
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

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Ukládání...' : 'Uložit heslo'}
          </Button>
        </form>
      </div>
    </div>
  )
}
