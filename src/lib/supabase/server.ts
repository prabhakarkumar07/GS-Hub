import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Server-side Supabase client that authenticates with the current Clerk session.
 * Uses the "supabase" JWT template from Clerk Dashboard → JWT Templates.
 * Returns null when Supabase is not configured.
 */
export async function getServerSupabase() {
  if (!isSupabaseConfigured) return null;

  const { getToken } = await auth();
  const clerkToken = await getToken({ template: "supabase" });

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: clerkToken ? { Authorization: `Bearer ${clerkToken}` } : {},
    },
  });
}
