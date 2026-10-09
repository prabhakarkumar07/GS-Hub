-- Add subscription tier to profiles
ALTER TABLE public.profiles 
ADD COLUMN subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium'));

-- Add is_premium flag to exams
ALTER TABLE public.exams 
ADD COLUMN is_premium boolean NOT NULL DEFAULT false;

-- (Optional) If you want to make some exams premium immediately, you can do it here.
-- For example, making the 70th and 71st BPSC exams premium:
-- UPDATE public.exams SET is_premium = true WHERE short_name IN ('70th', '71st');
