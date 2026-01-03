import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SEOConfigItem {
  id: string;
  config_key: string;
  config_value: string | null;
  is_active: boolean;
  updated_at: string;
}

const CONFIG_LABELS: Record<string, { label: string; description: string; placeholder: string }> = {
  ga4_measurement_id: {
    label: 'Google Analytics 4',
    description: 'Mesure du trafic et comportement utilisateur',
    placeholder: 'G-XXXXXXXXXX'
  },
  meta_pixel_id: {
    label: 'Meta Pixel (Facebook/Instagram)',
    description: 'Tracking des conversions et remarketing Meta',
    placeholder: '123456789012345'
  },
  google_ads_id: {
    label: 'Google Ads',
    description: 'Suivi des conversions publicitaires Google',
    placeholder: 'AW-XXXXXXXXX'
  },
  tiktok_pixel_id: {
    label: 'TikTok Pixel',
    description: 'Tracking des conversions TikTok Ads',
    placeholder: 'XXXXXXXXXXXXXXXXXX'
  },
  clarity_project_id: {
    label: 'Microsoft Clarity',
    description: 'Heatmaps et enregistrements de sessions',
    placeholder: 'xxxxxxxxxx'
  },
  gsc_verification: {
    label: 'Google Search Console',
    description: 'Code de vérification de propriété',
    placeholder: 'google-site-verification=...'
  }
};

export const useSEOConfig = () => {
  const [configs, setConfigs] = useState<SEOConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchConfigs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('seo_config')
        .select('*')
        .order('config_key');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching SEO configs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration SEO",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const updateConfig = async (configKey: string, value: string, isActive: boolean) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('seo_config')
        .update({ config_value: value, is_active: isActive })
        .eq('config_key', configKey);

      if (error) throw error;

      setConfigs(prev => prev.map(c => 
        c.config_key === configKey 
          ? { ...c, config_value: value, is_active: isActive }
          : c
      ));

      toast({
        title: "Sauvegardé",
        description: `Configuration ${CONFIG_LABELS[configKey]?.label || configKey} mise à jour`
      });
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleConfig = async (configKey: string) => {
    const config = configs.find(c => c.config_key === configKey);
    if (!config) return;

    await updateConfig(configKey, config.config_value || '', !config.is_active);
  };

  const getConfigLabel = (key: string) => CONFIG_LABELS[key] || { 
    label: key, 
    description: '', 
    placeholder: '' 
  };

  return {
    configs,
    loading,
    saving,
    updateConfig,
    toggleConfig,
    getConfigLabel,
    refetch: fetchConfigs
  };
};
