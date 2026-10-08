"use client";
import DOMPurify from "dompurify";

const CONFIG = {
  ALLOWED_TAGS: ["p", "br", "b", "strong", "i", "em", "u", "s", "sub", "sup", "ul", "ol", "li", "table", "thead", "tbody", "tr", "th", "td", "img", "span", "div", "h3", "h4", "blockquote", "code", "hr", "colgroup", "col"],
  ALLOWED_ATTR: ["src", "alt", "title", "colspan", "rowspan", "width", "height", "style", "class"],
};

/** Sanitise rich-text HTML coming from the database before rendering. */
export function sanitize(html: string | null | undefined): string {
  if (!html) return "";
  if (typeof window === "undefined") return html.replace(/<[^>]*>/g, " ");
  return DOMPurify.sanitize(html, CONFIG) as unknown as string;
}

/** Plain-text preview of an HTML string. */
export function stripHtml(html: string | null | undefined, max = 140): string {
  const t = (html ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

/** Turn plain text from a spreadsheet into simple HTML paragraphs (leave HTML untouched). */
export function textToHtml(text: string | null | undefined): string {
  const t = (text ?? "").trim();
  if (!t) return "";
  if (/<[a-z][\s\S]*>/i.test(t)) return t;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return t.split(/\n{2,}/).map((para) => `<p>${esc(para).replace(/\n/g, "<br>")}</p>`).join("");
}
