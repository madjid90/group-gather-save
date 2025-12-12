-- Bloquer accès anonyme sur tables sensibles avec politiques explicites

-- profiles: bloquer accès anonyme
CREATE POLICY "Block anonymous access on profiles" ON public.profiles 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- housing_profiles: bloquer accès anonyme  
CREATE POLICY "Block anonymous access on housing_profiles" ON public.housing_profiles 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- sms_logs: bloquer accès anonyme
CREATE POLICY "Block anonymous access on sms_logs" ON public.sms_logs 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- user_offers: bloquer accès anonyme
CREATE POLICY "Block anonymous access on user_offers" ON public.user_offers 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- campaign_users: bloquer accès anonyme
CREATE POLICY "Block anonymous access on campaign_users" ON public.campaign_users 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- souscriptions: bloquer accès anonyme
CREATE POLICY "Block anonymous access on souscriptions" ON public.souscriptions 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- user_roles: bloquer accès anonyme
CREATE POLICY "Block anonymous access on user_roles" ON public.user_roles 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- export_client_mapping: bloquer accès anonyme
CREATE POLICY "Block anonymous access on export_client_mapping" ON public.export_client_mapping 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Restreindre admin_settings aux utilisateurs authentifiés uniquement
DROP POLICY IF EXISTS "Anyone can view admin settings" ON public.admin_settings;
CREATE POLICY "Only authenticated can view admin settings" ON public.admin_settings 
FOR SELECT USING (auth.uid() IS NOT NULL);