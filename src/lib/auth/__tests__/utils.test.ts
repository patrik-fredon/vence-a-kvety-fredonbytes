// Mock Supabase client
const mockAuth = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  resetPasswordForEmail: jest.fn(),
  updateUser: jest.fn(),
  getUser: jest.fn(),
  getSession: jest.fn(),
  onAuthStateChange: jest.fn(),
}

const mockFrom = jest.fn(() => ({
  insert: jest.fn(),
  update: jest.fn(),
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      single: jest.fn(),
    })),
  })),
}))

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: mockAuth,
    from: mockFrom,
  },
}))

// Mock window.location for resetPassword test
Object.defineProperty(window, 'location', {
  value: { origin: 'http://localhost:3000' },
  writable: true,
})

import { authUtils } from '../utils'

describe('authUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signUp', () => {
    it('should successfully sign up a user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }

      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      mockFrom.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
      } as any)

      const result = await authUtils.signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      })

      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'Test User',
            phone: undefined,
          },
        },
      })
    })

    it('should handle sign up errors', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already exists' },
      } as any)

      const result = await authUtils.signUp({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.user).toBeNull()
      expect(result.error).toBe('Email already exists')
    })
  })

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }

      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      const result = await authUtils.signIn({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    it('should handle sign in errors', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      } as any)

      const result = await authUtils.signIn({
        email: 'test@example.com',
        password: 'wrongpassword',
      })

      expect(result.user).toBeNull()
      expect(result.error).toBe('Invalid credentials')
    })
  })

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null } as any)

      const result = await authUtils.signOut()

      expect(result.error).toBeNull()
    })
  })

  describe('resetPassword', () => {
    it('should successfully send reset password email', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({ error: null } as any)

      const result = await authUtils.resetPassword({
        email: 'test@example.com',
      })

      expect(result.error).toBeNull()
      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'http://localhost:3000/auth/reset-password' }
      )
    })
  })

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      mockAuth.updateUser.mockResolvedValue({ error: null } as any)

      const result = await authUtils.updatePassword({
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      })

      expect(result.error).toBeNull()
    })

    it('should handle password mismatch', async () => {
      const result = await authUtils.updatePassword({
        password: 'newpassword123',
        confirmPassword: 'differentpassword',
      })

      expect(result.error).toBe('Passwords do not match')
    })
  })
})
