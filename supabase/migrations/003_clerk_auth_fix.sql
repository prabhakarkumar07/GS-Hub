-- =====================================================================
-- Migration: Clerk Auth Schema Fix
-- This migration updates the user ID columns to support Clerk's
-- string-based user IDs instead of Supabase Auth's UUIDs.
-- =====================================================================

-- 1. Drop the foreign key constraints that tie user IDs to auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_user_id_fkey;
ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;
ALTER TABLE public.notebook_entries DROP CONSTRAINT IF EXISTS notebook_entries_user_id_fkey;

-- 2. Change the data type of the user ID columns from UUID to TEXT
ALTER TABLE public.profiles ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.quiz_attempts ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.bookmarks ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.notebook_entries ALTER COLUMN user_id TYPE text USING user_id::text;

-- 3. Drop the Supabase handle_new_user trigger
-- since Clerk handles user creation and we now do it manually in the frontend.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
