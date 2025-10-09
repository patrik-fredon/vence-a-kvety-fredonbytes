"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { OrderHistory } from "@/components/order/OrderHistory";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth, useSignOut, useUpdateProfile } from "@/lib/auth/hooks";
import { type Address, defaultUserPreferences, type UserPreferences } from "@/types/user";
import { AddressBook } from "./AddressBook";

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

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultUserPreferences);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses" | "preferences">(
    "profile"
  );

  const loadUserProfile = useCallback(async () => {
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
  }, [preferences]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
      loadUserProfile();
    }
  }, [user, loadUserProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      addresses,
      preferences,
    });

    if (result.success) {
      setIsEditing(false);
      setSuccessMessage(
        locale === "cs" ? "Profil byl úspěšně aktualizován" : "Profile updated successfully"
      );
      setTimeout(() => setSuccessMessage(""), 3000);
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

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Načítání profilu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-stone-900">Můj účet</h1>
              <p className="text-stone-600 mt-1">Spravujte své údaje a nastavení</p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={signOutLoading}
              className="border-stone-300 text-stone-700 hover:bg-stone-50"
            >
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

        {/* Tab Navigation */}
        <Card className="mb-6">
          <div className="border-b border-stone-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
              {(["profile", "orders", "addresses", "preferences"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                    activeTab === tab
                      ? "border-amber-600 text-amber-600"
                      : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
                  }`}
                >
                  {getTabLabel(tab)}
                </button>
              ))}
            </nav>
          </div>
        </Card>

        {/* Tab Content */}
        <Card>
          <CardContent className="p-6">
            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                </div>
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
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{updateError}</p>
                      </div>
                    </div>
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
                        {locale === "cs" ? "Zrušit" : "Cancel"}
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateLoading}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
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
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
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
                  <Button
                    onClick={handleSubmit}
                    disabled={updateLoading}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
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
                  <h3 className="text-lg font-medium text-stone-900 mb-4">
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
                        className="mr-3 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-stone-700">Čeština</span>
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
                        className="mr-3 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-stone-700">English</span>
                    </label>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h3 className="text-lg font-medium text-stone-900 mb-4">
                    {locale === "cs" ? "Oznámení" : "Notifications"}
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-stone-700">
                        {locale === "cs" ? "E-mailová oznámení" : "Email Notifications"}
                      </span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.email}
                        onChange={(e) =>
                          handlePreferenceChange("notifications", "email", e.target.checked)
                        }
                        className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-stone-700">
                        {locale === "cs" ? "SMS oznámení" : "SMS Notifications"}
                      </span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.sms}
                        onChange={(e) =>
                          handlePreferenceChange("notifications", "sms", e.target.checked)
                        }
                        className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-stone-700">
                        {locale === "cs" ? "Aktualizace objednávek" : "Order Updates"}
                      </span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.orderUpdates}
                        onChange={(e) =>
                          handlePreferenceChange("notifications", "orderUpdates", e.target.checked)
                        }
                        className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-stone-700">
                        {locale === "cs" ? "Propagační nabídky" : "Promotional Offers"}
                      </span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.promotions}
                        onChange={(e) =>
                          handlePreferenceChange("notifications", "promotions", e.target.checked)
                        }
                        className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h3 className="text-lg font-medium text-stone-900 mb-4">
                    {locale === "cs" ? "Soukromí" : "Privacy"}
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-stone-700">
                        {locale === "cs" ? "Sdílet data" : "Share Data"}
                      </span>
                      <input
                        type="checkbox"
                        checked={preferences.privacy.shareData}
                        onChange={(e) =>
                          handlePreferenceChange("privacy", "shareData", e.target.checked)
                        }
                        className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-stone-700">
                        {locale === "cs" ? "Povolit analytiku" : "Allow Analytics"}
                      </span>
                      <input
                        type="checkbox"
                        checked={preferences.privacy.analytics}
                        onChange={(e) =>
                          handlePreferenceChange("privacy", "analytics", e.target.checked)
                        }
                        className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={updateLoading}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
