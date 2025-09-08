import { Suspense } from 'react'
import { SignInForm } from '@/components/auth/SignInForm'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Přihlášení | Pohřební věnce',
  description: 'Přihlaste se do svého účtu',
}
