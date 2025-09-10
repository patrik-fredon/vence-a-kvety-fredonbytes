'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Address } from '@/types/user';

interface AddressBookProps {
  addresses: Address[];
  onSave: (addresses: Address[]) => Promise<void>;
  loading?: boolean;
  locale: string;
}

interface AddressFormData {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

const defaultAddress: AddressFormData = {
  name: '',
  street: '',
  city: '',
  postalCode: '',
  country: 'Česká republika',
};

export function AddressBook({ addresses, onSave, loading = false, locale }: AddressBookProps) {
  const [localAddresses, setLocalAddresses] = useState<Address[]>(addresses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(defaultAddress);
  const [errors, setErrors] = useState<Partial<AddressFormData>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const validateAddress = (data: AddressFormData): Partial<AddressFormData> => {
    const errors: Partial<AddressFormData> = {};

    if (!data.name.trim()) {
      errors.name = locale === 'cs' ? 'Název adresy je povinný' : 'Address name is required';
    }

    if (!data.street.trim()) {
      errors.street = locale === 'cs' ? 'Ulice je povinná' : 'Street is required';
    }

    if (!data.city.trim()) {
      errors.city = locale === 'cs' ? 'Město je povinné' : 'City is required';
    }

    if (!data.postalCode.trim()) {
      errors.postalCode = locale === 'cs' ? 'PSČ je povinné' : 'Postal code is required';
    } else if (!/^\d{3}\s?\d{2}$/.test(data.postalCode.trim())) {
      errors.postalCode = locale === 'cs' ? 'Neplatné PSČ (formát: 12345 nebo 123 45)' : 'Invalid postal code (format: 12345 or 123 45)';
    }

    if (!data.country.trim()) {
      errors.country = locale === 'cs' ? 'Země je povinná' : 'Country is required';
    }

    return errors;
  };

  const handleInputChange = (field: keyof AddressFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const startEditing = (address?: Address) => {
    if (address) {
      setFormData({
        name: address.name,
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country,
      });
      setEditingId(address.id);
    } else {
      setFormData(defaultAddress);
      setEditingId('new');
    }
    setErrors({});
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData(defaultAddress);
    setErrors({});
  };

  const saveAddress = () => {
    const validationErrors = validateAddress(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const normalizedPostalCode = formData.postalCode.replace(/\s/g, '');
    const formattedPostalCode = `${normalizedPostalCode.slice(0, 3)} ${normalizedPostalCode.slice(3)}`;

    if (editingId === 'new') {
      // Add new address
      const newAddress: Address = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        postalCode: formattedPostalCode,
        country: formData.country.trim(),
        isDefault: localAddresses.length === 0,
      };
      setLocalAddresses(prev => [...prev, newAddress]);
    } else {
      // Update existing address
      setLocalAddresses(prev => prev.map(addr =>
        addr.id === editingId
          ? {
              ...addr,
              name: formData.name.trim(),
              street: formData.street.trim(),
              city: formData.city.trim(),
              postalCode: formattedPostalCode,
              country: formData.country.trim(),
            }
          : addr
      ));
    }

    setHasChanges(true);
    cancelEditing();
  };

  const removeAddress = (id: string) => {
    const addressToRemove = localAddresses.find(addr => addr.id === id);
    const updatedAddresses = localAddresses.filter(addr => addr.id !== id);

    // If we're removing the default address and there are other addresses, make the first one default
    if (addressToRemove?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    setLocalAddresses(updatedAddresses);
    setHasChanges(true);
  };

  const setDefaultAddress = (id: string) => {
    setLocalAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onSave(localAddresses);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalAddresses(addresses);
    setHasChanges(false);
    cancelEditing();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {locale === 'cs' ? 'Adresář' : 'Address Book'}
        </h3>
        {!editingId && (
          <Button
            type="button"
            variant="outline"
            onClick={() => startEditing()}
            disabled={loading}
          >
            {locale === 'cs' ? 'Přidat adresu' : 'Add Address'}
          </Button>
        )}
      </div>

      {/* Address Form */}
      {editingId && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {editingId === 'new' 
              ? (locale === 'cs' ? 'Nová adresa' : 'New Address')
              : (locale === 'cs' ? 'Upravit adresu' : 'Edit Address')
            }
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label={locale === 'cs' ? 'Název adresy' : 'Address Name'}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                placeholder={locale === 'cs' ? 'Domů, Práce, atd.' : 'Home, Work, etc.'}
                disabled={loading}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label={locale === 'cs' ? 'Ulice a číslo popisné' : 'Street Address'}
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                error={errors.street}
                placeholder={locale === 'cs' ? 'Např. Václavské náměstí 1' : 'E.g. Main Street 123'}
                disabled={loading}
                required
              />
            </div>

            <Input
              label={locale === 'cs' ? 'Město' : 'City'}
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              error={errors.city}
              placeholder={locale === 'cs' ? 'Praha' : 'Prague'}
              disabled={loading}
              required
            />

            <Input
              label={locale === 'cs' ? 'PSČ' : 'Postal Code'}
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              error={errors.postalCode}
              placeholder="123 45"
              disabled={loading}
              required
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'cs' ? 'Země' : 'Country'}
              </label>
              <select
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.country ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
                required
              >
                <option value="Česká republika">Česká republika</option>
                <option value="Slovensko">Slovensko</option>
                <option value="Rakousko">Rakousko</option>
                <option value="Německo">Německo</option>
              </select>
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={cancelEditing}
              disabled={loading}
            >
              {locale === 'cs' ? 'Zrušit' : 'Cancel'}
            </Button>
            <Button
              type="button"
              onClick={saveAddress}
              disabled={loading}
            >
              {locale === 'cs' ? 'Uložit' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {/* Address List */}
      <div className="space-y-4">
        {localAddresses.map((address) => (
          <div key={address.id} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium text-gray-900">{address.name}</h4>
                  {address.isDefault && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {locale === 'cs' ? 'Výchozí' : 'Default'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {address.street}<br />
                  {address.city}, {address.postalCode}<br />
                  {address.country}
                </p>
              </div>
              
              <div className="flex space-x-2">
                {!address.isDefault && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDefaultAddress(address.id)}
                    disabled={loading || editingId !== null}
                  >
                    {locale === 'cs' ? 'Nastavit jako výchozí' : 'Set as Default'}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => startEditing(address)}
                  disabled={loading || editingId !== null}
                >
                  {locale === 'cs' ? 'Upravit' : 'Edit'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeAddress(address.id)}
                  disabled={loading || editingId !== null}
                  className="text-red-600 hover:text-red-700"
                >
                  {locale === 'cs' ? 'Odstranit' : 'Remove'}
                </Button>
              </div>
            </div>
          </div>
        ))}

        {localAddresses.length === 0 && !editingId && (
          <div className="text-center py-8 text-gray-500">
            <p>{locale === 'cs' ? 'Žádné adresy nejsou uloženy' : 'No addresses saved'}</p>
          </div>
        )}
      </div>

      {/* Save Changes */}
      {hasChanges && !editingId && (
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={loading}
          >
            {locale === 'cs' ? 'Zrušit změny' : 'Reset Changes'}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
          >
            {loading 
              ? (locale === 'cs' ? 'Ukládání...' : 'Saving...') 
              : (locale === 'cs' ? 'Uložit změny' : 'Save Changes')
            }
          </Button>
        </div>
      )}
    </div>
  );
}