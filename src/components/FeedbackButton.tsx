"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "./providers";
import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { IconChat, IconX } from "./icons";

export function FeedbackButton() {
  const { t, user } = useApp();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"feedback" | "feature" | "bug">("feedback");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 3 || !isSupabaseConfigured) return;
    setState("sending");
    const { error } = await getSupabase().from("feedback").insert({
      kind, message: message.trim(), contact: contact.trim() || null, page: path, user_id: user?.id ?? null,
    });
    setState(error ? "error" : "done");
    if (!error) { setMessage(""); setContact(""); }
  };

  const inQuiz = path.startsWith("/quiz/");
  return (
    <>
      <button
        onClick={() => { setOpen(true); setState("idle"); }}
        className={`fixed right-3 z-40 flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-2.5 text-sm font-semibold text-maroon-900 shadow-lg ring-1 ring-maroon/10 hover:bg-gold-300 ${inQuiz ? "bottom-20 lg:bottom-5" : "bottom-20 lg:bottom-5"}`}
        aria-label={t("feedback")}
      >
        <IconChat className="h-4 w-4" /> <span className="hidden sm:inline">{t("feedback")}</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="h-display text-lg">{t("feedback_title")}</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-stone-500 hover:bg-stone-100" aria-label={t("cancel")}><IconX /></button>
            </div>
            {state === "done" ? (
              <p className="rounded-xl bg-green-50 p-4 text-green-800">{t("feedback_thanks")}</p>
            ) : (
              <form onSubmit={send} className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(["feedback", "feature", "bug"] as const).map((k) => (
                    <button type="button" key={k} onClick={() => setKind(k)} className={kind === k ? "chip-on" : "chip-off"}>
                      {t(`feedback_kind_${k}` as const)}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="label" htmlFor="fb-msg">{t("feedback_msg")}</label>
                  <textarea id="fb-msg" className="input min-h-[110px]" maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                <div>
                  <label className="label" htmlFor="fb-contact">{t("feedback_contact")}</label>
                  <input id="fb-contact" className="input" maxLength={120} value={contact} onChange={(e) => setContact(e.target.value)} />
                </div>
                {state === "error" && <p className="text-sm text-red-700">{t("error")}</p>}
                {!isSupabaseConfigured && <p className="text-sm text-amber-700">{t("not_configured")}</p>}
                <button className="btn-primary w-full" disabled={state === "sending" || message.trim().length < 3}>{state === "sending" ? t("saving") : t("send")}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
