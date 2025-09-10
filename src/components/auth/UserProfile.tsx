'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth, useUpdateProfile, useSignOut } from '@/lib/auth/hooks'
import { OrderHistory } from '@/components/order/OrderHistory'
import { useParams } from 'next/navigation'

interface Address {
  id: string
  name: string
  street: string
  city: string
  postalCode: string
  country: string
  isDefault: boolean
}

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
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile')

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      addresses,
    })

    if (result.success) {
      setIsEditing(false)
      setSuccessMessage('Profil byl úspěšně aktualizován')
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

  const addAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      name: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Česká republika',
      isDefault: addresses.length === 0,
    }
    setAddresses(prev => [...prev, newAddress])
  }

  const updateAddress = (id: string, field: keyof Address, value: string | boolean) => {
    setAddresses(prev => prev.map(addr =>
      addr.id === id ? { ...addr, [field]: value } : addr
    ))
  }

  const removeAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id))
  }

  const setDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })))
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
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {locale === 'cs' ? 'Můj profil' : 'My Profile'}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {locale === 'cs' ? 'Moje objednávky' : 'My Orders'}
            </button>
          </nav>
        </div>
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'profile'
                ? (locale === 'cs' ? 'Můj profil' : 'My Profile')
                : (locale === 'cs' ? 'Moje objednávky' : 'My Orders')
              }
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
      {activeTab === 'profile' ? (
        <div className="bg-white shadow rounded-lg">

        <div className="p-6">
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <Input
                id="email"
                name="email"
                type="email"
                label="E-mail"
                value={user.email}
                disabled
                helperText="E-mail nelze změnit"
              />

              <Input
                id="name"
                name="name"
                type="text"
                label="Jméno a příjmení"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing || updateLoading}
                required
              />

              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Telefon"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing || updateLoading}
              />
            </div>

            {/* Addresses Section */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Dodací adresy
                </h3>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addAddress}
                    disabled={updateLoading}
                  >
                    Přidat adresu
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Název adresy"
                        value={address.name}
                        onChange={(e) => updateAddress(address.id, 'name', e.target.value)}
                        disabled={!isEditing || updateLoading}
                        placeholder="Domů, Práce, atd."
                      />

                      <Input
                        label="Ulice a číslo popisné"
                        value={address.street}
                        onChange={(e) => updateAddress(address.id, 'street', e.target.value)}
                        disabled={!isEditing || updateLoading}
                      />

                      <Input
                        label="Město"
                        value={address.city}
                        onChange={(e) => updateAddress(address.id, 'city', e.target.value)}
                        disabled={!isEditing || updateLoading}
                      />

                      <Input
                        label="PSČ"
                        value={address.postalCode}
                        onChange={(e) => updateAddress(address.id, 'postalCode', e.target.value)}
                        disabled={!isEditing || updateLoading}
                      />
                    </div>

                    {isEditing && (
                      <div className="mt-4 flex justify-between items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={address.isDefault}
                            onChange={(e) => setDefaultAddress(address.id)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            Výchozí adresa
                          </span>
                        </label>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeAddress(address.id)}
                          disabled={updateLoading}
                          className="text-red-600 hover:text-red-700"
                        >
                          Odstranit
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {addresses.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Žádné adresy nejsou uloženy
                  </p>
                )}
              </div>
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
                    Zrušit
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Ukládání...' : 'Uložit změny'}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  Upravit profil
                </Button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <OrderHistory locale={locale} />
        </div>
      )}
    </div>
  )
}
