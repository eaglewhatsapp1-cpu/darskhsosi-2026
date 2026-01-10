-- Add UPDATE policy for subjects table
CREATE POLICY "Users can update own subjects" 
ON public.subjects
FOR UPDATE 
USING (auth.uid() = user_id);