import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "./config";

export default getRequestConfig(async ({ locale }) => {
  // Debug logging to understand locale resolution
  console.log('[i18n] Incoming locale:', locale);

  // Validate that the incoming `locale` parameter is valid
  const validLocale = locale && locales.includes(locale as any) ? locale : defaultLocale;

  console.log('[i18n] Valid locale resolved to:', validLocale);
  console.log('[i18n] Loading messages from:', `../../messages/${validLocale}.json`);

  return {
    locale: validLocale,
    messages: (await import(`../../messages/${validLocale}.json`)).default,
  };
});
