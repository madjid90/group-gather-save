import { useState } from 'react';
import { useSEOAnalyzer } from '@/hooks/useSEOAnalyzer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  FileText, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Loader2,
  RefreshCw,
  Copy,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SEODashboard() {
  const { toast } = useToast();
  const {
    isLoading,
    metaTags,
    contentAnalysis,
    fullAudit,
    generateMetaTags,
    analyzeContent,
    runFullAudit,
  } = useSEOAnalyzer();

  const [activeTab, setActiveTab] = useState('audit');

  const handleFullAudit = () => {
    const content = document.body.innerText;
    runFullAudit({
      content,
      url: window.location.origin,
      pageTitle: document.title,
      pageDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    });
  };

  const handleGenerateMetaTags = () => {
    const content = document.body.innerText;
    generateMetaTags({
      content,
      url: window.location.href,
      pageTitle: document.title,
      pageDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    });
  };

  const handleContentAnalysis = () => {
    const content = document.body.innerText;
    analyzeContent(content);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le texte a été copié dans le presse-papiers.",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">Moyen</Badge>;
    return <Badge className="bg-red-500">À améliorer</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Optimisation SEO Automatique
          </h2>
          <p className="text-muted-foreground">
            Analyse et optimisation SEO propulsées par l'IA
          </p>
        </div>
        <Button 
          onClick={handleFullAudit} 
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Lancer l'audit complet
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Audit SEO
          </TabsTrigger>
          <TabsTrigger value="meta" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Meta Tags
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Contenu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          {fullAudit ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Score Global</CardTitle>
                    {getScoreBadge(fullAudit.overallScore)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <span className={`text-5xl font-bold ${getScoreColor(fullAudit.overallScore)}`}>
                      {fullAudit.overallScore}
                    </span>
                    <span className="text-2xl text-muted-foreground">/100</span>
                  </div>
                  <Progress value={fullAudit.overallScore} className="mt-4" />
                  <p className="mt-4 text-muted-foreground">{fullAudit.summary}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(fullAudit.categories).map(([key, category]) => (
                  <Card key={key}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="capitalize">{key}</CardTitle>
                        <span className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                          {category.score}/100
                        </span>
                      </div>
                      <Progress value={category.score} />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {category.issues.length > 0 && (
                        <div>
                          <p className="font-medium text-red-500 flex items-center gap-1 mb-2">
                            <XCircle className="w-4 h-4" /> Problèmes
                          </p>
                          <ul className="text-sm space-y-1">
                            {category.issues.map((issue, i) => (
                              <li key={i} className="text-muted-foreground">• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {category.recommendations.length > 0 && (
                        <div>
                          <p className="font-medium text-yellow-500 flex items-center gap-1 mb-2">
                            <AlertTriangle className="w-4 h-4" /> Recommandations
                          </p>
                          <ul className="text-sm space-y-1">
                            {category.recommendations.map((rec, i) => (
                              <li key={i} className="text-muted-foreground">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {fullAudit.priorityActions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Actions Prioritaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2">
                      {fullAudit.priorityActions.map((action, i) => (
                        <li key={i} className="text-muted-foreground">{action}</li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Cliquez sur "Lancer l'audit complet" pour analyser votre site
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="meta" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Génération de Meta Tags</CardTitle>
                  <CardDescription>
                    Générez automatiquement des meta tags optimisés pour le SEO
                  </CardDescription>
                </div>
                <Button onClick={handleGenerateMetaTags} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Générer
                </Button>
              </div>
            </CardHeader>
            {metaTags && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-medium">Title</label>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(metaTags.title)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <code className="block p-3 bg-muted rounded-lg text-sm break-all">
                    {metaTags.title}
                  </code>
                  <p className="text-xs text-muted-foreground">{metaTags.title.length}/60 caractères</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-medium">Description</label>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(metaTags.description)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <code className="block p-3 bg-muted rounded-lg text-sm break-all">
                    {metaTags.description}
                  </code>
                  <p className="text-xs text-muted-foreground">{metaTags.description.length}/160 caractères</p>
                </div>

                <div className="space-y-2">
                  <label className="font-medium">Mots-clés</label>
                  <div className="flex flex-wrap gap-2">
                    {metaTags.keywords.map((keyword, i) => (
                      <Badge key={i} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-medium">Code à copier</label>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => copyToClipboard(`<title>${metaTags.title}</title>
<meta name="description" content="${metaTags.description}" />
<meta name="keywords" content="${metaTags.keywords.join(', ')}" />
<meta property="og:title" content="${metaTags.ogTitle}" />
<meta property="og:description" content="${metaTags.ogDescription}" />`)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copier le code HTML
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Analyse du Contenu</CardTitle>
                  <CardDescription>
                    Analysez la qualité SEO de votre contenu
                  </CardDescription>
                </div>
                <Button onClick={handleContentAnalysis} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Analyser
                </Button>
              </div>
            </CardHeader>
            {contentAnalysis && (
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className={`text-4xl font-bold ${getScoreColor(contentAnalysis.score)}`}>
                    {contentAnalysis.score}
                  </span>
                  <span className="text-xl text-muted-foreground">/100</span>
                  {getScoreBadge(contentAnalysis.score)}
                </div>
                <Progress value={contentAnalysis.score} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium mb-2">Densité de mots-clés</p>
                    <p className="text-sm text-muted-foreground">{contentAnalysis.keywordDensity}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium mb-2">Lisibilité</p>
                    <p className="text-sm text-muted-foreground">{contentAnalysis.readability}</p>
                  </div>
                </div>

                {contentAnalysis.strengths.length > 0 && (
                  <div>
                    <p className="font-medium text-green-500 flex items-center gap-1 mb-2">
                      <CheckCircle2 className="w-4 h-4" /> Points forts
                    </p>
                    <ul className="text-sm space-y-1">
                      {contentAnalysis.strengths.map((s, i) => (
                        <li key={i} className="text-muted-foreground">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {contentAnalysis.recommendations.length > 0 && (
                  <div>
                    <p className="font-medium text-yellow-500 flex items-center gap-1 mb-2">
                      <AlertTriangle className="w-4 h-4" /> Recommandations
                    </p>
                    <ul className="text-sm space-y-1">
                      {contentAnalysis.recommendations.map((r, i) => (
                        <li key={i} className="text-muted-foreground">• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {contentAnalysis.missingElements.length > 0 && (
                  <div>
                    <p className="font-medium text-red-500 flex items-center gap-1 mb-2">
                      <XCircle className="w-4 h-4" /> Éléments manquants
                    </p>
                    <ul className="text-sm space-y-1">
                      {contentAnalysis.missingElements.map((m, i) => (
                        <li key={i} className="text-muted-foreground">• {m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
