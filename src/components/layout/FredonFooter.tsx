"use client";
// components/FredonFooter.tsx
import { useTranslations } from "next-intl";
import Link from "next/link";
import FredonQuote from "./FredonQuote"; // Import the new component

const FredonFooter = () => {
  const t = useTranslations("footer"); // Uses the FredonFooter namespace
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* FredonBytes Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-amber-500 border-opacity-30"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-stone-900 px-4 text-amber-100 text-sm">
            <p className="text-sm text-amber-200">
              &copy; {currentYear} {t("companyName")}. {t("allRights")}
            </p>
          </span>
        </div>
      </div>

      {/* FredonBytes Footer Section */}
      <div className="mt-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <FredonQuote /> {/* Use the new component here */}
          <div className="flex space-x-6">
            <Link
              href="https://fredonbytes.com"
              className="text-sm text-amber-100 hover:text-amber-300 transition-colors duration-300 ease-in-out underline decoration-amber-100 hover:decoration-amber-300 inline-flex items-center group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("companyName")}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-4 h-4 ml-1 text-amber-100 group-hover:text-amber-300 transition-colors duration-300 ease-in-out transform group-hover:translate-x-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
            <Link
              href="https://tech.fredonbytes.com"
              className="text-sm text-amber-100 hover:text-amber-300 transition-colors duration-300 ease-in-out underline decoration-amber-100 hover:decoration-amber-300 inline-flex items-center group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("techSupport")}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-4 h-4 ml-1 text-amber-100 group-hover:text-amber-300 transition-colors duration-300 ease-in-out transform group-hover:translate-x-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      {/* FredonBytes Quote Section */}
      <div className="my-2 text-center"></div>
    </>
  );
};

export default FredonFooter;
