-- Add content column for extracted text
ALTER TABLE uploaded_materials ADD COLUMN content TEXT;

-- Create storage bucket for learning materials
INSERT INTO storage.buckets (id, name, public) VALUES ('learning-materials', 'learning-materials', false);

-- Storage RLS policies
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'learning-materials' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'learning-materials' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'learning-materials' AND (storage.foldername(name))[1] = auth.uid()::text);