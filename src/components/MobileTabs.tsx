"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./providers";
import { IconBookmark, IconChart, IconGrid, IconHome, IconNotebook, IconPlay } from "./icons";

/** Bottom tab bar for phones. Hidden while taking a quiz. */
export function MobileTabs() {
  const { t, user } = useApp();
  const path = usePathname();
  if (path.startsWith("/quiz/") || path.startsWith("/admin")) return null;
  const tabs = [
    { href: user ? "/dashboard" : "/", label: user ? t("nav_dashboard") : t("brand"), icon: user ? IconChart : IconHome },
    { href: "/practice", label: t("nav_practice"), icon: IconPlay },
    { href: "/notebook", label: t("tab_notebook"), icon: IconNotebook },
    { href: "/heatmap", label: t("nav_heatmap"), icon: IconGrid },
    { href: "/bookmarks", label: t("nav_bookmarks"), icon: IconBookmark },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-maroon/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-medium ${active ? "text-maroon" : "text-stone-500"}`}>
              <Icon className={`h-5 w-5 ${active ? "text-maroon" : ""}`} />
              <span className="max-w-full truncate px-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
