"use client";
import { fetchApi } from "@/lib/api-client";
import { newId, saveSession } from "@/lib/quiz-store";
import type { AppSettings, AppUser, QuizMode, QuizSession, QuizSource } from "@/lib/types";

export interface BuildParams {
  subjectIds?: number[];
  topicIds?: number[];
  examIds?: number[];
  count: number;
  source: QuizSource;
  highPriorityOnly?: boolean;
}

export async function fetchQuizIds(p: BuildParams, clerkToken?: string | null): Promise<string[]> {
  const data = await fetchApi("/quiz/build", {
    method: "POST",
    body: JSON.stringify({
      subjectIds: p.subjectIds?.length ? p.subjectIds : null,
      topicIds: p.topicIds?.length ? p.topicIds : null,
      examIds: p.examIds?.length ? p.examIds : null,
      count: p.count,
      source: p.source,
      highPriorityOnly: !!p.highPriorityOnly,
    })
  }, clerkToken);
  
  return (data.ids as string[]) ?? [];
}

/** Creates a quiz session (DB row for logged-in users, localStorage always) and returns its id. */
export async function startQuiz(opts: {
  questionIds: string[];
  mode: QuizMode;
  source: QuizSource;
  title: string;
  config: Record<string, unknown>;
  user: AppUser | null;
  clerkToken?: string | null;
  settings: AppSettings;
}): Promise<string> {
  const id = newId();
  let positive = opts.settings.positive_marks;
  let negative = opts.settings.negative_marks;
  let timeLimit = opts.mode === "exam" ? opts.questionIds.length * opts.settings.seconds_per_question : null;
  let synced = false;

  if (opts.user) {
    const data = await fetchApi("/quiz/start", {
      method: "POST",
      body: JSON.stringify({
        id, mode: opts.mode, source: opts.source, questionIds: opts.questionIds, title: opts.title, config: opts.config
      })
    }, opts.clerkToken);
    
    if (data.attempt) {
      positive = Number(data.attempt.positive_marks);
      negative = Number(data.attempt.negative_marks);
      timeLimit = data.attempt.time_limit_sec;
      synced = true;
    }
  }

  const session: QuizSession = {
    id, title: opts.title, mode: opts.mode, source: opts.source,
    questionIds: opts.questionIds, responses: {}, currentIndex: 0,
    positiveMarks: positive, negativeMarks: negative, timeLimitSec: timeLimit,
    elapsedSec: 0, startedAt: new Date().toISOString(), synced, status: "in_progress",
  };
  saveSession(session);
  return id;
}
