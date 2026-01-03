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
  id?: string; // Optional for editing existing pages
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

export interface BulkGenerationProgress {
  total: number;
  current: number;
  currentCity: string;
  completed: string[];
  failed: string[];
  status: 'idle' | 'generating' | 'saving' | 'done';
}

export const useLocalSeoPages = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pages, setPages] = useState<LocalSeoPage[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [bulkProgress, setBulkProgress] = useState<BulkGenerationProgress>({
    total: 0,
    current: 0,
    currentCity: '',
    completed: [],
    failed: [],
    status: 'idle'
  });
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

  const generateSingleContent = async (ville: string, serviceType?: string): Promise<GeneratedContent | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-local-seo', {
        body: { 
          ville, 
          service_type: serviceType || 'tous'
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.data;
    } catch (error) {
      console.error(`Erreur génération pour ${ville}:`, error);
      return null;
    }
  };

  const savePage = async (content: GeneratedContent, publish: boolean = false) => {
    setIsLoading(true);
    try {
      // If content has an id, update existing page
      if (content.id) {
        const { data, error } = await supabase
          .from('local_seo_pages')
          .update({
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
          .eq('id', content.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Page mise à jour",
          description: `Page SEO pour ${content.ville} mise à jour avec succès`
        });

        setGeneratedContent(null);
        await fetchPages();
        return data;
      }

      // Otherwise, insert new page
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

  const loadPageForEdit = (page: LocalSeoPage): GeneratedContent => {
    return {
      id: page.id,
      ville: page.ville,
      code_postal: page.code_postal,
      slug: page.slug,
      titre: page.titre,
      meta_description: page.meta_description || '',
      contenu_hero: page.contenu_hero || '',
      contenu_principal: page.contenu_principal || '',
      contenu_avantages: page.contenu_avantages || '',
      contenu_cta: page.contenu_cta || '',
      mots_cles: page.mots_cles || []
    };
  };

  const regenerateContent = async (page: LocalSeoPage, serviceType?: string): Promise<GeneratedContent | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-local-seo', {
        body: { 
          ville: page.ville, 
          code_postal: page.code_postal,
          service_type: serviceType || 'tous'
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Preserve the original page ID so we update instead of create
      const regenerated: GeneratedContent = {
        ...data.data,
        id: page.id
      };

      setGeneratedContent(regenerated);
      toast({
        title: "Contenu régénéré",
        description: `Nouveau contenu généré pour ${page.ville}`
      });
      return regenerated;
    } catch (error) {
      console.error('Erreur régénération:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la régénération",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const savePageSilent = async (content: GeneratedContent, publish: boolean = false): Promise<boolean> => {
    try {
      const { error } = await supabase
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
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erreur sauvegarde pour ${content.ville}:`, error);
      return false;
    }
  };

  const generateBulk = async (cities: string[], serviceType: string, publish: boolean) => {
    if (cities.length === 0) return;

    setBulkProgress({
      total: cities.length,
      current: 0,
      currentCity: '',
      completed: [],
      failed: [],
      status: 'generating'
    });

    const completed: string[] = [];
    const failed: string[] = [];

    for (let i = 0; i < cities.length; i++) {
      const city = cities[i].trim();
      if (!city) continue;

      setBulkProgress(prev => ({
        ...prev,
        current: i + 1,
        currentCity: city,
        status: 'generating'
      }));

      // Generate content
      const content = await generateSingleContent(city, serviceType);
      
      if (!content) {
        failed.push(city);
        setBulkProgress(prev => ({
          ...prev,
          failed: [...prev.failed, city]
        }));
        continue;
      }

      // Save page
      setBulkProgress(prev => ({
        ...prev,
        status: 'saving'
      }));

      const saved = await savePageSilent(content, publish);
      
      if (saved) {
        completed.push(city);
        setBulkProgress(prev => ({
          ...prev,
          completed: [...prev.completed, city]
        }));
      } else {
        failed.push(city);
        setBulkProgress(prev => ({
          ...prev,
          failed: [...prev.failed, city]
        }));
      }

      // Small delay to avoid rate limiting
      if (i < cities.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    setBulkProgress(prev => ({
      ...prev,
      status: 'done'
    }));

    toast({
      title: "Génération en lot terminée",
      description: `${completed.length} pages créées, ${failed.length} échecs`
    });

    await fetchPages();
  };

  const resetBulkProgress = () => {
    setBulkProgress({
      total: 0,
      current: 0,
      currentCity: '',
      completed: [],
      failed: [],
      status: 'idle'
    });
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
    bulkProgress,
    fetchPages,
    generateContent,
    regenerateContent,
    generateBulk,
    resetBulkProgress,
    savePage,
    loadPageForEdit,
    togglePublish,
    deletePage,
    clearGeneratedContent,
    setGeneratedContent
  };
};
