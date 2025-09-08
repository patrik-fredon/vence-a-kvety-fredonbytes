'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { authUtils, type AuthUser } from './utils'
import type { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      if (session?.user) {
        const { user: authUser } = await authUtils.getCurrentUser()
        setUser(authUser)
      }

      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)

        if (session?.user) {
          const { user: authUser } = await authUtils.getCurrentUser()
          setUser(authUser)
        } else {
          setUser(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
  }
}

export function useSignUp() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signUp = async (data: Parameters<typeof authUtils.signUp>[0]) => {
    setLoading(true)
    setError(null)

    const result = await authUtils.signUp(data)

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    }

    return { success: true, user: result.user }
  }

  return { signUp, loading, error }
}

export function useSignIn() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async (data: Parameters<typeof authUtils.signIn>[0]) => {
    setLoading(true)
    setError(null)

    const result = await authUtils.signIn(data)

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    }

    return { success: true, user: result.user }
  }

  return { signIn, loading, error }
}

export function useSignOut() {
  const [loading, setLoading] = useState(false)

  const signOut = async () => {
    setLoading(true)
    const result = await authUtils.signOut()
    setLoading(false)
    return result
  }

  return { signOut, loading }
}

export function useResetPassword() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetPassword = async (data: Parameters<typeof authUtils.resetPassword>[0]) => {
    setLoading(true)
    setError(null)

    const result = await authUtils.resetPassword(data)

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    }

    return { success: true }
  }

  return { resetPassword, loading, error }
}

export function useUpdatePassword() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updatePassword = async (data: Parameters<typeof authUtils.updatePassword>[0]) => {
    setLoading(true)
    setError(null)

    const result = await authUtils.updatePassword(data)

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    }

    return { success: true }
  }

  return { updatePassword, loading, error }
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = async (data: Parameters<typeof authUtils.updateProfile>[0]) => {
    setLoading(true)
    setError(null)

    const result = await authUtils.updateProfile(data)

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    }

    return { success: true }
  }

  return { updateProfile, loading, error }
}
