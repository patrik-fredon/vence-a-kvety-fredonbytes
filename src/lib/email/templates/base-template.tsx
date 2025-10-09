/**
 * Base email template with funeral-appropriate styling (teal/amber)
 * Responsive layout for mobile and desktop with localization support
 */

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Link,
  Img,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface BaseTemplateProps {
  children: React.ReactNode;
  locale?: 'cs' | 'en';
  title?: string;
  previewText?: string;
}

export function BaseTemplate({ 
  children, 
  locale = 'cs', 
  title,
  previewText 
}: BaseTemplateProps) {
  const isCs = locale === 'cs';

  return (
    <Html lang={locale}>
      <Head>
        <title>{title || (isCs ? 'Pohřební věnce' : 'Funeral Wreaths')}</title>
        {previewText && (
          <meta name="description" content={previewText} />
        )}
      </Head>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                // Funeral-appropriate teal/amber palette
                primary: {
                  50: '#f0fdfa',
                  100: '#ccfbf1',
                  200: '#99f6e4',
                  300: '#5eead4',
                  400: '#2dd4bf',
                  500: '#14b8a6', // Main teal
                  600: '#0d9488',
                  700: '#0f766e',
                  800: '#115e59',
                  900: '#134e4a',
                },
                accent: {
                  50: '#fffbeb',
                  100: '#fef3c7',
                  200: '#fde68a',
                  300: '#fcd34d',
                  400: '#fbbf24',
                  500: '#f59e0b', // Main amber
                  600: '#d97706',
                  700: '#b45309',
                  800: '#92400e',
                  900: '#78350f',
                },
                neutral: {
                  50: '#fafafa',
                  100: '#f5f5f5',
                  200: '#e5e5e5',
                  300: '#d4d4d4',
                  400: '#a3a3a3',
                  500: '#737373',
                  600: '#525252',
                  700: '#404040',
                  800: '#262626',
                  900: '#171717',
                },
              },
            },
          },
        }}
      >
        <Body className="bg-neutral-50 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-2xl">
            {/* Header */}
            <Section className="bg-primary-700 text-white rounded-t-lg p-6 text-center">
              <Heading className="text-2xl font-bold m-0 mb-2">
                🌹 {isCs ? 'Pohřební věnce' : 'Funeral Wreaths'}
              </Heading>
              <Text className="text-primary-100 m-0 text-sm">
                {isCs ? 'Ketingmar s.r.o.' : 'Ketingmar Ltd.'}
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="bg-white p-6 border-l border-r border-neutral-200">
              {children}
            </Section>

            {/* Footer */}
            <Section className="bg-neutral-100 rounded-b-lg p-6 text-center border border-t-0 border-neutral-200">
              <Text className="text-neutral-600 text-sm m-0 mb-4">
                <strong>{isCs ? 'Kontaktní informace' : 'Contact Information'}</strong>
              </Text>
              
              <Text className="text-neutral-600 text-sm m-0 mb-2">
                📧 <Link 
                  href="mailto:info@pohrebni-vence.cz" 
                  className="text-primary-600 no-underline"
                >
                  info@pohrebni-vence.cz
                </Link>
              </Text>
              
              <Text className="text-neutral-600 text-sm m-0 mb-2">
                📞 <Link 
                  href="tel:+420123456789" 
                  className="text-primary-600 no-underline"
                >
                  +420 123 456 789
                </Link>
              </Text>
              
              <Text className="text-neutral-600 text-sm m-0 mb-4">
                📍 {isCs ? 'Hlavní 123, 110 00 Praha 1' : 'Main St. 123, 110 00 Prague 1'}
              </Text>

              <Hr className="border-neutral-300 my-4" />
              
              <Text className="text-neutral-500 text-xs m-0 mb-2">
                {isCs ? 'Otevírací doba' : 'Opening Hours'}:<br />
                {isCs ? 'Po-Pá: 8:00-17:00, So: 9:00-14:00' : 'Mon-Fri: 8:00-17:00, Sat: 9:00-14:00'}
              </Text>
              
              <Text className="text-neutral-400 text-xs m-0">
                © 2024 {isCs ? 'Pohřební věnce - Ketingmar s.r.o.' : 'Funeral Wreaths - Ketingmar Ltd.'}<br />
                {isCs ? 'Všechna práva vyhrazena.' : 'All rights reserved.'}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// Utility components for consistent styling
export function EmailHeading({ 
  children, 
  level = 2,
  className = '' 
}: { 
  children: React.ReactNode; 
  level?: 1 | 2 | 3;
  className?: string;
}) {
  const baseClasses = 'font-bold text-neutral-800 mt-0 mb-4';
  const sizeClasses = {
    1: 'text-2xl',
    2: 'text-xl',
    3: 'text-lg',
  };

  return (
    <Heading className={`${baseClasses} ${sizeClasses[level]} ${className}`}>
      {children}
    </Heading>
  );
}

export function EmailText({ 
  children, 
  className = '',
  variant = 'body'
}: { 
  children: React.ReactNode; 
  className?: string;
  variant?: 'body' | 'small' | 'caption';
}) {
  const variantClasses = {
    body: 'text-base text-neutral-700',
    small: 'text-sm text-neutral-600',
    caption: 'text-xs text-neutral-500',
  };

  return (
    <Text className={`${variantClasses[variant]} leading-relaxed mb-4 ${className}`}>
      {children}
    </Text>
  );
}

export function EmailSection({ 
  children, 
  className = '',
  background = 'white'
}: { 
  children: React.ReactNode; 
  className?: string;
  background?: 'white' | 'gray' | 'accent';
}) {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-neutral-50',
    accent: 'bg-accent-50 border-l-4 border-accent-400',
  };

  return (
    <Section className={`${backgroundClasses[background]} p-4 rounded-lg mb-4 ${className}`}>
      {children}
    </Section>
  );
}

export function EmailButton({ 
  href, 
  children,
  variant = 'primary'
}: { 
  href: string; 
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300',
  };

  return (
    <Link
      href={href}
      className={`${variantClasses[variant]} px-6 py-3 rounded-lg text-center font-medium no-underline inline-block transition-colors`}
    >
      {children}
    </Link>
  );
}

export function EmailDivider({ className = '' }: { className?: string }) {
  return <Hr className={`border-neutral-200 my-6 ${className}`} />;
}

// Order item component for consistent formatting
export function OrderItem({ 
  name, 
  quantity, 
  price, 
  customizations,
  locale = 'cs'
}: {
  name: string;
  quantity: number;
  price: number;
  customizations?: Array<{ optionName: string; value: string }>;
  locale?: 'cs' | 'en';
}) {
  const isCs = locale === 'cs';

  return (
    <Section className="border-b border-neutral-200 pb-4 mb-4 last:border-b-0 last:mb-0">
      <Text className="font-semibold text-neutral-800 m-0 mb-2">
        {name}
      </Text>
      
      <Text className="text-sm text-neutral-600 m-0 mb-1">
        {isCs ? 'Množství' : 'Quantity'}: <strong>{quantity}</strong>
      </Text>
      
      <Text className="text-sm text-neutral-600 m-0 mb-2">
        {isCs ? 'Cena' : 'Price'}: <strong>{price.toLocaleString('cs-CZ')} Kč</strong>
      </Text>

      {customizations && customizations.length > 0 && (
        <Section className="bg-neutral-50 p-3 rounded mt-2">
          <Text className="text-xs font-medium text-neutral-700 m-0 mb-2">
            {isCs ? 'Přizpůsobení' : 'Customizations'}:
          </Text>
          {customizations.map((custom, index) => (
            <Text key={index} className="text-xs text-neutral-600 m-0 mb-1">
              • {custom.optionName}: <strong>{custom.value}</strong>
            </Text>
          ))}
        </Section>
      )}
    </Section>
  );
}

// Price summary component
export function PriceSummary({
  subtotal,
  deliveryCost,
  totalAmount,
  currency = 'Kč',
  locale = 'cs'
}: {
  subtotal: number;
  deliveryCost: number;
  totalAmount: number;
  currency?: string;
  locale?: 'cs' | 'en';
}) {
  const isCs = locale === 'cs';

  return (
    <EmailSection background="gray" className="border border-neutral-200">
      <EmailHeading level={3}>
        {isCs ? 'Shrnutí ceny' : 'Price Summary'}
      </EmailHeading>
      
      <Section className="space-y-2">
        <Text className="flex justify-between text-sm text-neutral-600 m-0 mb-2">
          <span>{isCs ? 'Mezisoučet' : 'Subtotal'}:</span>
          <span>{subtotal.toLocaleString('cs-CZ')} {currency}</span>
        </Text>
        
        <Text className="flex justify-between text-sm text-neutral-600 m-0 mb-2">
          <span>{isCs ? 'Doručení' : 'Delivery'}:</span>
          <span>{deliveryCost.toLocaleString('cs-CZ')} {currency}</span>
        </Text>
        
        <Hr className="border-neutral-300 my-2" />
        
        <Text className="flex justify-between text-lg font-bold text-neutral-800 m-0">
          <span>{isCs ? 'Celkem' : 'Total'}:</span>
          <span>{totalAmount.toLocaleString('cs-CZ')} {currency}</span>
        </Text>
      </Section>
    </EmailSection>
  );
}