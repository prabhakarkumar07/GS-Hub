-- 004_challenges.sql
-- Schema for Peer-to-Peer Challenges (Duels)

CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid primary key default gen_random_uuid(),
  creator_id text not null references public.profiles(id) on delete cascade,
  opponent_id text references public.profiles(id) on delete cascade,
  question_ids uuid[] not null,
  creator_score integer,
  opponent_score integer,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed')),
  created_at timestamptz not null default now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenges: public read" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "challenges: insert auth" ON public.challenges FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "challenges: update participants" ON public.challenges FOR UPDATE USING (
  creator_id = (auth.jwt()->>'sub') OR opponent_id = (auth.jwt()->>'sub')
);
