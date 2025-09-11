// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(),
      update: jest.fn(),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

// Mock window.location for resetPassword test
Object.defineProperty(window, "location", {
  value: { origin: "http://localhost:3000" },
  writable: true,
});

import { authUtils } from "../utils";
import { supabase } from "@/lib/supabase/client";

// Type the mocked supabase
const mockSupabase = jest.mocked(supabase);

describe("authUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("signUp", () => {
    it("should successfully sign up a user", async () => {
      const mockUser = { id: "123", email: "test@example.com" };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
      } as any);

      const result = await authUtils.signUp({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          data: {
            name: "Test User",
            phone: undefined,
          },
        },
      });
    });

    it("should handle sign up errors", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: "Email already exists" },
      } as any);

      const result = await authUtils.signUp({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.user).toBeNull();
      expect(result.error).toBe("Email already exists");
    });
  });

  describe("signIn", () => {
    it("should successfully sign in a user", async () => {
      const mockUser = { id: "123", email: "test@example.com" };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      const result = await authUtils.signIn({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it("should handle sign in errors", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid credentials" },
      } as any);

      const result = await authUtils.signIn({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(result.user).toBeNull();
      expect(result.error).toBe("Invalid credentials");
    });
  });

  describe("signOut", () => {
    it("should successfully sign out", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null } as any);

      const result = await authUtils.signOut();

      expect(result.error).toBeNull();
    });
  });

  describe("resetPassword", () => {
    it("should successfully send reset password email", async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null } as any);

      const result = await authUtils.resetPassword({
        email: "test@example.com",
      });

      expect(result.error).toBeNull();
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("test@example.com", {
        redirectTo: "http://localhost:3000/auth/reset-password",
      });
    });
  });

  describe("updatePassword", () => {
    it("should successfully update password", async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null } as any);

      const result = await authUtils.updatePassword({
        password: "newpassword123",
        confirmPassword: "newpassword123",
      });

      expect(result.error).toBeNull();
    });

    it("should handle password mismatch", async () => {
      const result = await authUtils.updatePassword({
        password: "newpassword123",
        confirmPassword: "differentpassword",
      });

      expect(result.error).toBe("Passwords do not match");
    });
  });
});
