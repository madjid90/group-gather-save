import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus, RefreshCw, BarChart3, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSEOMetrics, SEOMetric } from '@/hooks/useSEOMetrics';
import { useSEOAnalyzer } from '@/hooks/useSEOAnalyzer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function SEOMetricsPanel() {
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

  useEffect(() => {
    getPageUrls().then(setPageUrls);
  }, [getPageUrls]);

  const handleRunAudit = async () => {
    const result = await runFullAudit({
      url: window.location.origin,
      content: document.body.innerText,
    });

    if (result) {
      await saveMetric({
        page_url: window.location.pathname,
        page_title: document.title,
        overall_score: result.overallScore,
        title_score: result.categories?.contenu?.score || 0,
        meta_score: result.categories?.technique?.score || 0,
        content_score: result.categories?.contenu?.score || 0,
        performance_score: result.categories?.performance?.score || 0,
        mobile_score: result.categories?.mobile?.score || 0,
        keywords: [],
        issues: result.priorityActions || [],
        recommendations: Object.values(result.categories || {}).flatMap((c: any) => c.recommendations || []),
      });
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Métriques SEO</h2>
          <p className="text-muted-foreground">Suivi des performances SEO dans le temps</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedUrl} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les pages</SelectItem>
              {pageUrls.map(url => (
                <SelectItem key={url} value={url}>{url}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleRunAudit} disabled={isAnalyzing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Analyser
          </Button>
        </div>
      </div>

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
