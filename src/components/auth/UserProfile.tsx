"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth, useUpdateProfile, useSignOut } from "@/lib/auth/hooks";
import { OrderHistory } from "@/components/order/OrderHistory";
import { AddressBook } from "@/components/auth/AddressBook";
import { useParams } from "next/navigation";

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface UserPreferences {
  language: "cs" | "en";
  emailNotifications: {
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
  smsNotifications: {
    orderUpdates: boolean;
    deliveryReminders: boolean;
  };
  privacy: {
    shareDataForMarketing: boolean;
    allowAnalytics: boolean;
  };
}
=======
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth, useUpdateProfile, useSignOut } from '@/lib/auth/hooks'
import { OrderHistory } from '@/components/order/OrderHistory'
import { UserPreferencesComponent } from './UserPreferences'
import { AddressBook } from './AddressBook'
import { useParams } from 'next/navigation'
import { Address, UserPreferences, defaultUserPreferences } from '@/types/user'
>>>>>>> db25158 (Enhance user profile with address book and preferences management)

export function UserProfile() {
  const { user } = useAuth();
  const { updateProfile, loading: updateLoading, error: updateError } = useUpdateProfile();
  const { signOut, loading: signOutLoading } = useSignOut();
  const params = useParams();
  const locale = (params?.locale as string) || "cs";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

<<<<<<< HEAD
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: "cs",
    emailNotifications: {
      orderUpdates: true,
      promotions: false,
      newsletter: false,
    },
    smsNotifications: {
      orderUpdates: true,
      deliveryReminders: true,
    },
    privacy: {
      shareDataForMarketing: false,
      allowAnalytics: true,
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses" | "preferences">(
    "profile"
  );
=======
  const [addresses, setAddresses] = useState<Address[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>(defaultUserPreferences)
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'preferences'>('profile')
>>>>>>> db25158 (Enhance user profile with address book and preferences management)

  useEffect(() => {
    if (user) {
      setFormData({
<<<<<<< HEAD
        name: user.name || "",
        phone: user.phone || "",
      });

      // Load user preferences and addresses from profile
      loadUserProfile();
=======
        name: user.name || '',
        phone: user.phone || '',
      })
      setAddresses(user.addresses || [])
      setPreferences(user.preferences || defaultUserPreferences)
>>>>>>> db25158 (Enhance user profile with address book and preferences management)
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch("/api/auth/profile");
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setAddresses(data.profile.addresses || []);
          setPreferences(data.profile.preferences || preferences);
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      addresses,
      preferences,
<<<<<<< HEAD
    });

    if (result.success) {
      setIsEditing(false);
      setSuccessMessage(
        locale === "cs" ? "Profil byl úspěšně aktualizován" : "Profile updated successfully"
      );
      setTimeout(() => setSuccessMessage(""), 3000);
=======
    })

    if (result.success) {
      setIsEditing(false)
      setSuccessMessage(locale === 'cs' ? 'Profil byl úspěšně aktualizován' : 'Profile updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const handleSaveAddresses = async (newAddresses: Address[]) => {
    const result = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      addresses: newAddresses,
      preferences,
    })

    if (result.success) {
      setAddresses(newAddresses)
      setSuccessMessage(locale === 'cs' ? 'Adresy byly úspěšně uloženy' : 'Addresses saved successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const handleSavePreferences = async (newPreferences: UserPreferences) => {
    const result = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      addresses,
      preferences: newPreferences,
    })

    if (result.success) {
      setPreferences(newPreferences)
      setSuccessMessage(locale === 'cs' ? 'Nastavení bylo úspěšně uloženo' : 'Preferences saved successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
>>>>>>> db25158 (Enhance user profile with address book and preferences management)
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignOut = async () => {
    await signOut();
  };

<<<<<<< HEAD
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
    setAddresses((prev) => [...prev, newAddress]);
  };

  const updateAddress = (id: string, field: keyof Address, value: string | boolean) => {
    setAddresses((prev) =>
      prev.map((addr) => (addr.id === id ? { ...addr, [field]: value } : addr))
    );
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handlePreferenceChange = (
    category: keyof UserPreferences,
    key: string,
    value: boolean | string
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] as any),
        [key]: value,
      },
    }));
  };

  const getTabLabel = (tab: string) => {
    const labels = {
      profile: locale === "cs" ? "Základní údaje" : "Basic Info",
      orders: locale === "cs" ? "Moje objednávky" : "My Orders",
      addresses: locale === "cs" ? "Adresy" : "Addresses",
      preferences: locale === "cs" ? "Nastavení" : "Preferences",
    };
    return labels[tab as keyof typeof labels] || tab;
  };
=======

>>>>>>> db25158 (Enhance user profile with address book and preferences management)

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Načítání profilu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
<<<<<<< HEAD
            {(["profile", "orders", "addresses", "preferences"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                {getTabLabel(tab)}
              </button>
            ))}
=======
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {locale === 'cs' ? 'Základní údaje' : 'Basic Info'}
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'addresses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {locale === 'cs' ? 'Adresy' : 'Addresses'}
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'preferences'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {locale === 'cs' ? 'Nastavení' : 'Preferences'}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {locale === 'cs' ? 'Objednávky' : 'Orders'}
            </button>
>>>>>>> db25158 (Enhance user profile with address book and preferences management)
          </nav>
        </div>
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
<<<<<<< HEAD
            <h1 className="text-2xl font-bold text-gray-900">{getTabLabel(activeTab)}</h1>
            <Button variant="outline" onClick={handleSignOut} disabled={signOutLoading}>
=======
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'profile' && (locale === 'cs' ? 'Základní údaje' : 'Basic Information')}
              {activeTab === 'addresses' && (locale === 'cs' ? 'Adresář' : 'Address Book')}
              {activeTab === 'preferences' && (locale === 'cs' ? 'Nastavení účtu' : 'Account Settings')}
              {activeTab === 'orders' && (locale === 'cs' ? 'Historie objednávek' : 'Order History')}
            </h1>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={signOutLoading}
            >
>>>>>>> db25158 (Enhance user profile with address book and preferences management)
              {signOutLoading
                ? locale === "cs"
                  ? "Odhlašování..."
                  : "Signing out..."
                : locale === "cs"
                  ? "Odhlásit se"
                  : "Sign Out"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
<<<<<<< HEAD
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {/* Basic Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label={locale === "cs" ? "E-mail" : "Email"}
                  value={user.email}
                  disabled
                  helpText={locale === "cs" ? "E-mail nelze změnit" : "Email cannot be changed"}
                />

                <Input
                  id="name"
                  name="name"
                  type="text"
                  label={locale === "cs" ? "Jméno a příjmení" : "Full Name"}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing || updateLoading}
                  required
                />

                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  label={locale === "cs" ? "Telefon" : "Phone"}
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing || updateLoading}
                />
              </div>

              {updateError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{updateError}</p>
                </div>
=======
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <Input
                id="email"
                name="email"
                type="email"
                label="E-mail"
                value={user.email}
                disabled
                helperText={locale === 'cs' ? 'E-mail nelze změnit' : 'Email cannot be changed'}
              />

              <Input
                id="name"
                name="name"
                type="text"
                label={locale === 'cs' ? 'Jméno a příjmení' : 'Full Name'}
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing || updateLoading}
                required
              />

              <Input
                id="phone"
                name="phone"
                type="tel"
                label={locale === 'cs' ? 'Telefon' : 'Phone'}
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing || updateLoading}
              />
            </div>

            {updateError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{updateError}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={updateLoading}
                  >
                    {locale === 'cs' ? 'Zrušit' : 'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateLoading}
                  >
                    {updateLoading 
                      ? (locale === 'cs' ? 'Ukládání...' : 'Saving...') 
                      : (locale === 'cs' ? 'Uložit změny' : 'Save Changes')
                    }
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  {locale === 'cs' ? 'Upravit profil' : 'Edit Profile'}
                </Button>
>>>>>>> db25158 (Enhance user profile with address book and preferences management)
              )}

              <div className="flex justify-end space-x-3">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={updateLoading}
                    >
                      {locale === "cs" ? "Zrušit" : "Cancel"}
                    </Button>
                    <Button type="submit" disabled={updateLoading}>
                      {updateLoading
                        ? locale === "cs"
                          ? "Ukládání..."
                          : "Saving..."
                        : locale === "cs"
                          ? "Uložit změny"
                          : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    {locale === "cs" ? "Upravit profil" : "Edit Profile"}
                  </Button>
                )}
              </div>
            </form>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && <OrderHistory locale={locale} />}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <AddressBook
                addresses={addresses}
                onAddressesChange={setAddresses}
                locale={locale}
                disabled={updateLoading}
              />

              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={updateLoading}>
                  {updateLoading
                    ? locale === "cs"
                      ? "Ukládání..."
                      : "Saving..."
                    : locale === "cs"
                      ? "Uložit adresy"
                      : "Save Addresses"}
                </Button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-8">
              {/* Language Preferences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {locale === "cs" ? "Jazyk" : "Language"}
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="language"
                      value="cs"
                      checked={preferences.language === "cs"}
                      onChange={(e) =>
                        handlePreferenceChange("language", "language", e.target.value)
                      }
                      className="mr-3 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Čeština</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="language"
                      value="en"
                      checked={preferences.language === "en"}
                      onChange={(e) =>
                        handlePreferenceChange("language", "language", e.target.value)
                      }
                      className="mr-3 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">English</span>
                  </label>
                </div>
              </div>

              {/* Email Notifications */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {locale === "cs" ? "E-mailová oznámení" : "Email Notifications"}
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {locale === "cs" ? "Aktualizace objednávek" : "Order Updates"}
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications.orderUpdates}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "emailNotifications",
                          "orderUpdates",
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {locale === "cs" ? "Propagační nabídky" : "Promotional Offers"}
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications.promotions}
                      onChange={(e) =>
                        handlePreferenceChange("emailNotifications", "promotions", e.target.checked)
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {locale === "cs" ? "Newsletter" : "Newsletter"}
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications.newsletter}
                      onChange={(e) =>
                        handlePreferenceChange("emailNotifications", "newsletter", e.target.checked)
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>

              {/* SMS Notifications */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {locale === "cs" ? "SMS oznámení" : "SMS Notifications"}
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {locale === "cs" ? "Aktualizace objednávek" : "Order Updates"}
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.smsNotifications.orderUpdates}
                      onChange={(e) =>
                        handlePreferenceChange("smsNotifications", "orderUpdates", e.target.checked)
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {locale === "cs" ? "Připomínky doručení" : "Delivery Reminders"}
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.smsNotifications.deliveryReminders}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "smsNotifications",
                          "deliveryReminders",
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {locale === "cs" ? "Soukromí" : "Privacy"}
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {locale === "cs" ? "Sdílet data pro marketing" : "Share Data for Marketing"}
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.privacy.shareDataForMarketing}
                      onChange={(e) =>
                        handlePreferenceChange("privacy", "shareDataForMarketing", e.target.checked)
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {locale === "cs" ? "Povolit analytiku" : "Allow Analytics"}
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.privacy.allowAnalytics}
                      onChange={(e) =>
                        handlePreferenceChange("privacy", "allowAnalytics", e.target.checked)
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={updateLoading}>
                  {updateLoading
                    ? locale === "cs"
                      ? "Ukládání..."
                      : "Saving..."
                    : locale === "cs"
                      ? "Uložit nastavení"
                      : "Save Preferences"}
                </Button>
              </div>
            </div>
          )}
        </div>
<<<<<<< HEAD
      </div>
=======
      )}

      {activeTab === 'addresses' && (
        <div className="bg-white shadow rounded-lg p-6">
          <AddressBook
            addresses={addresses}
            onSave={handleSaveAddresses}
            loading={updateLoading}
            locale={locale}
          />
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white shadow rounded-lg p-6">
          <UserPreferencesComponent
            preferences={preferences}
            onSave={handleSavePreferences}
            loading={updateLoading}
            locale={locale}
          />
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white shadow rounded-lg p-6">
          <OrderHistory locale={locale} />
        </div>
      )}
>>>>>>> db25158 (Enhance user profile with address book and preferences management)
    </div>
  );
}
