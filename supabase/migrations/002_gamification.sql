-- 002_gamification.sql
-- Add Gamification Fields to Profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS quizzes_taken integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS correct_answers integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_answers integer DEFAULT 0;

-- Create User Badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  unique(user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_badges: read public" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "user_badges: admin write" ON public.user_badges FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Trigger to update Profile Stats automatically upon Quiz Submission
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'submitted' AND OLD.status = 'in_progress' THEN
    UPDATE public.profiles
    SET 
      total_score = coalesce(total_score, 0) + coalesce(NEW.score, 0),
      quizzes_taken = coalesce(quizzes_taken, 0) + 1,
      correct_answers = coalesce(correct_answers, 0) + coalesce(NEW.correct_count, 0),
      total_answers = coalesce(total_answers, 0) + coalesce(NEW.total_count, 0)
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_profile_stats ON public.quiz_attempts;
CREATE TRIGGER trg_update_profile_stats
AFTER UPDATE ON public.quiz_attempts
FOR EACH ROW EXECUTE FUNCTION public.update_profile_stats();
