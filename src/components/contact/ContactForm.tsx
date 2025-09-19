'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ContactFormData, ContactFormErrors, ContactFormResponse } from '@/types/contact';
import { Button } from '@/components/ui/Button';
import { SuccessModal } from './SuccessModal';

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
      newErrors.name = 'Jméno je povinné';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Jméno musí mít alespoň 2 znaky';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail je povinný';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail není ve správném formátu';
    }

    // Phone validation (optional)
    if (formData.phone && formData.phone.trim() && !/^(\+420)?[0-9\s\-()]{9,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Telefon není ve správném formátu';
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Předmět je povinný';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Předmět musí mít alespoň 3 znaky';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Zpráva je povinná';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Zpráva musí mít alespoň 10 znaků';
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = 'Zpráva může mít maximálně 2000 znaků';
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
        setSubmitError(result.message || 'Došlo k chybě při odesílání zprávy');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitError('Došlo k neočekávané chybě. Zkuste to prosím později.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
            Jméno a příjmení *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.name ? 'border-red-500' : 'border-neutral-300'
              }`}
            placeholder="Zadejte své jméno a příjmení"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
            E-mailová adresa *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.email ? 'border-red-500' : 'border-neutral-300'
              }`}
            placeholder="vas.email@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
            Telefon (volitelné)
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.phone ? 'border-red-500' : 'border-neutral-300'
              }`}
            placeholder="+420 123 456 789"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Subject Field */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2">
            Předmět *
          </label>
          <select
            id="subject"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.subject ? 'border-red-500' : 'border-neutral-300'
              }`}
            disabled={isSubmitting}
          >
            <option value="">Vyberte předmět zprávy</option>
            <option value="Dotaz na pohřební věnce">Dotaz na pohřební věnce</option>
            <option value="Objednávka věnce">Objednávka věnce</option>
            <option value="Individuální požadavek">Individuální požadavek</option>
            <option value="Dodání a doručení">Dodání a doručení</option>
            <option value="Reklamace">Reklamace</option>
            <option value="Platba a fakturace">Platba a fakturace</option>
            <option value="Jiné">Jiné</option>
          </select>
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
            Zpráva *
          </label>
          <textarea
            id="message"
            rows={6}
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-vertical ${errors.message ? 'border-red-500' : 'border-neutral-300'
              }`}
            placeholder="Napište nám svou zprávu..."
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.message ? (
              <p className="text-sm text-red-600">{errors.message}</p>
            ) : (
              <p className="text-sm text-neutral-500">
                Minimálně 10 znaků, maximálně 2000 znaků
              </p>
            )}
            <p className="text-sm text-neutral-400">
              {formData.message.length}/2000
            </p>
          </div>
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Odesílání...' : 'Odeslat zprávu'}
          </Button>
        </div>

        {/* Required Fields Note */}
        <p className="text-sm text-neutral-500 text-center">
          * Povinná pole
        </p>
      </form>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        customerName={formData.name}
      />
    </>
  );
}
