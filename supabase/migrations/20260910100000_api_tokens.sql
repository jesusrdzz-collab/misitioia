-- API Tokens: personal access tokens con Bearer auth para que ChatGPT/Claude/Zapier
-- controlen los sitios desde afuera. Plaintext NUNCA se guarda: sólo SHA-256.
CREATE TABLE IF NOT EXISTS public.api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  token_prefix TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read','write']::TEXT[] NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS api_tokens_user_id_idx ON public.api_tokens(user_id);
CREATE INDEX IF NOT EXISTS api_tokens_token_hash_idx ON public.api_tokens(token_hash);
CREATE INDEX IF NOT EXISTS api_tokens_token_prefix_idx ON public.api_tokens(token_prefix);

ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own tokens" ON public.api_tokens;
CREATE POLICY "Users manage own tokens" ON public.api_tokens
  FOR ALL USING (auth.uid() = user_id);
