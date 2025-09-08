import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ověřte svůj e-mail
            </h2>
            <p className="text-gray-600 mb-6">
              Registrace byla úspěšná! Odeslali jsme vám ověřovací e-mail.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Zkontrolujte svou e-mailovou schránku a klikněte na odkaz
              pro dokončení registrace.
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Přejít na přihlášení
              </Link>
              <Link
                href="/"
                className="block text-indigo-600 hover:text-indigo-500"
              >
                Zpět na hlavní stránku
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Ověření e-mailu | Pohřební věnce',
  description: 'Ověřte svůj e-mail pro dokončení registrace',
}
