'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useAuth, useSignOut } from '@/lib/auth/hooks'

export function AuthStatus() {
  const { user, loading, isAuthenticated } = useAuth()
  const { signOut, loading: signOutLoading } = useSignOut()

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="hidden sm:block">
          <span className="text-sm text-gray-700">
            Vítejte, {user.name || user.email}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/profile">
            <Button variant="outline" size="sm">
              Profil
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={signOutLoading}
          >
            {signOutLoading ? 'Odhlašování...' : 'Odhlásit'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Link href="/auth/signin">
        <Button variant="outline" size="sm">
          Přihlášení
        </Button>
      </Link>

      <Link href="/auth/signup">
        <Button size="sm">
          Registrace
        </Button>
      </Link>
    </div>
  )
}
