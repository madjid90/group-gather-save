import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SEOMetric {
  id: string;
  page_url: string;
  page_title: string | null;
  overall_score: number;
  title_score: number | null;
  meta_score: number | null;
  content_score: number | null;
  performance_score: number | null;
  mobile_score: number | null;
  keywords: string[] | null;
  issues: string[] | null;
  recommendations: string[] | null;
  created_at: string;
}

export interface MetricTrend {
  date: string;
  score: number;
  title: number;
  meta: number;
  content: number;
  performance: number;
  mobile: number;
}

export function useSEOMetrics() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<SEOMetric[]>([]);
  const [trends, setTrends] = useState<MetricTrend[]>([]);
  const [latestMetric, setLatestMetric] = useState<SEOMetric | null>(null);

  const fetchMetrics = useCallback(async (pageUrl?: string, limit = 50) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('seo_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (pageUrl) {
        query = query.eq('page_url', pageUrl);
      }

      const { data, error } = await query;

      if (error) throw error;

      const typedData = (data || []) as SEOMetric[];
      setMetrics(typedData);
      
      if (typedData.length > 0) {
        setLatestMetric(typedData[0]);
      }

      // Calculate trends (group by day)
      const trendMap = new Map<string, MetricTrend>();
      typedData.forEach(metric => {
        const date = new Date(metric.created_at).toISOString().split('T')[0];
        if (!trendMap.has(date)) {
          trendMap.set(date, {
            date,
            score: metric.overall_score,
            title: metric.title_score || 0,
            meta: metric.meta_score || 0,
            content: metric.content_score || 0,
            performance: metric.performance_score || 0,
            mobile: metric.mobile_score || 0,
          });
        }
      });

      const sortedTrends = Array.from(trendMap.values())
        .sort((a, b) => a.date.localeCompare(b.date));
      setTrends(sortedTrends);

      return typedData;
    } catch (error: any) {
      console.error('Error fetching SEO metrics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les métriques SEO",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const saveMetric = useCallback(async (metric: Omit<SEOMetric, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('seo_metrics')
        .insert(metric)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Métrique enregistrée",
        description: `Score SEO: ${metric.overall_score}/100`,
      });

      // Refresh metrics
      await fetchMetrics(metric.page_url);

      return data as SEOMetric;
    } catch (error: any) {
      console.error('Error saving SEO metric:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la métrique",
        variant: "destructive",
      });
      return null;
    }
  }, [toast, fetchMetrics]);

  const getPageUrls = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('seo_metrics')
        .select('page_url')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique URLs
      const uniqueUrls = [...new Set((data || []).map(d => d.page_url))];
      return uniqueUrls;
    } catch (error) {
      console.error('Error fetching page URLs:', error);
      return [];
    }
  }, []);

  const getScoreChange = useCallback(() => {
    if (trends.length < 2) return null;
    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    return latest.score - previous.score;
  }, [trends]);

  const getAverageScore = useCallback(() => {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.overall_score, 0);
    return Math.round(sum / metrics.length);
  }, [metrics]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    isLoading,
    metrics,
    trends,
    latestMetric,
    fetchMetrics,
    saveMetric,
    getPageUrls,
    getScoreChange,
    getAverageScore,
  };
}
