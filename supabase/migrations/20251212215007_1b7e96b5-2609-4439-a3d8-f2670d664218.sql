-- Supprimer les politiques redondantes qui ne font que vérifier auth.uid() IS NOT NULL
-- Les politiques existantes (Users can view their own...) sont suffisantes

DROP POLICY IF EXISTS "Block anonymous access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block anonymous access on housing_profiles" ON public.housing_profiles;
DROP POLICY IF EXISTS "Block anonymous access on sms_logs" ON public.sms_logs;
DROP POLICY IF EXISTS "Block anonymous access on user_offers" ON public.user_offers;
DROP POLICY IF EXISTS "Block anonymous access on campaign_users" ON public.campaign_users;
DROP POLICY IF EXISTS "Block anonymous access on souscriptions" ON public.souscriptions;
DROP POLICY IF EXISTS "Block anonymous access on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Block anonymous access on export_client_mapping" ON public.export_client_mapping;

-- Restreindre campaign_settings aux utilisateurs authentifiés
DROP POLICY IF EXISTS "Anyone can view campaign settings" ON public.campaign_settings;
CREATE POLICY "Authenticated users can view campaign settings" ON public.campaign_settings 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Restreindre campaign_timeline aux utilisateurs authentifiés
DROP POLICY IF EXISTS "Anyone can view campaign timeline" ON public.campaign_timeline;
CREATE POLICY "Authenticated users can view campaign timeline" ON public.campaign_timeline 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Restreindre campaigns aux utilisateurs authentifiés
DROP POLICY IF EXISTS "Anyone can view campaigns" ON public.campaigns;
CREATE POLICY "Authenticated users can view campaigns" ON public.campaigns 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Restreindre groupements aux utilisateurs authentifiés
DROP POLICY IF EXISTS "Anyone can view groupements" ON public.groupements;
CREATE POLICY "Authenticated users can view groupements" ON public.groupements 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Restreindre stats_ville aux utilisateurs authentifiés
DROP POLICY IF EXISTS "Anyone can view city stats" ON public.stats_ville;
CREATE POLICY "Authenticated users can view city stats" ON public.stats_ville 
FOR SELECT USING (auth.uid() IS NOT NULL);