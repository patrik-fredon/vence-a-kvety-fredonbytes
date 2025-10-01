import { SupabaseAdapter } from "@auth/supabase-adapter";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";

function getSupabaseConfig() {
  // Skip Supabase configuration in Edge Runtime
  if (process.env['NEXT_RUNTIME'] === 'edge') {
    return null;
  }

  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!(supabaseUrl && supabaseServiceKey)) {
    console.warn("Supabase environment variables not found, auth will not work properly");
    return null;
  }

  return {
    url: supabaseUrl,
    secret: supabaseServiceKey,
  };
}

const supabaseConfig = getSupabaseConfig();

export const config = {
  ...(supabaseConfig && { adapter: SupabaseAdapter(supabaseConfig) }),
  providers: [
    {
      id: "credentials",
      name: "credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!(credentials?.['email'] && credentials?.['password'])) {
          return null;
        }

        try {
          const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
          const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

          if (!(supabaseUrl && supabaseAnonKey)) {
            return null;
          }

          // Conditionally import Supabase only in Node.js runtime
          if (process.env['NEXT_RUNTIME'] === 'edge') {
            console.warn('Supabase auth not available in Edge Runtime');
            return null;
          }

          const { createClient } = await import("@supabase/supabase-js");
          const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: credentials['email'] as string,
            password: credentials['password'] as string,
          });

          if (error || !data.user) {
            return null;
          }

          return {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.['name'] || null,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    },
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env['NEXTAUTH_SECRET'] || "",
} satisfies NextAuthConfig;;;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
