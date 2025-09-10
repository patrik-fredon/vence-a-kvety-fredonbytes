'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth, useUpdateProfile, useSignOut } from '@/lib/auth/hooks'
import { OrderHistory } from '@/components/order/OrderHistory'
import { UserPreferencesComponent } from './UserPreferences'
import { AddressBook } from './AddressBook'
import { useParams } from 'next/navigation'
import { Address, UserPreferences, defaultUserPreferences } from '@/types/user'

export function UserProfile() {
  const { user } = useAuth()
  const { updateProfile, loading: updateLoading, error: updateError } = useUpdateProfile()
  const { signOut, loading: signOutLoading } = useSignOut()
  const params = useParams()
  const locale = params?.locale as string || 'cs'

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

  const [addresses, setAddresses] = useState<Address[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>(defaultUserPreferences)
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'preferences'>('profile')

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      })
      setAddresses(user.addresses || [])
      setPreferences(user.preferences || defaultUserPreferences)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      addresses,
      preferences,
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
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSignOut = async () => {
    await signOut()
  }



  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Načítání profilu...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
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
          </nav>
        </div>
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
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
              {signOutLoading
                ? (locale === 'cs' ? 'Odhlašování...' : 'Signing out...')
                : (locale === 'cs' ? 'Odhlásit se' : 'Sign Out')
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
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
              )}
            </div>
          </form>
        </div>
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
    </div>
  )
}
