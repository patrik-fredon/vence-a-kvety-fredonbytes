"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressBookProps {
  addresses: Address[];
  onAddressesChange: (addresses: Address[]) => void;
  locale: string;
  disabled?: boolean;
}

export function AddressBook({
  addresses,
  onAddressesChange,
  locale,
  disabled = false,
}: AddressBookProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      name: "",
      street: "",
      city: "",
      postalCode: "",
      country: "Česká republika",
      isDefault: addresses.length === 0,
    };
    onAddressesChange([...addresses, newAddress]);
    setEditingId(newAddress.id);
  };

  const updateAddress = (id: string, field: keyof Address, value: string | boolean) => {
    const updatedAddresses = addresses.map((addr) =>
      addr.id === id ? { ...addr, [field]: value } : addr
    );
    onAddressesChange(updatedAddresses);
  };

  const removeAddress = (id: string) => {
    const updatedAddresses = addresses.filter((addr) => addr.id !== id);
    // If we removed the default address, make the first remaining address default
    if (updatedAddresses.length > 0 && !updatedAddresses.some((addr) => addr.isDefault)) {
      updatedAddresses[0]!.isDefault = true;
    }
    onAddressesChange(updatedAddresses);
    setEditingId(null);
  };

  const setDefaultAddress = (id: string) => {
    const updatedAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    onAddressesChange(updatedAddresses);
  };

  const validateAddress = (address: Address): boolean => {
    return !!(address.name && address.street && address.city && address.postalCode);
  };

  const saveAddress = (id: string) => {
    const address = addresses.find((addr) => addr.id === id);
    if (address && validateAddress(address)) {
      setEditingId(null);
    }
  };

  const cancelEdit = (id: string) => {
    const address = addresses.find((addr) => addr.id === id);
    if (address && !validateAddress(address)) {
      // Remove incomplete address
      removeAddress(id);
    } else {
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-stone-900">
          {locale === "cs" ? "Dodací adresy" : "Delivery Addresses"}
        </h3>
        <Button
          type="button"
          variant="outline"
          onClick={addAddress}
          disabled={disabled}
          className="border-stone-300 text-stone-700 hover:bg-stone-50"
        >
          {locale === "cs" ? "Přidat adresu" : "Add Address"}
        </Button>
      </div>

      <div className="space-y-4">
        {addresses.map((address) => (
          <Card key={address.id} className="bg-stone-50 border-stone-200">
            <CardContent className="p-4">
              {editingId === address.id ? (
                // Edit mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={locale === "cs" ? "Název adresy" : "Address Name"}
                      value={address.name}
                      onChange={(e) => updateAddress(address.id, "name", e.target.value)}
                      placeholder={locale === "cs" ? "Domů, Práce, atd." : "Home, Work, etc."}
                      required
                    />

                    <Input
                      label={locale === "cs" ? "Země" : "Country"}
                      value={address.country}
                      onChange={(e) => updateAddress(address.id, "country", e.target.value)}
                      required
                    />

                    <div className="md:col-span-2">
                      <Input
                        label={locale === "cs" ? "Ulice a číslo popisné" : "Street Address"}
                        value={address.street}
                        onChange={(e) => updateAddress(address.id, "street", e.target.value)}
                        required
                      />
                    </div>

                    <Input
                      label={locale === "cs" ? "Město" : "City"}
                      value={address.city}
                      onChange={(e) => updateAddress(address.id, "city", e.target.value)}
                      required
                    />

                    <Input
                      label={locale === "cs" ? "PSČ" : "Postal Code"}
                      value={address.postalCode}
                      onChange={(e) => updateAddress(address.id, "postalCode", e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={address.isDefault}
                        onChange={() => setDefaultAddress(address.id)}
                        className="mr-2 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-stone-700">
                        {locale === "cs" ? "Výchozí adresa" : "Default Address"}
                      </span>
                    </label>

                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => cancelEdit(address.id)}
                        size="sm"
                      >
                        {locale === "cs" ? "Zrušit" : "Cancel"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => saveAddress(address.id)}
                        size="sm"
                        disabled={!validateAddress(address)}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        {locale === "cs" ? "Uložit" : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // View mode
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-stone-900">{address.name}</h4>
                        {address.isDefault && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            {locale === "cs" ? "Výchozí" : "Default"}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-stone-600">
                        <p>{address.street}</p>
                        <p>
                          {address.city}, {address.postalCode}
                        </p>
                        <p>{address.country}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingId(address.id)}
                        size="sm"
                        disabled={disabled}
                      >
                        {locale === "cs" ? "Upravit" : "Edit"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeAddress(address.id)}
                        size="sm"
                        disabled={disabled}
                        className="text-red-600 hover:text-red-700"
                      >
                        {locale === "cs" ? "Odstranit" : "Remove"}
                      </Button>
                    </div>
                  </div>

                  {!address.isDefault && addresses.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDefaultAddress(address.id)}
                        size="sm"
                        disabled={disabled}
                      >
                        {locale === "cs" ? "Nastavit jako výchozí" : "Set as Default"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {addresses.length === 0 && (
          <Card className="bg-stone-50 border-stone-200">
            <CardContent className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="mt-2 text-sm text-stone-500">
                {locale === "cs" ? "Žádné adresy nejsou uloženy" : "No addresses saved"}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {locale === "cs"
                  ? "Přidejte adresu pro rychlejší objednávání"
                  : "Add an address for faster checkout"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
