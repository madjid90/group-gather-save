import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MetaTags {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
}

interface ContentAnalysis {
  score: number;
  keywordDensity: string;
  readability: string;
  recommendations: string[];
  missingElements: string[];
  strengths: string[];
}

interface AuditCategory {
  score: number;
  issues: string[];
  recommendations: string[];
}

interface FullAudit {
  overallScore: number;
  categories: {
    technique: AuditCategory;
    contenu: AuditCategory;
    performance: AuditCategory;
    mobile: AuditCategory;
  };
  priorityActions: string[];
  summary: string;
}

export function useSEOAnalyzer() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [metaTags, setMetaTags] = useState<MetaTags | null>(null);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [fullAudit, setFullAudit] = useState<FullAudit | null>(null);

  const analyze = useCallback(async (
    type: 'meta_tags' | 'content_analysis' | 'full_audit',
    options?: {
      content?: string;
      url?: string;
      pageTitle?: string;
      pageDescription?: string;
    }
  ) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('seo-analyzer', {
        body: { type, ...options }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'analyse');
      }

      const result = data.result;

      switch (type) {
        case 'meta_tags':
          setMetaTags(result);
          toast({
            title: "Meta tags générés",
            description: "Les meta tags SEO ont été optimisés automatiquement.",
          });
          break;
        case 'content_analysis':
          setContentAnalysis(result);
          toast({
            title: "Analyse terminée",
            description: `Score SEO: ${result.score}/100`,
          });
          break;
        case 'full_audit':
          setFullAudit(result);
          toast({
            title: "Audit SEO complet",
            description: `Score global: ${result.overallScore}/100`,
          });
          break;
      }

      return result;
    } catch (error: any) {
      console.error('SEO Analysis error:', error);
      toast({
        title: "Erreur d'analyse SEO",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Auto-analyze on page load
  const autoAnalyze = useCallback(() => {
    const content = document.body.innerText;
    const pageTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    return analyze('content_analysis', {
      content,
      url: window.location.href,
      pageTitle,
      pageDescription: metaDesc,
    });
  }, [analyze]);

  return {
    isLoading,
    metaTags,
    contentAnalysis,
    fullAudit,
    analyze,
    autoAnalyze,
    generateMetaTags: (options?: { content?: string; url?: string; pageTitle?: string; pageDescription?: string }) =>
      analyze('meta_tags', options),
    analyzeContent: (content: string) =>
      analyze('content_analysis', { content }),
    runFullAudit: (options?: { url?: string; pageTitle?: string; pageDescription?: string; content?: string }) =>
      analyze('full_audit', options),
  };
}
