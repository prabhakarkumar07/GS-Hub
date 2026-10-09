"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabase } from "@/lib/supabase/clerk-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { translate, type TKey } from "@/lib/i18n";
import type { AppSettings, AppUser, Exam, Lang, Subject, Topic } from "@/lib/types";

interface Profile { id: string; full_name: string | null; role: "student" | "admin"; preferred_lang: Lang; subscription_tier: "free" | "premium" }

interface Taxonomy {
  subjects: Subject[];
  topics: Topic[];
  exams: Exam[];
  settings: AppSettings;
  loaded: boolean;
}

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  /** Pick the right language from a bilingual pair, falling back to English. */
  pick: (en: string | null | undefined, hi: string | null | undefined) => string;
  /** Clerk user object (null when signed out). */
  user: AppUser | null;
  profile: Profile | null;
  isAdmin: boolean;
  authReady: boolean;
  taxonomy: Taxonomy;
  reloadTaxonomy: () => Promise<void>;
  subjectName: (id: number | null | undefined) => string;
  topicName: (id: number | null | undefined) => string;
  examName: (id: number | null | undefined) => string;
}

const DEFAULT_SETTINGS: AppSettings = { positive_marks: 1, negative_marks: 0.33, seconds_per_question: 48, min_stats_attempts: 5 };
const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [taxonomy, setTaxonomy] = useState<Taxonomy>({ subjects: [], topics: [], exams: [], settings: DEFAULT_SETTINGS, loaded: false });

  // Clerk auth state
  const { user: clerkUser, isLoaded } = useUser();
  const supabase = useClerkSupabase();

  // Expose a simplified user object so the rest of the app doesn't need to know about Clerk
  const user = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        name: clerkUser.fullName ?? undefined,
      }
    : null;

  const authReady = isLoaded;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gshub_lang");
      if (saved === "en" || saved === "hi") setLangState(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "hi" ? "hi" : "en";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("gshub_lang", l); } catch { /* ignore */ }
  }, []);

  // Load profile from Supabase whenever the Clerk user changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !clerkUser) {
      setProfile(null);
      return;
    }
    
    async function loadOrCreateProfile() {
      // 1. Try to fetch existing profile
      const { data, error } = await supabase!
        .from("profiles")
        .select("id, full_name, role, preferred_lang, subscription_tier")
        .eq("id", clerkUser!.id)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
        return;
      }

      // 2. If it doesn't exist, create it
      const newProfile = {
        id: clerkUser!.id,
        full_name: clerkUser!.fullName,
        role: "student",
        preferred_lang: "en",
      };

      const { data: inserted, error: insertError } = await supabase!
        .from("profiles")
        .insert(newProfile)
        .select("id, full_name, role, preferred_lang, subscription_tier")
        .single();

      if (!insertError && inserted) {
        setProfile(inserted as Profile);
      }
    }

    loadOrCreateProfile();
  }, [clerkUser, supabase]);

  const reloadTaxonomy = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    const [s, t, e, st] = await Promise.all([
      supabase.from("subjects").select("*").order("sort_order"),
      supabase.from("topics").select("*").order("sort_order"),
      supabase.from("exams").select("*").order("sort_order"),
      supabase.from("app_settings").select("positive_marks, negative_marks, seconds_per_question, min_stats_attempts").eq("id", 1).maybeSingle(),
    ]);
    setTaxonomy({
      subjects: (s.data as Subject[]) ?? [],
      topics: (t.data as Topic[]) ?? [],
      exams: (e.data as Exam[]) ?? [],
      settings: st.data
        ? { positive_marks: Number(st.data.positive_marks), negative_marks: Number(st.data.negative_marks), seconds_per_question: st.data.seconds_per_question, min_stats_attempts: st.data.min_stats_attempts }
        : DEFAULT_SETTINGS,
      loaded: true,
    });
  }, [supabase]);

  useEffect(() => { reloadTaxonomy(); }, [reloadTaxonomy]);

  const value = useMemo<AppCtx>(() => {
    const pick = (en: string | null | undefined, hi: string | null | undefined) =>
      (lang === "hi" ? hi || en : en || hi) ?? "";
    const subjectName = (id: number | null | undefined) => {
      const s = taxonomy.subjects.find((x) => x.id === id);
      return s ? pick(s.name_en, s.name_hi) : "—";
    };
    const topicName = (id: number | null | undefined) => {
      const s = taxonomy.topics.find((x) => x.id === id);
      return s ? pick(s.name_en, s.name_hi) : "—";
    };
    const examName = (id: number | null | undefined) => {
      const s = taxonomy.exams.find((x) => x.id === id);
      return s ? pick(s.name_en, s.name_hi) : "";
    };
    return {
      lang, setLang,
      t: (key, vars) => translate(lang, key, vars),
      pick, user, profile, isAdmin: profile?.role === "admin", authReady,
      taxonomy, reloadTaxonomy, subjectName, topicName, examName,
    };
  }, [lang, setLang, user, profile, authReady, taxonomy, reloadTaxonomy]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
