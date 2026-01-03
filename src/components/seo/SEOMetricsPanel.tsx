import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus, RefreshCw, BarChart3, Target, AlertTriangle, CheckCircle2, Globe } from 'lucide-react';
import { useSEOMetrics, SEOMetric } from '@/hooks/useSEOMetrics';
import { useSEOAnalyzer } from '@/hooks/useSEOAnalyzer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

// Pages publiques à analyser (pas les pages admin)
const PUBLIC_PAGES = [
  { url: '/', title: 'Accueil', description: 'Page d\'accueil Switchly - Achat groupé énergie et internet' },
  { url: '/inscription', title: 'Inscription', description: 'Inscription à l\'achat groupé' },
  { url: '/connexion', title: 'Connexion', description: 'Connexion utilisateur' },
  { url: '/faq', title: 'FAQ', description: 'Questions fréquentes' },
  { url: '/contact', title: 'Contact', description: 'Page de contact' },
  { url: '/cgu', title: 'CGU', description: 'Conditions générales d\'utilisation' },
  { url: '/mentions-legales', title: 'Mentions légales', description: 'Mentions légales' },
  { url: '/politique-confidentialite', title: 'Politique de confidentialité', description: 'Politique de confidentialité' },
  { url: '/organiser-achat-groupe', title: 'Organiser un achat groupé', description: 'Guide pour organiser un achat groupé' },
];

export function SEOMetricsPanel() {
  const { toast } = useToast();
  const { 
    isLoading, 
    metrics, 
    trends, 
    latestMetric, 
    fetchMetrics, 
    saveMetric,
    getPageUrls,
    getScoreChange,
    getAverageScore 
  } = useSEOMetrics();
  
  const { runFullAudit, isLoading: isAnalyzing } = useSEOAnalyzer();
  const [pageUrls, setPageUrls] = useState<string[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>('all');
  const [selectedPageToAnalyze, setSelectedPageToAnalyze] = useState<string>('/');
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);

  useEffect(() => {
    getPageUrls().then(setPageUrls);
  }, [getPageUrls]);

  // Analyser une page spécifique
  const handleRunAudit = async (pageUrl: string, pageTitle: string) => {
    const pageInfo = PUBLIC_PAGES.find(p => p.url === pageUrl);
    
    const result = await runFullAudit({
      url: `${window.location.origin}${pageUrl}`,
      content: pageInfo?.description || `Page ${pageTitle} de Switchly`,
      pageTitle: pageTitle,
    });

    if (result) {
      await saveMetric({
        page_url: pageUrl,
        page_title: pageTitle,
        overall_score: result.overallScore,
        title_score: result.categories?.contenu?.score || 0,
        meta_score: result.categories?.technique?.score || 0,
        content_score: result.categories?.contenu?.score || 0,
        performance_score: result.categories?.conversion?.score || 0,
        mobile_score: result.categories?.mobile?.score || 0,
        keywords: [],
        issues: result.priorityActions || [],
        recommendations: Object.values(result.categories || {}).flatMap((c: any) => c.recommendations || []),
      });
      return true;
    }
    return false;
  };

  // Analyser toutes les pages publiques
  const handleAnalyzeAllPages = async () => {
    setIsAnalyzingAll(true);
    let successCount = 0;
    
    toast({
      title: "Analyse en cours",
      description: `Analyse de ${PUBLIC_PAGES.length} pages publiques...`,
    });

    for (const page of PUBLIC_PAGES) {
      try {
        const success = await handleRunAudit(page.url, page.title);
        if (success) successCount++;
        // Petit délai entre chaque requête
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Erreur analyse ${page.url}:`, error);
      }
    }

    setIsAnalyzingAll(false);
    toast({
      title: "Analyse terminée",
      description: `${successCount}/${PUBLIC_PAGES.length} pages analysées avec succès`,
    });
    
    fetchMetrics();
  };

  const handleSinglePageAudit = async () => {
    const page = PUBLIC_PAGES.find(p => p.url === selectedPageToAnalyze);
    if (page) {
      await handleRunAudit(page.url, page.title);
      fetchMetrics();
    }
  };

  const handleFilterChange = (url: string) => {
    setSelectedUrl(url);
    if (url === 'all') {
      fetchMetrics();
    } else {
      fetchMetrics(url);
    }
  };

  const scoreChange = getScoreChange();
  const averageScore = getAverageScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (isLoading && metrics.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div>
        <h2 className="text-2xl font-bold">Métriques SEO</h2>
        <p className="text-muted-foreground">Suivi des performances SEO des pages publiques</p>
      </div>

      {/* Actions d'analyse */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Analyser les pages publiques
          </CardTitle>
          <CardDescription>
            Lancez une analyse SEO sur les pages du site (hors pages admin)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-1">
              <Select value={selectedPageToAnalyze} onValueChange={setSelectedPageToAnalyze}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choisir une page" />
                </SelectTrigger>
                <SelectContent>
                  {PUBLIC_PAGES.map(page => (
                    <SelectItem key={page.url} value={page.url}>
                      {page.title} ({page.url})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSinglePageAudit} disabled={isAnalyzing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                Analyser
              </Button>
            </div>
            <Button 
              onClick={handleAnalyzeAllPages} 
              disabled={isAnalyzingAll || isAnalyzing}
              variant="outline"
            >
              <Globe className={`w-4 h-4 mr-2 ${isAnalyzingAll ? 'animate-spin' : ''}`} />
              Analyser toutes les pages ({PUBLIC_PAGES.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Score actuel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getScoreColor(latestMetric?.overall_score || 0)}`}>
                {latestMetric?.overall_score || 0}
              </span>
              <span className="text-muted-foreground">/100</span>
              {scoreChange !== null && (
                <span className={`flex items-center text-sm ${scoreChange > 0 ? 'text-green-500' : scoreChange < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {scoreChange > 0 ? <TrendingUp className="w-4 h-4" /> : scoreChange < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  {scoreChange > 0 ? '+' : ''}{scoreChange}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Moyenne
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
                {averageScore}
              </span>
              <span className="text-muted-foreground">/100</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Problèmes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-orange-500">
                {latestMetric?.issues?.length || 0}
              </span>
              <span className="text-muted-foreground">à corriger</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {metrics.length}
              </span>
              <span className="text-muted-foreground">effectuées</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique d'évolution */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Évolution du score SEO</CardTitle>
            <CardDescription>Suivi des performances dans le temps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'd MMM', { locale: fr })}
                    className="text-xs"
                  />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'dd MMMM yyyy', { locale: fr })}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    name="Score global"
                    stroke="hsl(var(--primary))" 
                    fill="url(#colorScore)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Détails par catégorie */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scores par catégorie</CardTitle>
            <CardDescription>Évolution détaillée des différentes métriques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'd MMM', { locale: fr })}
                    className="text-xs"
                  />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'dd MMMM yyyy', { locale: fr })}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="title" name="Titre" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="meta" name="Meta" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="content" name="Contenu" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="performance" name="Performance" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="mobile" name="Mobile" stroke="#ec4899" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique des analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des analyses</CardTitle>
          <CardDescription>Dernières analyses SEO effectuées</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune analyse SEO enregistrée</p>
              <p className="text-sm">Cliquez sur "Analyser" pour démarrer le suivi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.slice(0, 10).map((metric) => (
                <div 
                  key={metric.id} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{metric.page_url}</span>
                      <Badge variant={getScoreBadgeVariant(metric.overall_score)}>
                        {metric.overall_score}/100
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(metric.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-muted-foreground">Titre</div>
                      <div className={getScoreColor(metric.title_score || 0)}>{metric.title_score || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Meta</div>
                      <div className={getScoreColor(metric.meta_score || 0)}>{metric.meta_score || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Contenu</div>
                      <div className={getScoreColor(metric.content_score || 0)}>{metric.content_score || 0}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
