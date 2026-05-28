ALTER TABLE public.chat_history ADD COLUMN IF NOT EXISTS tab_mode text NOT NULL DEFAULT 'ca';
ALTER TABLE public.chat_history ALTER COLUMN corpus_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_history_user_tab ON public.chat_history(user_id, tab_mode, created_at);