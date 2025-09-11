import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

// Only warn in development, not during build
if (
  process.env.NODE_ENV === "development" &&
  (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
) {
  console.warn("Missing Supabase server environment variables");
}

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Server-side client for user operations (to be used with user session)
export const createServerClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
