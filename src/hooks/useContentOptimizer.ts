import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContentItem {
  id: string;
  type: 'heading' | 'paragraph' | 'cta' | 'meta';
  content: string;
  selector?: string;
}

export interface OptimizedItem {
  id: string;
  type: string;
  original: string;
  optimized: string;
  changes: string[];
  seoScore: number;
}

export interface SingleOptimization {
  original: string;
  optimized: string;
  changes: string[];
  seoScore: number;
  keywords: string[];
}

export interface BulkOptimization {
  pageTitle: string;
  metaDescription: string;
  sections: {
    sectionId: string;
    headings: { original: string; optimized: string; level: number }[];
    paragraphs: { original: string; optimized: string }[];
    ctas: { original: string; optimized: string }[];
  }[];
  overallScore: number;
  improvements: string[];
}

export interface ContentOptimizationResult {
  optimizedItems: OptimizedItem[];
  globalRecommendations: string[];
  keywordsUsed: string[];
}

export function useContentOptimizer() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<ContentOptimizationResult | null>(null);
  const [singleOptimization, setSingleOptimization] = useState<SingleOptimization | null>(null);
  const [bulkOptimization, setBulkOptimization] = useState<BulkOptimization | null>(null);

  const optimizeContent = useCallback(async (contentItems: ContentItem[]) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('seo-analyzer', {
        body: { 
          type: 'optimize_content',
          contentItems 
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de l'optimisation");
      }

      setOptimizationResult(data.result);
      toast({
        title: "Optimisation terminée",
        description: `${data.result.optimizedItems?.length || 0} éléments optimisés`,
      });

      return data.result;
    } catch (error: any) {
      console.error('Content optimization error:', error);
      toast({
        title: "Erreur d'optimisation",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const optimizeSingle = useCallback(async (content: string, type: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('seo-analyzer', {
        body: { 
          type: 'optimize_single',
          content,
          contentItems: { type }
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de l'optimisation");
      }

      setSingleOptimization(data.result);
      toast({
        title: "Texte optimisé",
        description: `Score SEO: ${data.result.seoScore}/100`,
      });

      return data.result;
    } catch (error: any) {
      console.error('Single optimization error:', error);
      toast({
        title: "Erreur d'optimisation",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const optimizeBulk = useCallback(async (url?: string) => {
    setIsLoading(true);
    
    try {
      const content = document.body.innerText;
      
      const { data, error } = await supabase.functions.invoke('seo-analyzer', {
        body: { 
          type: 'bulk_optimize',
          content,
          url: url || window.location.href
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de l'optimisation");
      }

      setBulkOptimization(data.result);
      toast({
        title: "Optimisation complète",
        description: `Score global: ${data.result.overallScore}/100`,
      });

      return data.result;
    } catch (error: any) {
      console.error('Bulk optimization error:', error);
      toast({
        title: "Erreur d'optimisation",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const extractPageContent = useCallback((): ContentItem[] => {
    const items: ContentItem[] = [];
    
    // Extract headings
    document.querySelectorAll('h1, h2, h3').forEach((el, index) => {
      const text = el.textContent?.trim();
      if (text && text.length > 3) {
        items.push({
          id: `heading-${index}`,
          type: 'heading',
          content: text,
          selector: el.tagName.toLowerCase()
        });
      }
    });

    // Extract paragraphs (main content)
    document.querySelectorAll('p').forEach((el, index) => {
      const text = el.textContent?.trim();
      if (text && text.length > 20) {
        items.push({
          id: `paragraph-${index}`,
          type: 'paragraph',
          content: text
        });
      }
    });

    // Extract CTAs (buttons with text)
    document.querySelectorAll('button, a.btn, [role="button"]').forEach((el, index) => {
      const text = el.textContent?.trim();
      if (text && text.length > 2 && text.length < 50) {
        items.push({
          id: `cta-${index}`,
          type: 'cta',
          content: text
        });
      }
    });

    // Extract meta
    const title = document.title;
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    if (title) {
      items.push({
        id: 'meta-title',
        type: 'meta',
        content: title
      });
    }
    
    if (description) {
      items.push({
        id: 'meta-description',
        type: 'meta',
        content: description
      });
    }

    return items;
  }, []);

  const clearResults = useCallback(() => {
    setOptimizationResult(null);
    setSingleOptimization(null);
    setBulkOptimization(null);
  }, []);

  return {
    isLoading,
    optimizationResult,
    singleOptimization,
    bulkOptimization,
    optimizeContent,
    optimizeSingle,
    optimizeBulk,
    extractPageContent,
    clearResults,
  };
}
