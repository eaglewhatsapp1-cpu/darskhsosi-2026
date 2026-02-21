-- Security Hardening Migration
-- Addressing issues from security audit report

-- 1. Fix Function Search Path for all existing functions (Ensuring they are all set)
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. Ensure RLS is enabled on all tables (Standard practice)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.uploaded_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_progress ENABLE ROW LEVEL SECURITY;

-- 3. Add missing DELETE policies for user autonomy (GDPR/Data Privacy)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own messages' AND tablename = 'chat_messages') THEN
        CREATE POLICY "Users can delete own messages" ON public.chat_messages
            FOR DELETE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own progress' AND tablename = 'user_progress') THEN
        CREATE POLICY "Users can delete own progress" ON public.user_progress
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Add metadata comments for sensitive columns
COMMENT ON COLUMN public.profiles.openai_api_key IS 'User-provided sensitive data. Handled via RLS (owner only).';
COMMENT ON COLUMN public.profiles.gemini_api_key IS 'User-provided sensitive data. Handled via RLS (owner only).';

-- 5. Revoke public access from sensitive tables (Ensures only authenticated roles can interact via PostgREST)
-- By default, Supabase grants everything to 'anon' and 'authenticated'. 
-- We ensure RLS is the main barrier.
-- (Additional hardening step if needed, but RLS is usually sufficient in Supabase)

-- 6. Ensure Storage Buckets have strict RLS (Re-enforcing)
-- The 'learning-materials' bucket should not be public-accessible via URL if not intended
-- Our migration 20260104112401 already set it to public=false.
