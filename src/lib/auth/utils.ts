<<<<<<< HEAD
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
=======
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Address, UserPreferences } from '@/types/user'
>>>>>>> 2de4c3c (Api routing problem, non functional state)

export interface AuthUser {
<<<<<<< HEAD
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
=======
  id: string
  email: string
  name?: string | null
  phone?: string | null
  addresses?: Address[]
  preferences?: UserPreferences
>>>>>>> db25158 (Enhance user profile with address book and preferences management)
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
<<<<<<< HEAD
  name?: string;
  phone?: string;
  addresses?: any[];
  preferences?: any;
=======
  name?: string
  phone?: string
  addresses?: Address[]
  preferences?: UserPreferences
>>>>>>> db25158 (Enhance user profile with address book and preferences management)
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export const authUtils = {
  async signUp(data: SignUpData): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      // Create user profile
      if (authData.user) {
        const { error: profileError } = await supabase.from("user_profiles").insert({
          id: authData.user.id,
          email: authData.user.email!,
          name: data.name || null,
          phone: data.phone || null,
          addresses: [],
          preferences: {},
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }
      }

      return { user: authData.user, error: null };
    } catch (error) {
      return { user: null, error: "An unexpected error occurred" };
    }
  },

  async signIn(data: SignInData): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: authData.user, error: null };
    } catch (error) {
      return { user: null, error: "An unexpected error occurred" };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  },

  async resetPassword(data: ResetPasswordData): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  },

  async updatePassword(data: UpdatePasswordData): Promise<{ error: string | null }> {
    try {
      if (data.password !== data.confirmPassword) {
        return { error: "Passwords do not match" };
      }

      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  },

  async updateProfile(data: UpdateProfileData): Promise<{ error: string | null }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { error: "User not authenticated" };
      }

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          phone: data.phone,
        },
      });

      if (authError) {
        return { error: authError.message };
      }

      // Update user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          name: data.name,
          phone: data.phone,
          addresses: data.addresses as any,
          preferences: data.preferences as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        return { error: profileError.message };
      }

      return { error: null };
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  },

  async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        return { user: null, error: error.message };
      }

      if (!user) {
        return { user: null, error: null };
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email!,
        name: profile?.name || user.user_metadata?.name || null,
        phone: profile?.phone || user.user_metadata?.phone || null,
<<<<<<< HEAD
<<<<<<< HEAD
      };
=======
        addresses: profile?.addresses || [],
        preferences: profile?.preferences || {},
=======
        addresses: (profile?.addresses as Address[]) || [],
        preferences: (profile?.preferences as UserPreferences) || {},
>>>>>>> 2de4c3c (Api routing problem, non functional state)
      }
>>>>>>> db25158 (Enhance user profile with address book and preferences management)

      return { user: authUser, error: null };
    } catch (error) {
      return { user: null, error: "An unexpected error occurred" };
    }
  },

  async getUserProfile(userId: string) {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        return { profile: null, error: error.message };
      }

      return { profile, error: null };
    } catch (error) {
      return { profile: null, error: "An unexpected error occurred" };
    }
  },
};
