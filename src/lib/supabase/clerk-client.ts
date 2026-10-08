"use client";
import { useAuth } from "@clerk/nextjs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useRef } from "react";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Returns a Supabase client that authenticates every request with the
 * current Clerk session JWT (via the "supabase" JWT template).
 *
 * HOW TO SET IT UP IN CLERK:
 *  1. Clerk Dashboard → Your App → JWT Templates → New template → Supabase
 *  2. Give it the name "supabase"
 *  3. Clerk will pre-fill the correct claims for Supabase RLS (sub, aud, role, etc.)
 *  4. Save and use NEXT_PUBLIC_SUPABASE_JWT_SECRET from Supabase → Settings → API
 */
export function useClerkSupabase(): SupabaseClient | null {
  const { getToken } = useAuth();
  const clientRef = useRef<SupabaseClient | null>(null);

  if (!isSupabaseConfigured) return null;

  if (!clientRef.current) {
    clientRef.current = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        fetch: async (url, options = {}) => {
          // Fetch a fresh Clerk token signed with the "supabase" JWT template
          const clerkToken = await getToken({ template: "supabase" });
          const headers = new Headers((options as RequestInit).headers);
          if (clerkToken) {
            headers.set("Authorization", `Bearer ${clerkToken}`);
          }
          return fetch(url, { ...(options as RequestInit), headers });
        },
      },
    });
  }

  return clientRef.current;
}

/**
 * A plain (anon-key only) Supabase client for public queries that
 * don't require the user's identity (e.g. reading taxonomy/settings).
 */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
