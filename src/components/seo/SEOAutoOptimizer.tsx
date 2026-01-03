import { useEffect, useRef } from 'react';
import { useSEOAnalyzer } from '@/hooks/useSEOAnalyzer';

interface SEOAutoOptimizerProps {
  // Run analysis automatically when content changes
  autoAnalyze?: boolean;
  // Debounce delay in ms
  debounceMs?: number;
}

export function SEOAutoOptimizer({ 
  autoAnalyze = true, 
  debounceMs = 5000 
}: SEOAutoOptimizerProps) {
  const { autoAnalyze: runAnalysis, isLoading } = useSEOAnalyzer();
  const hasRun = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!autoAnalyze || hasRun.current) return;

    // Debounce the auto-analysis
    timeoutRef.current = setTimeout(() => {
      hasRun.current = true;
      runAnalysis();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoAnalyze, debounceMs, runAnalysis]);

  // This component doesn't render anything visible
  // It just runs the SEO analysis in the background
  return null;
}
