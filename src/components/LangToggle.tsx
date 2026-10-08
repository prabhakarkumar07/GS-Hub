"use client";
import { useApp } from "./providers";

export function LangToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useApp();
  return (
    <div role="group" aria-label="Language" className="inline-flex rounded-full border border-gold/60 bg-white/10 p-0.5 text-xs font-semibold">
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1 transition ${lang === l ? "bg-gold text-maroon-900" : "text-current opacity-80 hover:opacity-100"}`}
        >
          {l === "en" ? (compact ? "EN" : "English") : compact ? "हि" : "हिंदी"}
        </button>
      ))}
    </div>
  );
}
