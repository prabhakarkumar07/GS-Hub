"use client";
import Link from "next/link";
import { useApp } from "@/components/providers";
import { CONTACT } from "@/components/Footer";
import { IconGlobe, IconPhone, IconPin, IconWhatsApp } from "@/components/icons";

export function About() {
  const { t, lang } = useApp();
  const hi = lang === "hi";
  return (
    <div className={hi ? "font-hindi" : ""}>
      <section className="bg-maroon text-white">
        <div className="pattern-dots">
          <div className="container-page py-14">
            <div className="text-xs font-bold uppercase tracking-[.18em] text-gold-300">Trust the Process</div>
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{t("about_title")}</h1>
            <p className="mt-4 max-w-2xl text-white/80">
              {hi
                ? "जीएस हब सिविल सर्विसेज़ क्लासेज़, राजेंद्र नगर, पटना — BPSC और UPSC की तैयारी के लिए समर्पित संस्थान। यह पोर्टल हमारी ओर से हर अभ्यर्थी के लिए मुफ़्त है: पिछले वर्षों के प्रश्न, हर विकल्प का विस्तृत हल और आपकी अपनी गलतियों पर आधारित रिवीज़न।"
                : "GS Hub Civil Services Classes, Rajendra Nagar, Patna — an institute dedicated to BPSC and UPSC preparation. This portal is our free gift to every aspirant: previous year questions, a detailed explanation for every option, and revision built around your own mistakes."}
            </p>
          </div>
        </div>
      </section>
      <section className="container-page grid gap-5 py-10 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="h-display text-xl">{hi ? "हमारी सोच" : "Our approach"}</h2>
          <ul className="mt-4 space-y-3 text-[15px] text-stone-700">
            {(hi
              ? ["PYQ ही BPSC का सबसे भरोसेमंद सिलेबस है।", "गलतियाँ ही सबसे अच्छा शिक्षक हैं — उन्हें तब तक दोहराएँ जब तक वे खत्म न हों।", "बिहार विशेष पर विशेष ध्यान — इतिहास, भूगोल, अर्थव्यवस्था और योजनाएँ।", "हिंदी और अंग्रेज़ी माध्यम के छात्रों के लिए बराबर गुणवत्ता।"]
              : ["PYQs are the most reliable syllabus for BPSC.", "Mistakes are the best teacher — revise them until they disappear.", "Special focus on Bihar — history, geography, economy and schemes.", "Equal quality for Hindi and English medium aspirants."]
            ).map((x) => <li key={x} className="flex gap-2"><span className="text-gold">◆</span>{x}</li>)}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="h-display text-xl">{hi ? "संपर्क करें" : "Contact us"}</h2>
          <ul className="mt-4 space-y-3 text-[15px]">
            <li className="flex items-center gap-3"><IconPhone className="h-5 w-5 text-maroon" /><a className="font-semibold text-maroon hover:underline" href={`tel:+${CONTACT.phoneIntl}`}>{CONTACT.phone}</a></li>
            <li className="flex items-center gap-3"><IconGlobe className="h-5 w-5 text-maroon" /><a className="hover:underline" href={`https://${CONTACT.site}`} target="_blank" rel="noopener">{CONTACT.site}</a></li>
            <li className="flex items-center gap-3"><IconPin className="h-5 w-5 text-maroon" />{t("address")}</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener" className="btn bg-[#25D366] text-white hover:bg-[#1ebe5b]"><IconWhatsApp /> {t("whatsapp")}</a>
            <a href={`tel:+${CONTACT.phoneIntl}`} className="btn-outline"><IconPhone className="h-4 w-4" /> {t("call")}</a>
          </div>
        </div>
        <div className="md:col-span-2 text-center">
          <Link href="/practice" className="btn-primary px-7 py-3.5">{t("hero_cta")}</Link>
        </div>
      </section>
    </div>
  );
}
