-- Add new columns to profiles table for Smart RAG and enhanced features
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT 'general';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS knowledge_ratio INTEGER DEFAULT 50;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS speaking_style TEXT DEFAULT 'formal_ar';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_persona TEXT DEFAULT 'teacher';

-- Create study_plans table for personalized study schedules
CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  plan_data JSONB NOT NULL,
  duration_weeks INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on study_plans
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for study_plans
CREATE POLICY "Users can view their own study plans" 
ON public.study_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study plans" 
ON public.study_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans" 
ON public.study_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study plans" 
ON public.study_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on study_plans
CREATE TRIGGER update_study_plans_updated_at
BEFORE UPDATE ON public.study_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create avatars storage bucket for student photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);