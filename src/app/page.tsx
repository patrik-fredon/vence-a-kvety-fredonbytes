import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

export default function RootPage() {
  // This should be handled by middleware, but as a fallback
  redirect(`/${defaultLocale}`);
}
