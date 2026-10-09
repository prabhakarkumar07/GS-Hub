-- 005_live_exams.sql
-- Schema for Scheduled Live Mock Exams

CREATE TABLE IF NOT EXISTS public.live_exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  question_ids uuid[] not null,
  duration_minutes integer not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_published boolean default false,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.live_exam_registrations (
  id uuid primary key default gen_random_uuid(),
  live_exam_id uuid not null references public.live_exams(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  registered_at timestamptz not null default now(),
  started_at timestamptz,
  submitted_at timestamptz,
  score integer,
  UNIQUE(live_exam_id, user_id)
);

ALTER TABLE public.live_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_exam_registrations ENABLE ROW LEVEL SECURITY;

-- Admins can do everything. Users can only read published exams.
CREATE POLICY "live_exams: public read published" ON public.live_exams FOR SELECT USING (is_published = true);

CREATE POLICY "live_exam_registrations: read own" ON public.live_exam_registrations FOR SELECT USING (user_id = auth.jwt()->>'sub');
CREATE POLICY "live_exam_registrations: insert own" ON public.live_exam_registrations FOR INSERT WITH CHECK (user_id = auth.jwt()->>'sub');
CREATE POLICY "live_exam_registrations: update own" ON public.live_exam_registrations FOR UPDATE USING (user_id = auth.jwt()->>'sub');
