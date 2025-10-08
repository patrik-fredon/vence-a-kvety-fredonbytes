import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="cs">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900">404</h1>
            <p className="mt-4 text-xl text-gray-600">Stránka nebyla nalezena</p>
            <p className="mt-2 text-gray-500">
              Omlouváme se, ale stránka, kterou hledáte, neexistuje.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block rounded-lg bg-teal-600 px-6 py-3 text-white hover:bg-teal-700"
            >
              Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
