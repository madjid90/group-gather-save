import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LocalSeoPage {
  id: string;
  ville: string;
  code_postal: string | null;
  slug: string;
  titre: string;
  meta_description: string | null;
  contenu_hero: string | null;
  contenu_principal: string | null;
  contenu_avantages: string | null;
  contenu_cta: string | null;
  mots_cles: string[] | null;
  publie: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneratedContent {
  ville: string;
  code_postal: string | null;
  slug: string;
  titre: string;
  meta_description: string;
  contenu_hero: string;
  contenu_principal: string;
  contenu_avantages: string;
  contenu_cta: string;
  mots_cles: string[];
}

export const useLocalSeoPages = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pages, setPages] = useState<LocalSeoPage[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const { toast } = useToast();

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('local_seo_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Erreur chargement pages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les pages SEO locales",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateContent = async (ville: string, codePostal?: string, serviceType?: string) => {
    setIsGenerating(true);
    setGeneratedContent(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-local-seo', {
        body: { 
          ville, 
          code_postal: codePostal,
          service_type: serviceType || 'tous'
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setGeneratedContent(data.data);
      toast({
        title: "Contenu généré",
        description: `Page SEO pour ${ville} générée avec succès`
      });
      return data.data;
    } catch (error) {
      console.error('Erreur génération:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la génération",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const savePage = async (content: GeneratedContent, publish: boolean = false) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('local_seo_pages')
        .insert({
          ville: content.ville,
          code_postal: content.code_postal,
          slug: content.slug,
          titre: content.titre,
          meta_description: content.meta_description,
          contenu_hero: content.contenu_hero,
          contenu_principal: content.contenu_principal,
          contenu_avantages: content.contenu_avantages,
          contenu_cta: content.contenu_cta,
          mots_cles: content.mots_cles,
          publie: publish
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: publish ? "Page publiée" : "Page sauvegardée",
        description: `Page SEO pour ${content.ville} ${publish ? 'publiée' : 'enregistrée en brouillon'}`
      });

      setGeneratedContent(null);
      await fetchPages();
      return data;
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la page",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublish = async (id: string, publie: boolean) => {
    try {
      const { error } = await supabase
        .from('local_seo_pages')
        .update({ publie })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: publie ? "Page publiée" : "Page dépubliée",
        description: `La page a été ${publie ? 'publiée' : 'retirée'}`
      });

      await fetchPages();
    } catch (error) {
      console.error('Erreur toggle:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };

  const deletePage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('local_seo_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Page supprimée",
        description: "La page a été supprimée"
      });

      await fetchPages();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la page",
        variant: "destructive"
      });
    }
  };

  const clearGeneratedContent = () => {
    setGeneratedContent(null);
  };

  return {
    pages,
    isLoading,
    isGenerating,
    generatedContent,
    fetchPages,
    generateContent,
    savePage,
    togglePublish,
    deletePage,
    clearGeneratedContent
  };
};
