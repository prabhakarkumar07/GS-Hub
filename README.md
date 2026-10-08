# GS Hub BPSC PYQ Portal

A free, bilingual (Hindi / English) practice portal for BPSC Prelims previous-year questions, built for **GS Hub Civil Services Classes, Rajendra Nagar, Patna** — *Trust the Process*.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage) · deploys on Vercel.

---

## What's inside

| Area | Where | Notes |
|---|---|---|
| Home | `/` | Hero, live PYQ counter (refreshed every 5 min), feature highlights |
| Login / Signup | `/login` | Email + password, Google, optional phone OTP |
| Quiz Builder | `/practice` | 5 steps: subjects → topics (Select All) → year/exam → 10/20/30/custom (≤150) → Practice or Exam mode. Also: questions from *My Mistakes* / *My Bookmarks*, High-Priority only |
| Quiz | `/quiz/[id]` | Practice: answer + full solution immediately. Exam: timer, palette (answered / not answered / marked for review / not visited), BPSC marking, auto-submit at 0:00. Auto-saves every change (browser + database) and resumes after a crash or on another device |
| Result | `/result/[id]` | Score, correct/wrong/skipped, accuracy, time; "Questions that impacted your score" (e.g. *91% solved this — you missed it*, *Only 15% got this right*); subject- and topic-wise strong/average/weak; per-question you-vs-everyone bars; full solutions with option-wise vote share |
| Mistake Notebook | `/notebook` | Every wrong answer saved automatically, with times-missed count; filters by subject/topic/High Priority; revise view; Smart Quiz from mistakes; auto-clears when answered correctly later (✓ *Cleared from your Mistake Notebook*) |
| Heat Map | `/heatmap` | Subject tiles red/yellow/green by accuracy → click for topic tiles; "Focus on X and Y next" |
| Bookmarks | `/bookmarks` | Bookmark any question from quiz/result/notebook; launch a quiz from bookmarks |
| Dashboard | `/dashboard` | Resume last quiz, streak, overall accuracy, accuracy trend chart, quiz history, quick links |
| About | `/about` | Contact, WhatsApp button |
| Admin | `/admin` | Analytics (users, DAU, most-missed), question CRUD with rich-text editor (tables, images, sub/superscript), Excel/CSV bulk upload, subjects/topics/exams, marking settings, feedback inbox |
| Feedback | every page | Floating button → stored in `feedback` table |

**Guests** can practise everything without signing up (progress lives in their browser). Signing up is only needed to save results, the Mistake Notebook, bookmarks and the heat map.

---

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com) (region: **Mumbai, ap-south-1** is closest to Patna).
2. Open **SQL Editor** and run, in order:
   1. `supabase/migrations/001_schema.sql` — tables, row-level security, scoring & analytics functions
   2. `supabase/migrations/002_storage.sql` — public `question-images` bucket (admin upload only)
   3. `supabase/seed.sql` — 11 exams (56th–71st), 8 subjects with topics, **30 sample bilingual questions** + 1 dropped example
3. **Settings → API**: copy the *Project URL* and *anon public key*.

> The seed questions are **BPSC-style samples written for testing** (marked "Sample" in the UI, `source = 'sample'`). They are tagged to exams only so the year filter can be tested — they are not verified PYQs. Before launch:
> ```sql
> delete from public.questions where source = 'sample';
> ```

### Auth providers (Supabase → Authentication)

- **URL Configuration**: Site URL = your domain (e.g. `https://pyq.gshubsite.com`); add `https://pyq.gshubsite.com/auth/callback` and `http://localhost:3000/auth/callback` to *Redirect URLs*.
- **Email**: on by default. Keep "Confirm email" on for production.
- **Google**: create an OAuth client in Google Cloud Console (authorised redirect URI = `https://<project>.supabase.co/auth/v1/callback`), paste client ID/secret into Supabase → Providers → Google.
- **Phone OTP (optional)**: enable Phone provider with an SMS gateway (Twilio / MessageBird / Vonage / TextLocal), then set `NEXT_PUBLIC_ENABLE_PHONE_AUTH=true`. Indian SMS needs DLT registration with your gateway.

### Make yourself admin

Sign up on the site once, then in SQL Editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

The **Admin** link appears in the header after the next page load.

---

## 2. Run locally

```bash
cp .env.example .env.local      # fill in the Supabase URL + anon key
npm install
npm run dev                     # http://localhost:3000
```

## 3. Deploy on Vercel

1. Push this folder to a GitHub repo → **Import** in Vercel (framework auto-detected).
2. Add the environment variables from `.env.example` (`NEXT_PUBLIC_SITE_URL` = your production URL).
3. Deploy. Add the domain in Vercel, and the same domain to Supabase redirect URLs.

---

## Adding questions

**One at a time:** Admin → Questions → *Add question*. Use **⊞ Table** for Match List-I/List-II, **1.** for statement-type questions, **🖼 Image** for maps/diagrams (uploaded to Supabase Storage). Choose 4 options, or 5 (A–E) with one-click "More than one of the above" / "None of the above" for the 67th-onwards pattern. *Show student preview* renders it exactly as students will see it, in either language.

**In bulk:** Admin → Bulk upload. Use `docs/upload-template.csv` (or *Download template*). Columns:

`Year, Exam, Subject, Topic, Question_En, Question_Hi, Option_A_En, Option_A_Hi … Option_E_En, Option_E_Hi, Answer, Solution_En, Solution_Hi, Difficulty, Is_Dropped, Theme, High_Priority`

- `Subject` must match an existing subject (English or Hindi name). Unknown `Topic` / `Exam` values are created automatically (can be switched off).
- `Answer` = A–E (or 1–5). `Difficulty` = easy / medium / hard. `Is_Dropped`, `High_Priority` = Yes/No.
- Plain text becomes paragraphs; HTML (e.g. a `<table>`) is kept.
- Rows with errors are shown and skipped; valid rows import in batches of 100.
- Save Excel as **CSV UTF-8** if Hindi text looks garbled, or upload the `.xlsx` directly.

**Dropped questions:** tick *Dropped by BPSC* (or *Mark dropped* in the list). They stay in the database but never appear in any quiz, and the home-page count excludes them.

**High Priority:** a question is High Priority if staff tick it, **or** its `Theme` tag (e.g. `champaran`, `kosi`, `deficits`) appears in 2+ different exams — i.e. a repeated theme. Students can filter the Notebook and quiz builder to High Priority only.

---

## How the data model works

| Table | Purpose |
|---|---|
| `profiles` | one row per user, `role` = student / admin |
| `exams`, `subjects`, `topics` | taxonomy. `exams.category` = pyq / current_affairs / test_series / other |
| `questions` | bilingual HTML, `options` JSON (`[{key, en, hi}]`), `correct_option`, `is_dropped`, `theme`, `source` |
| `app_settings` | single row: +marks, −marks, seconds per question (exam timer), minimum students before "% solved" is shown |
| `quiz_attempts` | one per quiz: question order, live responses (auto-save), marking snapshot, final score |
| `attempt_answers` | one per answered question — the source for heat map, comparisons and analytics |
| `mistakes` | the live Mistake Notebook (`times_missed`, `last_selected`) |
| `bookmarks`, `feedback` | as named |

Scoring and the Notebook are handled **inside Postgres** (`submit_attempt`, `record_practice_answer`), so a student can't edit their own score or notebook. Community "% solved" uses each student's **first** attempt at a question so repeat practice doesn't inflate it. Marking is snapshotted per quiz, so changing −0.33 to −0.25 later never rewrites old results.

**Row-level security:** students can read/write only their own attempts, answers, mistakes and bookmarks; questions and taxonomy are public-read, admin-write; feedback is insert-only for students. Students can't change their own role or quiz scores (column-level grants).

### Extending to Current Affairs and a Test Series

The engine is generic. Create an exam with category `current_affairs` (e.g. "CA — October 2026") or `test_series` ("Prelims Test 01"), add questions with that exam and source, and they flow through the same builder, result analysis, Notebook and heat map. A fixed-paper test is just a quiz whose `question_ids` you fix in order — `startQuiz()` in `src/app/practice/startQuiz.ts` already accepts any list of IDs.

---

## Project layout

```
src/
  app/                 pages (App Router)
    practice/          quiz builder + startQuiz helper
    quiz/[id]/         quiz runner (practice & exam)
    result/[id]/       result + comparative analysis
    notebook/ heatmap/ bookmarks/ dashboard/ about/ login/
    admin/             analytics, questions (+ editor), upload, taxonomy, settings, feedback
    auth/callback/     OAuth & email-link handler
  components/          header, footer, feedback button, question renderer, rich editor, charts
  lib/                 i18n dictionary, scoring, quiz auto-save, Supabase clients, types
  middleware.ts        session refresh + login redirect for private pages
supabase/
  migrations/          001_schema.sql, 002_storage.sql
  seed.sql             generated from scripts/seed-data.mjs (node scripts/generate-seed.mjs)
docs/upload-template.csv
```

UI text lives in `src/lib/i18n.ts` (one English and one Hindi dictionary); the language choice is remembered per device.

Contact: **8287417384** · **gshubsite.com** · Rajendra Nagar, Patna
