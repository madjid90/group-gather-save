-- Ajouter une politique explicite bloquant les non-admins sur export_client_mapping
-- Cette politique RESTRICTIVE s'applique en plus de la politique admin existante
CREATE POLICY "Non-admins cannot access export mappings" ON public.export_client_mapping
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));