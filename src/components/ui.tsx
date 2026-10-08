"use client";
import Link from "next/link";
import { useApp } from "./providers";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { strengthOf } from "@/lib/scoring";

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-stone-500" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-maroon/20 border-t-maroon" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="h-display text-2xl sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1.5 max-w-2xl text-[15px] text-stone-600">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Empty({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-4 px-6 py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-gold-50 ring-1 ring-gold/40" />
      <p className="max-w-md text-stone-600">{text}</p>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint, accent = false }: { label: string; value: React.ReactNode; hint?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${accent ? "bg-maroon text-white" : "card"}`}>
      <div className={`text-xs font-medium uppercase tracking-wide ${accent ? "text-gold-300" : "text-stone-500"}`}>{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${accent ? "text-white" : "text-maroon"}`}>{value}</div>
      {hint && <div className={`mt-0.5 text-xs ${accent ? "text-white/70" : "text-stone-500"}`}>{hint}</div>}
    </div>
  );
}

export function ConfigNotice() {
  const { t } = useApp();
  if (isSupabaseConfigured) return null;
  return <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{t("not_configured")}</div>;
}

export function StrengthBadge({ pct }: { pct: number | null }) {
  const { t } = useApp();
  const s = strengthOf(pct);
  if (!s) return <span className="badge bg-stone-100 text-stone-500">—</span>;
  const cls = s === "strong" ? "bg-green-100 text-green-800" : s === "average" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800";
  return <span className={`badge ${cls}`}>{t(s)}</span>;
}

export function heatColor(pct: number | null): string {
  if (pct === null) return "bg-stone-100 text-stone-500 border-stone-200";
  if (pct >= 70) return "bg-green-500 text-white border-green-600";
  if (pct >= 55) return "bg-lime-400 text-lime-950 border-lime-500";
  if (pct >= 40) return "bg-amber-300 text-amber-950 border-amber-400";
  if (pct >= 25) return "bg-orange-400 text-white border-orange-500";
  return "bg-red-500 text-white border-red-600";
}

export function LoginPrompt({ text }: { text: string }) {
  const { t } = useApp();
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gold/50 bg-gold-50 p-4 text-sm text-maroon-900 sm:flex-row sm:items-center sm:justify-between">
      <span>{text}</span>
      <Link href="/login" className="btn-primary shrink-0">{t("login")} / {t("signup")}</Link>
    </div>
  );
}

export function Bar({ pct, className = "bg-maroon" }: { pct: number; className?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}
