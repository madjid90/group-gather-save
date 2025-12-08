-- Create housing_profiles table for storing detailed housing information
CREATE TABLE public.housing_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Section 1: Logement
  type_logement TEXT,
  surface INTEGER,
  nombre_occupants INTEGER,
  isolation TEXT,
  mode_chauffage TEXT,
  chauffe_eau_electrique BOOLEAN,
  
  -- Section 2: Contrat électricité
  fournisseur_electricite TEXT,
  option_tarifaire TEXT,
  puissance_compteur TEXT,
  montant_facture NUMERIC,
  facture_url TEXT,
  
  -- Section 3: Internet
  type_connexion TEXT,
  fournisseur_internet TEXT,
  prix_mensuel_internet NUMERIC,
  satisfaction_internet INTEGER,
  eligible_fibre BOOLEAN,
  
  -- Section 4: Habitudes
  temps_domicile TEXT,
  equipements_energivores TEXT[],
  recharge_vehicule_electrique BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Add housing_token column to profiles for SMS link access
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS housing_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS housing_form_completed BOOLEAN DEFAULT false;

-- Create unique index on housing_token
CREATE UNIQUE INDEX IF NOT EXISTS profiles_housing_token_idx ON public.profiles(housing_token);

-- Enable RLS on housing_profiles
ALTER TABLE public.housing_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for housing_profiles
CREATE POLICY "Users can view their own housing profile"
ON public.housing_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own housing profile"
ON public.housing_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own housing profile"
ON public.housing_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all housing profiles"
ON public.housing_profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all housing profiles"
ON public.housing_profiles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_housing_profiles_updated_at
BEFORE UPDATE ON public.housing_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();