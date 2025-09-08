'use client';

import { useDate, useLocaleUtils } from '@/lib/i18n/hooks';

interface DateDisplayProps {
  date: Date;
  className?: string;
  format?: 'default' | 'delivery';
}

/**
 * Component for displaying dates with proper locale formatting
 */
export function DateDisplay({ date, className, format = 'default' }: DateDisplayProps) {
  const { format: formatDate, formatDelivery } = useDate();

  const formattedDate = format === 'delivery' ? formatDelivery(date) : formatDate(date);

  return (
    <span className={className} suppressHydrationWarning>
      {formattedDate}
    </span>
  );
}

/**
 * Component for displaying relative time
 */
interface RelativeTimeProps {
  date: Date;
  className?: string;
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const { locale } = useLocaleUtils();

  // Simple relative time calculation
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  let relativeText = '';

  if (Math.abs(diffInDays) >= 1) {
    relativeText = locale === 'cs'
      ? `${diffInDays > 0 ? 'za' : 'před'} ${Math.abs(diffInDays)} ${Math.abs(diffInDays) === 1 ? 'den' : 'dny'}`
      : `${Math.abs(diffInDays)} day${Math.abs(diffInDays) === 1 ? '' : 's'} ${diffInDays > 0 ? 'from now' : 'ago'}`;
  } else if (Math.abs(diffInHours) >= 1) {
    relativeText = locale === 'cs'
      ? `${diffInHours > 0 ? 'za' : 'před'} ${Math.abs(diffInHours)} ${Math.abs(diffInHours) === 1 ? 'hodinu' : 'hodin'}`
      : `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) === 1 ? '' : 's'} ${diffInHours > 0 ? 'from now' : 'ago'}`;
  } else if (Math.abs(diffInMinutes) >= 1) {
    relativeText = locale === 'cs'
      ? `${diffInMinutes > 0 ? 'za' : 'před'} ${Math.abs(diffInMinutes)} ${Math.abs(diffInMinutes) === 1 ? 'minutu' : 'minut'}`
      : `${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) === 1 ? '' : 's'} ${diffInMinutes > 0 ? 'from now' : 'ago'}`;
  } else {
    relativeText = locale === 'cs' ? 'právě teď' : 'just now';
  }

  return (
    <span className={className} suppressHydrationWarning>
      {relativeText}
    </span>
  );
}
