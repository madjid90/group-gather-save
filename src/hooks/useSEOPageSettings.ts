import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SEOPageSettings {
  id: string;
  page_url: string;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  keywords: string[] | null;
  robots: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SEORecommendation {
  id: string;
  type: 'meta_title' | 'meta_description' | 'og_title' | 'og_description' | 'keywords' | 'canonical' | 'robots';
  label: string;
  currentValue: string | null;
  suggestedValue: string;
  pageUrl: string;
  priority: 'high' | 'medium' | 'low';
  applied: boolean;
}

export function useSEOPageSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SEOPageSettings[]>([]);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('seo_page_settings')
        .select('*')
        .order('page_url');

      if (error) throw error;
      setSettings((data || []) as SEOPageSettings[]);
      return data as SEOPageSettings[];
    } catch (error: any) {
      console.error('Error fetching SEO settings:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSettingsForPage = useCallback(async (pageUrl: string): Promise<SEOPageSettings | null> => {
    try {
      const { data, error } = await supabase
        .from('seo_page_settings')
        .select('*')
        .eq('page_url', pageUrl)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as SEOPageSettings | null;
    } catch (error) {
      console.error('Error fetching page settings:', error);
      return null;
    }
  }, []);

  const applyRecommendation = useCallback(async (
    pageUrl: string,
    field: string,
    value: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if settings exist for this page
      const { data: existing } = await supabase
        .from('seo_page_settings')
        .select('id')
        .eq('page_url', pageUrl)
        .single();

      const updateData = { [field]: value, updated_at: new Date().toISOString() };

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('seo_page_settings')
          .update(updateData)
          .eq('page_url', pageUrl);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('seo_page_settings')
          .insert({
            page_url: pageUrl,
            [field]: value,
            is_active: true,
          });

        if (error) throw error;
      }

      toast({
        title: "Recommandation appliquée",
        description: `Le champ "${field}" a été mis à jour pour ${pageUrl}`,
      });

      await fetchSettings();
      return true;
    } catch (error: any) {
      console.error('Error applying recommendation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer la recommandation",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchSettings]);

  const updateSettings = useCallback(async (
    pageUrl: string,
    updates: Partial<Omit<SEOPageSettings, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data: existing } = await supabase
        .from('seo_page_settings')
        .select('id')
        .eq('page_url', pageUrl)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('seo_page_settings')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('page_url', pageUrl);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('seo_page_settings')
          .insert({
            page_url: pageUrl,
            ...updates,
            is_active: true,
          });

        if (error) throw error;
      }

      toast({
        title: "Paramètres SEO mis à jour",
        description: `Configuration sauvegardée pour ${pageUrl}`,
      });

      await fetchSettings();
      return true;
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchSettings]);

  const deleteSettings = useCallback(async (pageUrl: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('seo_page_settings')
        .delete()
        .eq('page_url', pageUrl);

      if (error) throw error;

      toast({
        title: "Paramètres supprimés",
        description: `Configuration supprimée pour ${pageUrl}`,
      });

      await fetchSettings();
      return true;
    } catch (error: any) {
      console.error('Error deleting settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les paramètres",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    isLoading,
    settings,
    fetchSettings,
    getSettingsForPage,
    applyRecommendation,
    updateSettings,
    deleteSettings,
  };
}
