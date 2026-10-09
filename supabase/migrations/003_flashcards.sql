-- 003_flashcards.sql
-- Add Spaced Repetition (SM-2) fields to mistakes table

ALTER TABLE public.mistakes
ADD COLUMN IF NOT EXISTS repetition integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS interval integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ease_factor numeric DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS next_review_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_mistakes_next_review ON public.mistakes(user_id, next_review_at);

-- Allow users to update their own flashcard SM-2 stats
CREATE POLICY "mistakes: update own" ON public.mistakes FOR UPDATE USING (user_id = auth.jwt()->>'sub');
