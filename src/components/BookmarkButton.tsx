"use client";
import { useRouter } from "next/navigation";
import { useApp } from "./providers";
import { IconBookmark } from "./icons";
import { fetchApi } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";

/** Toggle bookmark. `bookmarked` state is owned by the parent so lists stay in sync. */
export function BookmarkButton({ questionId, bookmarked, onChange, size = "md" }: {
  questionId: string; bookmarked: boolean; onChange: (v: boolean) => void; size?: "sm" | "md";
}) {
  const { t, user } = useApp();
  const router = useRouter();
  const { getToken } = useAuth();
  const toggle = async () => {
    if (!user) { router.push("/login?next=" + encodeURIComponent(window.location.pathname)); return; }
    onChange(!bookmarked); // optimistic
    try {
      const token = await getToken({ template: "supabase" });
      await fetchApi("/user/bookmarks/toggle", {
        method: "POST",
        body: JSON.stringify({ questionId, isBookmarked: bookmarked })
      }, token);
    } catch (error) {
      onChange(bookmarked);
    }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={bookmarked}
      title={bookmarked ? t("bookmarked") : t("bookmark")}
      className={`inline-flex items-center gap-1.5 rounded-lg border transition ${size === "sm" ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-sm"} ${bookmarked ? "border-gold bg-gold-50 text-gold-700" : "border-maroon/15 bg-white text-stone-500 hover:text-maroon"}`}
    >
      <IconBookmark filled={bookmarked} className={size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]"} />
      <span className="hidden sm:inline">{bookmarked ? t("bookmarked") : t("bookmark")}</span>
    </button>
  );
}
