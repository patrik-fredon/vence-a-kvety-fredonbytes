'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { UserPreferences, defaultUserPreferences } from '@/types/user';

interface UserPreferencesProps {
  preferences: UserPreferences;
  onSave: (preferences: UserPreferences) => Promise<void>;
  loading?: boolean;
  locale: string;
}

export function UserPreferencesComponent({
  preferences: initialPreferences,
  onSave,
  loading = false,
  locale
}: UserPreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(
    initialPreferences || defaultUserPreferences
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPreferences(initialPreferences || defaultUserPreferences);
  }, [initialPreferences]);

  const handleChange = (section: keyof UserPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onSave(preferences);
    setHasChanges(false);
  };

  const handleReset = () => {
    setPreferences(initialPreferences || defaultUserPreferences);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Language & Currency */}
      <Card>
        <CardHeader>
          <CardTitle>
            {locale === 'cs' ? 'Jazyk a měna' : 'Language & Currency'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                {locale === 'cs' ? 'Jazyk' : 'Language'}
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handleChange('language', '', e.target.value as 'cs' | 'en')}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-stone-900"
                disabled={loading}
              >
                <option value="cs">Čeština</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                {locale === 'cs' ? 'Měna' : 'Currency'}
              </label>
              <select
                value={preferences.currency}
                onChange={(e) => handleChange('currency', '', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-stone-900"
                disabled={loading}
              >
                <option value="CZK">CZK (Česká koruna)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {locale === 'cs' ? 'Oznámení' : 'Notifications'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {locale === 'cs' ? 'E-mailová oznámení' : 'Email notifications'}
              </label>
              <p className="text-sm text-gray-500">
                {locale === 'cs'
                  ? 'Dostávat oznámení na e-mail'
                  : 'Receive notifications via email'
                }
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.email}
              onChange={(e) => handleChange('notifications', 'email', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {locale === 'cs' ? 'SMS oznámení' : 'SMS notifications'}
              </label>
              <p className="text-sm text-gray-500">
                {locale === 'cs'
                  ? 'Dostávat oznámení přes SMS'
                  : 'Receive notifications via SMS'
                }
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.sms}
              onChange={(e) => handleChange('notifications', 'sms', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {locale === 'cs' ? 'Aktualizace objednávek' : 'Order updates'}
              </label>
              <p className="text-sm text-gray-500">
                {locale === 'cs'
                  ? 'Oznámení o stavu objednávky'
                  : 'Notifications about order status'
                }
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.orderUpdates}
              onChange={(e) => handleChange('notifications', 'orderUpdates', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {locale === 'cs' ? 'Propagační nabídky' : 'Promotional offers'}
              </label>
              <p className="text-sm text-gray-500">
                {locale === 'cs'
                  ? 'Dostávat informace o slevách a akcích'
                  : 'Receive information about discounts and promotions'
                }
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.promotions}
              onChange={(e) => handleChange('notifications', 'promotions', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={loading}
            />
          </div>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {locale === 'cs' ? 'Soukromí' : 'Privacy'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {locale === 'cs' ? 'Sdílení dat' : 'Data sharing'}
              </label>
              <p className="text-sm text-gray-500">
                {locale === 'cs'
                  ? 'Povolit sdílení anonymních dat pro zlepšení služeb'
                  : 'Allow sharing anonymous data to improve services'
                }
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.privacy.shareData}
              onChange={(e) => handleChange('privacy', 'shareData', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {locale === 'cs' ? 'Analytika' : 'Analytics'}
              </label>
              <p className="text-sm text-gray-500">
                {locale === 'cs'
                  ? 'Povolit sledování pro analýzu používání webu'
                  : 'Allow tracking for website usage analysis'
                }
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.privacy.analytics}
              onChange={(e) => handleChange('privacy', 'analytics', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={loading}
            />
          </div>
        </div>
      </Card>

      {/* Delivery Preferences */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {locale === 'cs' ? 'Předvolby doručení' : 'Delivery Preferences'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'cs' ? 'Preferovaný čas doručení' : 'Preferred delivery time'}
            </label>
            <select
              value={preferences.delivery.preferredTimeSlot || 'morning'}
              onChange={(e) => handleChange('delivery', 'preferredTimeSlot', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            >
              <option value="morning">
                {locale === 'cs' ? 'Dopoledne (8:00 - 12:00)' : 'Morning (8:00 - 12:00)'}
              </option>
              <option value="afternoon">
                {locale === 'cs' ? 'Odpoledne (12:00 - 17:00)' : 'Afternoon (12:00 - 17:00)'}
              </option>
              <option value="evening">
                {locale === 'cs' ? 'Večer (17:00 - 20:00)' : 'Evening (17:00 - 20:00)'}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'cs' ? 'Speciální pokyny pro doručení' : 'Special delivery instructions'}
            </label>
            <textarea
              value={preferences.delivery.specialInstructions || ''}
              onChange={(e) => handleChange('delivery', 'specialInstructions', e.target.value)}
              placeholder={locale === 'cs'
                ? 'Např. "Zazvonit u sousedů", "Nechat u vchodu", atd.'
                : 'E.g. "Ring the neighbors", "Leave at entrance", etc.'
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={loading || !hasChanges}
        >
          {locale === 'cs' ? 'Zrušit změny' : 'Reset Changes'}
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={loading || !hasChanges}
        >
          {loading
            ? (locale === 'cs' ? 'Ukládání...' : 'Saving...')
            : (locale === 'cs' ? 'Uložit nastavení' : 'Save Settings')
          }
        </Button>
      </div>
    </div>
  );
}
