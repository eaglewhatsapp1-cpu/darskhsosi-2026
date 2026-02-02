-- Add study_target and learning_languages columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS study_target text,
ADD COLUMN IF NOT EXISTS learning_languages text[] DEFAULT ARRAY['ar']::text[];