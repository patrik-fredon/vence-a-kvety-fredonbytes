import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-funeral-gold rounded-lg shadow-sm border border-stone-200 p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 border border-blue-200 mb-6">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-label="Email verification icon"
                role="img"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-light text-stone-900 mb-4">Ověřte svůj e-mail</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">
              Registrace byla úspěšná! Odeslali jsme vám ověřovací e-mail.
            </p>
            <p className="text-sm text-stone-500 mb-8 leading-relaxed">
              Zkontrolujte svou e-mailovou schránku a klikněte na odkaz pro dokončení registrace.
            </p>
            <div className="space-y-4">
              <Link
                href="/auth/signin"
                className="block w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Přejít na přihlášení
              </Link>
              <Link
                href="/"
                className="block text-stone-600 hover:text-amber-600 transition-colors duration-200"
              >
                Zpět na hlavní stránku
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Ověření e-mailu | Pohřební věnce",
  description: "Ověřte svůj e-mail pro dokončení registrace",
};
