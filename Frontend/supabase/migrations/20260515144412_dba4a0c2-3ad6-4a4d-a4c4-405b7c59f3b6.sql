
CREATE TABLE public.corpora (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  dify_dataset_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.corpora ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own corpora select" ON public.corpora FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own corpora insert" ON public.corpora FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own corpora update" ON public.corpora FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own corpora delete" ON public.corpora FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_corpora_user ON public.corpora(user_id);

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corpus_id UUID NOT NULL REFERENCES public.corpora(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  size_bytes BIGINT,
  dify_document_id TEXT,
  status TEXT NOT NULL DEFAULT 'indexing',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own docs select" ON public.documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.corpora c WHERE c.id = documents.corpus_id AND c.user_id = auth.uid())
);
CREATE POLICY "own docs insert" ON public.documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.corpora c WHERE c.id = documents.corpus_id AND c.user_id = auth.uid())
);
CREATE POLICY "own docs update" ON public.documents FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.corpora c WHERE c.id = documents.corpus_id AND c.user_id = auth.uid())
);
CREATE POLICY "own docs delete" ON public.documents FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.corpora c WHERE c.id = documents.corpus_id AND c.user_id = auth.uid())
);
CREATE INDEX idx_documents_corpus ON public.documents(corpus_id);

CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corpus_id UUID NOT NULL REFERENCES public.corpora(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  citations_json JSONB,
  dify_conversation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chat select" ON public.chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own chat insert" ON public.chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own chat delete" ON public.chat_history FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_chat_corpus ON public.chat_history(corpus_id, created_at);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_corpora_updated_at BEFORE UPDATE ON public.corpora
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
