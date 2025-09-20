'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ContactFormData, ContactFormErrors, ContactFormResponse } from '@/types/contact';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SuccessModal } from './SuccessModal';
import { cn } from '@/lib/utils';

interface ContactFormProps {
  locale: string;
}

export function ContactForm({ locale }: ContactFormProps) {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: ContactFormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = locale === 'cs' ? 'Jméno je povinné' : 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = locale === 'cs' ? 'Jméno musí mít alespoň 2 znaky' : 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = locale === 'cs' ? 'E-mail je povinný' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = locale === 'cs' ? 'E-mail není ve správném formátu' : 'Invalid email format';
    }

    // Phone validation (optional)
    if (formData.phone && formData.phone.trim() && !/^(\+420)?[0-9\s\-()]{9,}$/.test(formData.phone.trim())) {
      newErrors.phone = locale === 'cs' ? 'Telefon není ve správném formátu' : 'Invalid phone format';
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = locale === 'cs' ? 'Předmět je povinný' : 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = locale === 'cs' ? 'Předmět musí mít alespoň 3 znaky' : 'Subject must be at least 3 characters';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = locale === 'cs' ? 'Zpráva je povinná' : 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = locale === 'cs' ? 'Zpráva musí mít alespoň 10 znaků' : 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = locale === 'cs' ? 'Zpráva může mít maximálně 2000 znaků' : 'Message can have maximum 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ContactFormResponse = await response.json();

      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        setErrors({});
        setShowSuccessModal(true);
      } else {
        setSubmitError(result.message || (locale === 'cs' ? 'Došlo k chybě při odesílání zprávy' : 'An error occurred while sending the message'));
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitError(locale === 'cs' ? 'Došlo k neočekávané chybě. Zkuste to prosím později.' : 'An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectOptions = locale === 'cs' ? [
    { value: '', label: 'Vyberte předmět zprávy' },
    { value: 'Dotaz na pohřební věnce', label: 'Dotaz na pohřební věnce' },
    { value: 'Objednávka věnce', label: 'Objednávka věnce' },
    { value: 'Individuální požadavek', label: 'Individuální požadavek' },
    { value: 'Dodání a doručení', label: 'Dodání a doručení' },
    { value: 'Reklamace', label: 'Reklamace' },
    { value: 'Platba a fakturace', label: 'Platba a fakturace' },
    { value: 'Jiné', label: 'Jiné' },
  ] : [
    { value: '', label: 'Select message subject' },
    { value: 'Funeral wreaths inquiry', label: 'Funeral wreaths inquiry' },
    { value: 'Wreath order', label: 'Wreath order' },
    { value: 'Individual request', label: 'Individual request' },
    { value: 'Delivery and shipping', label: 'Delivery and shipping' },
    { value: 'Complaint', label: 'Complaint' },
    { value: 'Payment and billing', label: 'Payment and billing' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-stone-900">
            {locale === 'cs' ? 'Kontaktní formulář' : 'Contact Form'}
          </CardTitle>
          <p className="text-center text-stone-600 text-sm">
            {locale === 'cs'
              ? 'Napište nám a my se vám ozveme co nejdříve. Jsme tu pro vás v těžkých chvílích.'
              : 'Write to us and we will get back to you as soon as possible. We are here for you in difficult times.'
            }
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <Input
              label={locale === 'cs' ? 'Jméno a příjmení' : 'Full Name'}
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={locale === 'cs' ? 'Zadejte své jméno a příjmení' : 'Enter your full name'}
              disabled={isSubmitting}
              error={errors.name}
              required
            />

            {/* Email Field */}
            <Input
              label={locale === 'cs' ? 'E-mailová adresa' : 'Email Address'}
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={locale === 'cs' ? 'vas.email@example.com' : 'your.email@example.com'}
              disabled={isSubmitting}
              error={errors.email}
              required
            />

            {/* Phone Field */}
            <Input
              label={locale === 'cs' ? 'Telefon (volitelné)' : 'Phone (optional)'}
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={locale === 'cs' ? '+420 123 456 789' : '+420 123 456 789'}
              disabled={isSubmitting}
              error={errors.phone}
            />

            {/* Subject Field */}
            <div className="space-y-1">
              <label htmlFor="subject" className="block text-sm font-medium text-stone-700">
                {locale === 'cs' ? 'Předmět' : 'Subject'}
                <span className="text-error-500 ml-1" aria-label="required">*</span>
              </label>
              <select
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className={cn(
                  'block w-full rounded-md border border-stone-300 px-3 py-2',
                  'text-stone-900 placeholder-stone-500 bg-white',
                  'focus:border-stone-500 focus:ring-2 focus:ring-stone-500/20 focus:outline-none',
                  'disabled:bg-stone-50 disabled:text-stone-500 disabled:cursor-not-allowed disabled:border-stone-200',
                  'transition-all duration-200 ease-in-out',
                  'shadow-sm focus:shadow-md',
                  'font-normal text-sm leading-normal',
                  errors.subject && 'border-error-500 focus:border-error-500 focus:ring-error-500/20 bg-error-50/30'
                )}
                disabled={isSubmitting}
                aria-invalid={errors.subject ? 'true' : 'false'}
                aria-describedby={errors.subject ? 'subject-error' : undefined}
                required
              >
                {subjectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p id="subject-error" className="text-sm text-error-600 font-medium" role="alert">
                  {errors.subject}
                </p>
              )}
            </div>

            {/* Message Field */}
            <div className="space-y-1">
              <label htmlFor="message" className="block text-sm font-medium text-stone-700">
                {locale === 'cs' ? 'Zpráva' : 'Message'}
                <span className="text-error-500 ml-1" aria-label="required">*</span>
              </label>
              <textarea
                id="message"
                rows={6}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className={cn(
                  'block w-full rounded-md border border-stone-300 px-3 py-2',
                  'text-stone-900 placeholder-stone-500 bg-white',
                  'focus:border-stone-500 focus:ring-2 focus:ring-stone-500/20 focus:outline-none',
                  'disabled:bg-stone-50 disabled:text-stone-500 disabled:cursor-not-allowed disabled:border-stone-200',
                  'transition-all duration-200 ease-in-out',
                  'shadow-sm focus:shadow-md',
                  'font-normal text-sm leading-normal resize-vertical',
                  errors.message && 'border-error-500 focus:border-error-500 focus:ring-error-500/20 bg-error-50/30'
                )}
                placeholder={locale === 'cs' ? 'Napište nám svou zprávu...' : 'Write your message...'}
                disabled={isSubmitting}
                aria-invalid={errors.message ? 'true' : 'false'}
                aria-describedby={cn(
                  errors.message ? 'message-error' : undefined,
                  'message-help'
                ).trim() || undefined}
                required
              />
              <div className="flex justify-between items-center mt-1">
                {errors.message ? (
                  <p id="message-error" className="text-sm text-error-600 font-medium" role="alert">
                    {errors.message}
                  </p>
                ) : (
                  <p id="message-help" className="text-sm text-stone-600">
                    {locale === 'cs'
                      ? 'Minimálně 10 znaků, maximálně 2000 znaků'
                      : 'Minimum 10 characters, maximum 2000 characters'
                    }
                  </p>
                )}
                <p className="text-sm text-stone-400">
                  {formData.message.length}/2000
                </p>
              </div>
            </div>

            {/* Submit Error */}
            {submitError && (
              <Card variant="outlined" className="border-error-200 bg-error-50">
                <CardContent className="p-4">
                  <p className="text-error-700 text-sm font-medium">{submitError}</p>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting
                  ? (locale === 'cs' ? 'Odesílání...' : 'Sending...')
                  : (locale === 'cs' ? 'Odeslat zprávu' : 'Send Message')
                }
              </Button>
            </div>

            {/* Required Fields Note */}
            <p className="text-sm text-stone-500 text-center">
              {locale === 'cs' ? '* Povinná pole' : '* Required fields'}
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        customerName={formData.name}
        locale={locale}
      />
    </>
  );
}
