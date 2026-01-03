import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Target, TrendingUp, AlertTriangle, CheckCircle, Zap, Search, Globe, Copy, RefreshCw } from 'lucide-react';
import { useCompetitorAnalysis } from '@/hooks/useCompetitorAnalysis';
import { useToast } from '@/hooks/use-toast';

export const CompetitorAnalysisPanel = () => {
  const { 
    isLoading, 
    competitors, 
    analysis, 
    fetchCompetitors, 
    analyzeCompetitor, 
    analyzeAllCompetitors,
    clearAnalysis 
  } = useCompetitorAnalysis();
  const { toast } = useToast();

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié", description: "Texte copié dans le presse-papiers" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Analyse Concurrentielle SEO
          </CardTitle>
          <CardDescription>
            Scrapez et analysez les sites concurrents pour découvrir leurs stratégies SEO et les opportunités à saisir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={analyzeAllCompetitors} 
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analyser tous les concurrents
                </>
              )}
            </Button>
            
            {analysis && (
              <Button variant="outline" onClick={clearAnalysis} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Nouvelle analyse
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des concurrents */}
      {!analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Concurrents identifiés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {Object.entries(competitors).map(([key, competitor]) => (
                <div 
                  key={key}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{competitor.name}</span>
                      <Badge variant="outline" className="text-xs">{competitor.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="text-destructive">Faiblesse:</span> {competitor.weakness}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => analyzeCompetitor(key)}
                    disabled={isLoading}
                  >
                    Analyser
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats de l'analyse */}
      {analysis && !('parseError' in analysis) && (
        <>
          {/* Résumé exécutif */}
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Résumé exécutif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{analysis.summary}</p>
            </CardContent>
          </Card>

          {/* Avantages compétitifs Switchly */}
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                Avantages Switchly à exploiter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {analysis.competitiveAdvantages?.map((advantage, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>{advantage}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommandations Switchly */}
          {analysis.switchlyRecommendations && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Actions urgentes */}
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Actions urgentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.switchlyRecommendations.urgentActions?.map((action, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-destructive/10 rounded">
                        <span className="font-bold text-destructive">{i + 1}.</span>
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mots-clés à cibler */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Mots-clés prioritaires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.switchlyRecommendations.keywordsToTarget?.map((keyword, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => copyToClipboard(keyword)}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contenus manquants */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contenus à créer</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.switchlyRecommendations.contentGaps?.map((gap, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary">•</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Différenciateurs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Différenciateurs à mettre en avant</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.switchlyRecommendations.differentiators?.map((diff, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        {diff}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Meta tags optimisés suggérés */}
          {analysis.switchlyRecommendations?.metaTagsOptimizations && (
            <Card>
              <CardHeader>
                <CardTitle>Meta tags suggérés (basés sur l'analyse concurrentielle)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-sm">
                      {analysis.switchlyRecommendations.metaTagsOptimizations.title}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(analysis.switchlyRecommendations.metaTagsOptimizations.title)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-sm">
                      {analysis.switchlyRecommendations.metaTagsOptimizations.description}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(analysis.switchlyRecommendations.metaTagsOptimizations.description)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analyse par concurrent */}
          {analysis.competitorAnalysis && analysis.competitorAnalysis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Analyse détaillée par concurrent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analysis.competitorAnalysis.map((comp, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-lg mb-3">{comp.name}</h4>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h5 className="text-sm font-medium text-green-600 mb-2">Forces SEO</h5>
                          <ul className="space-y-1">
                            {comp.seoStrengths?.map((s, j) => (
                              <li key={j} className="text-sm flex items-start gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600 mt-1 shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-destructive mb-2">Faiblesses SEO</h5>
                          <ul className="space-y-1">
                            {comp.seoWeaknesses?.map((w, j) => (
                              <li key={j} className="text-sm flex items-start gap-1">
                                <AlertTriangle className="w-3 h-3 text-destructive mt-1 shrink-0" />
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <h5 className="text-sm font-medium mb-2">Mots-clés sur lesquels ils se positionnent</h5>
                        <div className="flex flex-wrap gap-1">
                          {comp.keywordsTheyRank?.map((kw, j) => (
                            <Badge key={j} variant="outline" className="text-xs">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                        <h5 className="text-sm font-medium text-primary mb-1">Comment les battre</h5>
                        <p className="text-sm">{comp.howToBeat}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium">Analyse en cours...</p>
                <p className="text-sm text-muted-foreground">
                  Scraping des sites concurrents et génération des recommandations SEO
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};