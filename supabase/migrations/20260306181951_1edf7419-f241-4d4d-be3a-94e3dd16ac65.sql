
CREATE TABLE public.flashcard_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_material_id uuid REFERENCES public.uploaded_materials(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flashcards" ON public.flashcard_sets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flashcards" ON public.flashcard_sets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcards" ON public.flashcard_sets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flashcards" ON public.flashcard_sets FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_flashcard_sets_updated_at BEFORE UPDATE ON public.flashcard_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
