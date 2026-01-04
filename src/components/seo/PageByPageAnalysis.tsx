import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Loader2,
  FileText,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Copy,
  ArrowRight,
  TrendingUp,
  MousePointer,
  Sparkles,
  Save,
  RefreshCw,
  Eye,
  Code,
  MessageSquare,
  Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSEOPageSettings } from '@/hooks/useSEOPageSettings';
import { useToast } from '@/hooks/use-toast';

interface PageAnalysis {
  pageScore: {
    global: number;
    seo: number;
    conversion: number;
    ux: number;
  };
  currentState: {
    title: string;
    titleScore: number;
    titleIssues: string[];
    description: string;
    descriptionScore: number;
    descriptionIssues: string[];
  };
  sections: Array<{
    name: string;
    currentContent: string;
    score: number;
    issues: string[];
    recommendations: Array<{
      type: string;
      priority: string;
      current: string;
      suggested: string;
      reason: string;
      impact: string;
    }>;
    competitorInsight: string;
  }>;
  seoRecommendations: {
    title: { current: string; suggested: string; keywords: string[] };
    description: { current: string; suggested: string; keywords: string[] };
    h1: { current: string; suggested: string; reason: string };
    keywords: { primary: string; secondary: string[]; longTail: string[] };
    internalLinks: string[];
    structuredData: string;
  };
  conversionRecommendations: {
    cta: { current: string; suggested: string; placement: string; design: string };
    socialProof: { current: string; suggested: string; examples: string[] };
    urgency: { tactics: string[]; implementation: string };
    trustSignals: string[];
  };
  copywritingFixes: Array<{
    location: string;
    current: string;
    suggested: string;
    technique: string;
  }>;
  technicalIssues: Array<{
    issue: string;
    severity: string;
    fix: string;
  }>;
  priorityActions: Array<{
    action: string;
    timeEstimate: string;
    impact: string;
    difficulty: string;
  }>;
  competitorComparison: {
    switchlyStrengths: string[];
    switchlyWeaknesses: string[];
    opportunities: string[];
  };
}

const PAGES = [
  { key: 'home', label: 'Accueil', url: '/' },
  { key: 'inscription', label: 'Inscription', url: '/inscription' },
  { key: 'faq', label: 'FAQ', url: '/faq' },
  { key: 'contact', label: 'Contact', url: '/contact' },
  { key: 'organiser', label: 'Organiser achat groupé', url: '/organiser-achat-groupe' },
];

export const PageByPageAnalysis = () => {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PageAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { updateSettings, isLoading: isApplying } = useSEOPageSettings();
  const { toast } = useToast();

  const analyzePage = async (pageKey: string) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setSelectedPage(pageKey);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-page-seo', {
        body: { 
          pageKey,
          siteUrl: window.location.origin,
          analyzeType: 'page'
        }
      });

      if (error) throw error;

      if (data.success && data.analysis && !data.analysis.parseError) {
        setAnalysis(data.analysis);
        toast({
          title: "Analyse terminée",
          description: `Page "${PAGES.find(p => p.key === pageKey)?.label}" analysée avec succès`
        });
      } else {
        throw new Error(data.error || 'Analyse échouée');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Erreur d'analyse",
        description: error instanceof Error ? error.message : "Impossible d'analyser la page",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySEORecommendations = async () => {
    if (!analysis || !selectedPage) return;

    const pageUrl = PAGES.find(p => p.key === selectedPage)?.url || '/';
    
    try {
      const updates = {
        meta_title: analysis.seoRecommendations.title.suggested,
        meta_description: analysis.seoRecommendations.description.suggested,
        keywords: [
          analysis.seoRecommendations.keywords.primary,
          ...analysis.seoRecommendations.keywords.secondary
        ],
        og_title: analysis.seoRecommendations.title.suggested,
        og_description: analysis.seoRecommendations.description.suggested,
      };

      const success = await updateSettings(pageUrl, updates);
      
      if (success) {
        toast({
          title: "SEO appliqué",
          description: "Les recommandations SEO ont été enregistrées"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer les recommandations",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié", description: "Texte copié dans le presse-papiers" });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'haute') return 'destructive';
    if (priority === 'moyenne') return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Sélection de page */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Analyse page par page
          </CardTitle>
          <CardDescription>
            Sélectionnez une page pour une analyse SEO + conversion détaillée section par section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {PAGES.map(page => (
              <Button
                key={page.key}
                variant={selectedPage === page.key ? "default" : "outline"}
                className="h-auto py-4 flex-col gap-1"
                onClick={() => analyzePage(page.key)}
                disabled={isAnalyzing}
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">{page.label}</span>
                <span className="text-xs text-muted-foreground">{page.url}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isAnalyzing && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-semibold text-lg">Analyse en cours...</p>
                <p className="text-sm text-muted-foreground">
                  Scraping de la page + concurrents + analyse IA (30-60 sec)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats */}
      {analysis && !isAnalyzing && (
        <div className="space-y-6">
          {/* Scores globaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Score global', value: analysis.pageScore.global, icon: Zap },
              { label: 'SEO', value: analysis.pageScore.seo, icon: Search },
              { label: 'Conversion', value: analysis.pageScore.conversion, icon: Target },
              { label: 'UX', value: analysis.pageScore.ux, icon: Eye },
            ].map((score, i) => (
              <Card key={i} className={getScoreBg(score.value)}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{score.label}</p>
                      <p className={`text-3xl font-bold ${getScoreColor(score.value)}`}>
                        {score.value}/100
                      </p>
                    </div>
                    <score.icon className={`w-8 h-8 ${getScoreColor(score.value)}`} />
                  </div>
                  <Progress value={score.value} className="mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Onglets détaillés */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="conversion">Conversion</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            {/* Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-4">
              {/* État actuel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">État actuel de la page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Titre SEO</span>
                      <Badge variant={analysis.currentState.titleScore >= 70 ? "default" : "destructive"}>
                        {analysis.currentState.titleScore}/100
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{analysis.currentState.title}</p>
                    {analysis.currentState.titleIssues.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {analysis.currentState.titleIssues.map((issue, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Meta description</span>
                      <Badge variant={analysis.currentState.descriptionScore >= 70 ? "default" : "destructive"}>
                        {analysis.currentState.descriptionScore}/100
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{analysis.currentState.description}</p>
                    {analysis.currentState.descriptionIssues.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {analysis.currentState.descriptionIssues.map((issue, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Comparaison concurrents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Vs Concurrents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <h4 className="font-medium text-green-700 mb-2">Vos forces</h4>
                      <ul className="space-y-1">
                        {analysis.competitorComparison.switchlyStrengths.map((s, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <h4 className="font-medium text-red-700 mb-2">À améliorer</h4>
                      <ul className="space-y-1">
                        {analysis.competitorComparison.switchlyWeaknesses.map((w, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <h4 className="font-medium text-blue-700 mb-2">Opportunités</h4>
                      <ul className="space-y-1">
                        {analysis.competitorComparison.opportunities.map((o, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sections */}
            <TabsContent value="sections" className="space-y-4">
              <Accordion type="multiple" className="space-y-3">
                {analysis.sections.map((section, i) => (
                  <AccordionItem key={i} value={`section-${i}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Badge className={getScoreBg(section.score)}>
                          {section.score}/100
                        </Badge>
                        <span className="font-medium">{section.name}</span>
                        {section.recommendations.length > 0 && (
                          <Badge variant="secondary">
                            {section.recommendations.length} recommandations
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {/* Contenu actuel */}
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Contenu actuel</p>
                        <p className="text-sm text-muted-foreground">{section.currentContent}</p>
                      </div>

                      {/* Problèmes */}
                      {section.issues.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2 text-red-600">Problèmes identifiés</p>
                          <div className="flex flex-wrap gap-2">
                            {section.issues.map((issue, j) => (
                              <Badge key={j} variant="destructive" className="text-xs">
                                {issue}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommandations */}
                      {section.recommendations.map((rec, j) => (
                        <Card key={j} className="border-primary/30">
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityColor(rec.priority)}>
                                {rec.priority}
                              </Badge>
                              <span className="text-sm font-medium capitalize">{rec.type}</span>
                            </div>
                            
                            {rec.current && (
                              <div className="p-3 bg-red-500/10 rounded-lg">
                                <p className="text-xs text-red-600 mb-1">Actuel</p>
                                <p className="text-sm">{rec.current}</p>
                              </div>
                            )}
                            
                            <div className="p-3 bg-green-500/10 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-green-600">Recommandé</p>
                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(rec.suggested)}>
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                              <p className="text-sm font-medium">{rec.suggested}</p>
                            </div>
                            
                            <p className="text-xs text-muted-foreground">{rec.reason}</p>
                            <Badge variant="outline" className="text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {rec.impact}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}

                      {/* Insight concurrent */}
                      {section.competitorInsight && (
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                          <p className="text-xs text-blue-600 mb-1">Ce que font les concurrents</p>
                          <p className="text-sm">{section.competitorInsight}</p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            {/* SEO */}
            <TabsContent value="seo" className="space-y-4">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recommandations SEO</CardTitle>
                  <Button onClick={applySEORecommendations} disabled={isApplying} className="gap-2">
                    {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Appliquer tout
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Titre SEO
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Actuel</p>
                        <p className="text-sm">{analysis.seoRecommendations.title.current}</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-green-600">Optimisé</p>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(analysis.seoRecommendations.title.suggested)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-medium">{analysis.seoRecommendations.title.suggested}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.seoRecommendations.title.keywords.map((kw, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Meta Description
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Actuelle</p>
                        <p className="text-sm">{analysis.seoRecommendations.description.current}</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-green-600">Optimisée</p>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(analysis.seoRecommendations.description.suggested)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-medium">{analysis.seoRecommendations.description.suggested}</p>
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Mots-clés cibles</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Principal</p>
                        <Badge>{analysis.seoRecommendations.keywords.primary}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Secondaires</p>
                        <div className="flex flex-wrap gap-1">
                          {analysis.seoRecommendations.keywords.secondary.map((kw, i) => (
                            <Badge key={i} variant="secondary">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Longue traîne</p>
                        <div className="flex flex-wrap gap-1">
                          {analysis.seoRecommendations.keywords.longTail.map((kw, i) => (
                            <Badge key={i} variant="outline">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Liens internes */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Liens internes suggérés</h4>
                    <ul className="space-y-1">
                      {analysis.seoRecommendations.internalLinks.map((link, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <ArrowRight className="w-3 h-3 text-primary" />
                          {link}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conversion */}
            <TabsContent value="conversion" className="space-y-4">
              {/* CTA */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MousePointer className="w-5 h-5" />
                    Optimisation CTA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">CTA actuel</p>
                      <p className="text-sm">{analysis.conversionRecommendations.cta.current}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <p className="text-xs text-green-600 mb-1">CTA optimisé</p>
                      <p className="text-sm font-medium">{analysis.conversionRecommendations.cta.suggested}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Placement</p>
                      <p className="text-sm">{analysis.conversionRecommendations.cta.placement}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Design</p>
                      <p className="text-sm">{analysis.conversionRecommendations.cta.design}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preuve sociale */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preuve sociale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Actuel</p>
                    <p className="text-sm">{analysis.conversionRecommendations.socialProof.current}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">Amélioration suggérée</p>
                    <p className="text-sm">{analysis.conversionRecommendations.socialProof.suggested}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Exemples à implémenter</p>
                    <ul className="space-y-1">
                      {analysis.conversionRecommendations.socialProof.examples.map((ex, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Copywriting */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Corrections copywriting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.copywritingFixes.map((fix, i) => (
                      <div key={i} className="p-4 border rounded-lg space-y-2">
                        <Badge variant="outline">{fix.location}</Badge>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="p-2 bg-red-500/10 rounded">
                            <p className="text-xs text-red-600 mb-1">Avant</p>
                            <p className="text-sm">{fix.current}</p>
                          </div>
                          <div className="p-2 bg-green-500/10 rounded">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-green-600">Après</p>
                              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(fix.suggested)}>
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="text-sm font-medium">{fix.suggested}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          Technique: {fix.technique}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Actions */}
            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions prioritaires</CardTitle>
                  <CardDescription>Classées par impact et facilité d'implémentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.priorityActions.map((action, i) => (
                      <div key={i} className="p-4 border rounded-lg flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{action.action}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline">
                              ⏱️ {action.timeEstimate}
                            </Badge>
                            <Badge variant="secondary">
                              📈 {action.impact}
                            </Badge>
                            <Badge variant={action.difficulty === 'facile' ? 'default' : action.difficulty === 'moyen' ? 'secondary' : 'destructive'}>
                              {action.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Problèmes techniques */}
              {analysis.technicalIssues.length > 0 && (
                <Card className="border-red-500/30">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Problèmes techniques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.technicalIssues.map((issue, i) => (
                        <div key={i} className="p-3 bg-red-500/10 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={issue.severity === 'haute' ? 'destructive' : issue.severity === 'moyenne' ? 'secondary' : 'outline'}>
                              {issue.severity}
                            </Badge>
                            <p className="font-medium">{issue.issue}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{issue.fix}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
