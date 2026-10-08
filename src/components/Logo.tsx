import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" fill="#6B0F1A" />
      <path d="M32 9l19 8v13c0 12-8 21-19 25C21 51 13 42 13 30V17z" fill="none" stroke="#C9A84C" strokeWidth="3" />
      <text x="32" y="38" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="700" fontSize="17" fill="#fff">GS</text>
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="GS Hub home">
      <LogoMark />
      <span className="leading-tight">
        <span className={`block font-display text-lg font-bold ${light ? "text-white" : "text-maroon"}`}>GS Hub</span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[.18em] ${light ? "text-gold-300" : "text-gold-700"}`}>Trust the Process</span>
      </span>
    </Link>
  );
}
