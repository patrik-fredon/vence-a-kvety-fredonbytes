import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <ForgotPasswordForm />
    </div>
  )
}

export const metadata = {
  title: 'Zapomenuté heslo | Pohřební věnce',
  description: 'Obnovte si heslo k účtu',
}
