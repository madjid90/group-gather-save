-- Create table for SEO/tracking configuration
CREATE TABLE public.seo_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_config ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write
CREATE POLICY "Admins can manage SEO config" 
ON public.seo_config 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public can read active configs (for tracking scripts)
CREATE POLICY "Public can read active SEO config" 
ON public.seo_config 
FOR SELECT 
USING (is_active = true);

-- Insert default config entries
INSERT INTO public.seo_config (config_key, config_value, is_active) VALUES
  ('ga4_measurement_id', '', false),
  ('meta_pixel_id', '', false),
  ('google_ads_id', '', false),
  ('tiktok_pixel_id', '', false),
  ('clarity_project_id', '', false),
  ('gsc_verification', '', false);

-- Trigger for updated_at
CREATE TRIGGER update_seo_config_updated_at
BEFORE UPDATE ON public.seo_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();