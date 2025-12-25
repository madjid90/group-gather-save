-- Table pour stocker les tentatives de réinitialisation de mot de passe
CREATE TABLE public.password_reset_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  reset_code TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  blocked_until TIMESTAMP WITH TIME ZONE,
  last_sms_sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  used BOOLEAN DEFAULT false
);

-- Index pour recherche rapide par numéro
CREATE INDEX idx_reset_attempts_phone ON public.password_reset_attempts(phone_number);

-- Index pour nettoyage des entrées expirées
CREATE INDEX idx_reset_attempts_expires ON public.password_reset_attempts(expires_at);

-- RLS - Désactivé car géré uniquement par les edge functions avec service role
ALTER TABLE public.password_reset_attempts ENABLE ROW LEVEL SECURITY;

-- Policy pour les edge functions (service role bypass RLS)
CREATE POLICY "Service role can manage reset attempts"
ON public.password_reset_attempts
FOR ALL
USING (true)
WITH CHECK (true);

-- Fonction pour nettoyer les anciennes entrées (à appeler périodiquement)
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_reset_attempts
  WHERE expires_at < now() OR used = true;
END;
$$;