"use client";
import type { QuizSession } from "./types";

const PREFIX = "gshub_quiz_";
const ACTIVE = "gshub_active_quiz";

function safe<T>(fn: () => T, fallback: T): T {
  try { return fn(); } catch { return fallback; }
}

export function saveSession(s: QuizSession) {
  safe(() => {
    localStorage.setItem(PREFIX + s.id, JSON.stringify(s));
    if (s.status === "in_progress") localStorage.setItem(ACTIVE, s.id);
    else if (localStorage.getItem(ACTIVE) === s.id) localStorage.removeItem(ACTIVE);
  }, undefined);
}

export function loadSession(id: string): QuizSession | null {
  return safe(() => {
    const raw = localStorage.getItem(PREFIX + id);
    return raw ? (JSON.parse(raw) as QuizSession) : null;
  }, null);
}

export function getActiveSession(): QuizSession | null {
  return safe(() => {
    const id = localStorage.getItem(ACTIVE);
    if (!id) return null;
    const s = loadSession(id);
    return s && s.status === "in_progress" ? s : null;
  }, null);
}

export function clearActive(id: string) {
  safe(() => { if (localStorage.getItem(ACTIVE) === id) localStorage.removeItem(ACTIVE); }, undefined);
}

/** Keep localStorage tidy: remove finished guest sessions beyond the newest 10. */
export function pruneSessions() {
  safe(() => {
    const items: { key: string; t: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      const s = JSON.parse(localStorage.getItem(key) || "null") as QuizSession | null;
      if (s?.status === "submitted") items.push({ key, t: s.submittedAt ?? s.startedAt });
    }
    items.sort((a, b) => b.t.localeCompare(a.t)).slice(10).forEach((x) => localStorage.removeItem(x.key));
  }, undefined);
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
