import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";
import { HomeClient } from "./HomeClient";

export const revalidate = 300; // refresh the live question count every 5 minutes

export default async function HomePage() {
  let count: number | null = null;
  if (isSupabaseConfigured) {
    try {
      const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
      const { data } = await sb.rpc("get_live_question_count");
      count = typeof data === "number" ? data : null;
    } catch { /* render without the count */ }
  }
  return <HomeClient count={count} />;
}
