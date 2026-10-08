import type { Question, Responses, QuestionStat, OptionKey } from "./types";

export type Outcome = "correct" | "wrong" | "skipped";

export interface GradedQuestion {
  question: Question;
  selected: OptionKey | null;
  outcome: Outcome;
  communityPct: number | null; // % of students who got it right (null if not enough data)
  communityAttempts: number;
}

export interface Bucket {
  id: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
}

export interface ResultSummary {
  graded: GradedQuestion[];
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  score: number;
  maxScore: number;
  accuracy: number; // correct / attempted
  bySubject: Bucket[];
  byTopic: (Bucket & { subjectId: number })[];
}

export function strengthOf(pct: number | null): "strong" | "average" | "weak" | null {
  if (pct === null || Number.isNaN(pct)) return null;
  if (pct >= 70) return "strong";
  if (pct >= 40) return "average";
  return "weak";
}

export function gradeQuiz(
  questions: Question[],
  responses: Responses,
  positive: number,
  negative: number,
  stats: Record<string, QuestionStat>,
  minAttempts: number,
): ResultSummary {
  const graded: GradedQuestion[] = questions.map((q) => {
    const selected = (responses[q.id]?.selected ?? null) as OptionKey | null;
    const outcome: Outcome = !selected ? "skipped" : selected === q.correct_option ? "correct" : "wrong";
    const st = stats[q.id];
    const enough = st && st.attempts >= Math.max(1, minAttempts);
    return {
      question: q,
      selected,
      outcome,
      communityPct: enough ? Math.round((100 * st.correct) / st.attempts) : null,
      communityAttempts: st?.attempts ?? 0,
    };
  });

  const correct = graded.filter((g) => g.outcome === "correct").length;
  const wrong = graded.filter((g) => g.outcome === "wrong").length;
  const skipped = graded.length - correct - wrong;

  const bucket = (map: Map<number, Bucket>, id: number) => {
    if (!map.has(id)) map.set(id, { id, attempted: 0, correct: 0, wrong: 0, skipped: 0, total: 0 });
    return map.get(id)!;
  };
  const subj = new Map<number, Bucket>();
  const top = new Map<number, Bucket & { subjectId: number }>();
  for (const g of graded) {
    const targets: Bucket[] = [bucket(subj, g.question.subject_id)];
    if (g.question.topic_id) {
      if (!top.has(g.question.topic_id)) top.set(g.question.topic_id, { id: g.question.topic_id, subjectId: g.question.subject_id, attempted: 0, correct: 0, wrong: 0, skipped: 0, total: 0 });
      targets.push(top.get(g.question.topic_id)!);
    }
    for (const b of targets) {
      b.total++;
      if (g.outcome === "skipped") b.skipped++;
      else { b.attempted++; if (g.outcome === "correct") b.correct++; else b.wrong++; }
    }
  }

  return {
    graded,
    correct,
    wrong,
    skipped,
    total: graded.length,
    score: Math.round((correct * positive - wrong * negative) * 100) / 100,
    maxScore: graded.length * positive,
    accuracy: correct + wrong > 0 ? Math.round((100 * correct) / (correct + wrong)) : 0,
    bySubject: [...subj.values()],
    byTopic: [...top.values()],
  };
}

export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
}

/** Consecutive-day streak (IST) ending today or yesterday. */
export function computeStreak(dates: string[]): number {
  const toDay = (d: Date) => new Date(d.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
  const days = new Set(dates.map((d) => toDay(new Date(d))));
  let cursor = new Date();
  if (!days.has(toDay(cursor))) cursor = new Date(cursor.getTime() - 86400000);
  let n = 0;
  while (days.has(toDay(cursor))) { n++; cursor = new Date(cursor.getTime() - 86400000); }
  return n;
}
