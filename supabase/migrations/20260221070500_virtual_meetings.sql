-- Create virtual meetings table
CREATE TABLE IF NOT EXISTS public.virtual_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  meeting_link TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration TEXT DEFAULT '45m',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.virtual_meetings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active meetings" 
ON public.virtual_meetings FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create their own meetings" 
ON public.virtual_meetings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meetings" 
ON public.virtual_meetings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meetings" 
ON public.virtual_meetings FOR DELETE 
USING (auth.uid() = user_id);
