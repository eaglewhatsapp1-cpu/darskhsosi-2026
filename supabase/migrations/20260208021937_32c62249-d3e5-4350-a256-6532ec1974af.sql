-- Add missing RLS policies for better data control

-- Allow users to delete their own profile (GDPR compliance)
CREATE POLICY "Users can delete own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow users to update their own uploaded materials metadata
CREATE POLICY "Users can update own materials" 
ON public.uploaded_materials 
FOR UPDATE 
USING (auth.uid() = user_id);