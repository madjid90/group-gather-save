import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Competitor {
  name: string;
  url: string;
  type: string;
  weakness: string;
}

export interface CompetitorAnalysisResult {
  name: string;
  seoStrengths: string[];
  seoWeaknesses: string[];
  keywordsTheyRank: string[];
  contentStrategy: string;
  howToBeat: string;
}

export interface SwitchlyRecommendations {
  keywordsToTarget: string[];
  contentGaps: string[];
  differentiators: string[];
  metaTagsOptimizations: {
    title: string;
    description: string;
  };
  urgentActions: string[];
}

export interface FullCompetitorAnalysis {
  competitorAnalysis: CompetitorAnalysisResult[];
  switchlyRecommendations: SwitchlyRecommendations;
  competitiveAdvantages: string[];
  summary: string;
}

export const useCompetitorAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [competitors, setCompetitors] = useState<Record<string, Competitor>>({});
  const [analysis, setAnalysis] = useState<FullCompetitorAnalysis | null>(null);
  const { toast } = useToast();

  const fetchCompetitors = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-competitor', {
        body: { analyzeType: 'list' }
      });

      if (error) throw error;
      
      if (data?.success && data?.competitors) {
        setCompetitors(data.competitors);
      }
    } catch (error) {
      console.error('Error fetching competitors:', error);
    }
  }, []);

  const analyzeCompetitor = useCallback(async (competitorKey: string) => {
    setIsLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-competitor', {
        body: { competitorKey, analyzeType: 'single' }
      });

      if (error) throw error;

      if (data?.success && data?.analysis) {
        setAnalysis(data.analysis);
        toast({
          title: "Analyse terminée",
          description: `${competitors[competitorKey]?.name || 'Concurrent'} analysé avec succès`
        });
      } else {
        throw new Error(data?.error || 'Analyse échouée');
      }
    } catch (error) {
      console.error('Error analyzing competitor:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'analyser le concurrent",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [competitors, toast]);

  const analyzeAllCompetitors = useCallback(async () => {
    setIsLoading(true);
    setAnalysis(null);

    try {
      toast({
        title: "Analyse en cours",
        description: "Scraping et analyse de tous les concurrents... Cela peut prendre 30-60 secondes."
      });

      const { data, error } = await supabase.functions.invoke('scrape-competitor', {
        body: { analyzeType: 'all' }
      });

      if (error) throw error;

      if (data?.success && data?.analysis) {
        setAnalysis(data.analysis);
        toast({
          title: "Analyse complète terminée",
          description: `${data.successfulScrapes}/${data.scrapedSites} sites analysés avec succès`
        });
      } else {
        throw new Error(data?.error || 'Analyse échouée');
      }
    } catch (error) {
      console.error('Error analyzing all competitors:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'analyser les concurrents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
  }, []);

  return {
    isLoading,
    competitors,
    analysis,
    fetchCompetitors,
    analyzeCompetitor,
    analyzeAllCompetitors,
    clearAnalysis
  };
};