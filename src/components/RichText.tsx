"use client";
import { useEffect, useState } from "react";
import { sanitize } from "@/lib/html";

/** Renders sanitised rich-text HTML (tables, images, sub/sup). */
export function RichText({ html, className = "" }: { html: string | null | undefined; className?: string }) {
  const [clean, setClean] = useState<string>("");
  useEffect(() => { setClean(sanitize(html)); }, [html]);
  return <div className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}
