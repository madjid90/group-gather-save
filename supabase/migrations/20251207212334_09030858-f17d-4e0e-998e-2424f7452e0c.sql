-- Enum for user status
CREATE TYPE public.user_status AS ENUM ('inscrit', 'offre_envoyee', 'clic', 'souscription');

-- Enum for contract type
CREATE TYPE public.contract_type AS ENUM ('electricite', 'internet', 'les_deux');

-- Enum for offer type
CREATE TYPE public.offer_type AS ENUM ('electricite', 'internet', 'combo');

-- Enum for groupement status
CREATE TYPE public.groupement_status AS ENUM ('en_attente', 'negociation', 'offre_disponible', 'termine');

-- Enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('en_attente', 'validee', 'annulee');

-- Enum for SMS status
CREATE TYPE public.sms_status AS ENUM ('envoye', 'delivre', 'echec');

-- Enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  code_postal TEXT,
  ville TEXT,
  contrats contract_type DEFAULT 'les_deux',
  statut user_status DEFAULT 'inscrit',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Groupements table
CREATE TABLE public.groupements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ville TEXT NOT NULL,
  code_postal TEXT NOT NULL,
  membres INTEGER DEFAULT 0,
  economie_totale DECIMAL(10,2) DEFAULT 0,
  date_limite TIMESTAMP WITH TIME ZONE,
  statut groupement_status DEFAULT 'en_attente',
  offre_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offres table
CREATE TABLE public.offres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fournisseur TEXT NOT NULL,
  type offer_type NOT NULL,
  details_tarifs JSONB,
  economie_estimee DECIMAL(10,2),
  lien_affilie TEXT,
  commission DECIMAL(5,2),
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to groupements for offre_id
ALTER TABLE public.groupements 
ADD CONSTRAINT fk_groupements_offre 
FOREIGN KEY (offre_id) REFERENCES public.offres(id) ON DELETE SET NULL;

-- Souscriptions table
CREATE TABLE public.souscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  offre_id UUID REFERENCES public.offres(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  statut subscription_status DEFAULT 'en_attente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS logs table
CREATE TABLE public.sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  statut sms_status DEFAULT 'envoye',
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stats ville table
CREATE TABLE public.stats_ville (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ville TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  membres_total INTEGER DEFAULT 0,
  nouveaux_inscrits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campagnes table for admin campaigns
CREATE TABLE public.campagnes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  description TEXT,
  date_debut TIMESTAMP WITH TIME ZONE,
  date_fin TIMESTAMP WITH TIME ZONE,
  groupement_id UUID REFERENCES public.groupements(id) ON DELETE SET NULL,
  offre_id UUID REFERENCES public.offres(id) ON DELETE SET NULL,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groupements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats_ville ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campagnes ENABLE ROW LEVEL SECURITY;

-- Function to check user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for groupements (public read for landing page)
CREATE POLICY "Anyone can view groupements"
  ON public.groupements FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage groupements"
  ON public.groupements FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for offres (public read for users to see offers)
CREATE POLICY "Authenticated users can view active offers"
  ON public.offres FOR SELECT
  TO authenticated
  USING (actif = true);

CREATE POLICY "Admins can manage offers"
  ON public.offres FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for souscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.souscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.souscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.souscriptions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage subscriptions"
  ON public.souscriptions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for sms_logs
CREATE POLICY "Users can view their own SMS logs"
  ON public.sms_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all SMS logs"
  ON public.sms_logs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for stats_ville (public read)
CREATE POLICY "Anyone can view city stats"
  ON public.stats_ville FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage city stats"
  ON public.stats_ville FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for campagnes
CREATE POLICY "Authenticated users can view active campaigns"
  ON public.campagnes FOR SELECT
  TO authenticated
  USING (actif = true);

CREATE POLICY "Admins can manage campaigns"
  ON public.campagnes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, prenom, nom, email, telephone, code_postal, ville, contrats)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'prenom', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'nom', ''),
    NEW.email,
    NEW.raw_user_meta_data ->> 'telephone',
    NEW.raw_user_meta_data ->> 'code_postal',
    NEW.raw_user_meta_data ->> 'ville',
    COALESCE((NEW.raw_user_meta_data ->> 'contrats')::contract_type, 'les_deux')
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groupements_updated_at
  BEFORE UPDATE ON public.groupements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offres_updated_at
  BEFORE UPDATE ON public.offres
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campagnes_updated_at
  BEFORE UPDATE ON public.campagnes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment groupement members when user signs up in a city
CREATE OR REPLACE FUNCTION public.increment_groupement_members()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Update or create groupement for the user's city
  INSERT INTO public.groupements (ville, code_postal, membres)
  VALUES (NEW.ville, NEW.code_postal, 1)
  ON CONFLICT (ville, code_postal) DO UPDATE
  SET membres = groupements.membres + 1,
      updated_at = NOW();
  
  -- Update stats for today
  INSERT INTO public.stats_ville (ville, date, membres_total, nouveaux_inscrits)
  VALUES (NEW.ville, CURRENT_DATE, 1, 1)
  ON CONFLICT (ville, date) DO UPDATE
  SET membres_total = stats_ville.membres_total + 1,
      nouveaux_inscrits = stats_ville.nouveaux_inscrits + 1;
  
  RETURN NEW;
END;
$$;

-- Add unique constraint for groupements on ville + code_postal
ALTER TABLE public.groupements ADD CONSTRAINT groupements_ville_code_postal_unique UNIQUE (ville, code_postal);

-- Add unique constraint for stats_ville on ville + date
ALTER TABLE public.stats_ville ADD CONSTRAINT stats_ville_ville_date_unique UNIQUE (ville, date);

-- Trigger for incrementing groupement members
CREATE TRIGGER on_profile_created_increment_groupement
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.ville IS NOT NULL)
  EXECUTE FUNCTION public.increment_groupement_members();