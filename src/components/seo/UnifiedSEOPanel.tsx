import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Globe, 
  Copy, 
  RefreshCw,
  Rocket,
  Users,
  MousePointer,
  FileText,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Check,
  Save
} from 'lucide-react';
import { useCompetitorAnalysis, FullCompetitorAnalysis } from '@/hooks/useCompetitorAnalysis';
import { useSEOPageSettings } from '@/hooks/useSEOPageSettings';
import { useToast } from '@/hooks/use-toast';

interface AcquisitionBestPractices {
  heroSection: {
    headline: string;
    subheadline: string;
    ctaText: string;
    socialProof: string;
  };
  trustElements: string[];
  urgencyTactics: string[];
  copywritingTips: string[];
  conversionOptimizations: string[];
}

interface ExtendedAnalysis extends FullCompetitorAnalysis {
  acquisitionBestPractices?: AcquisitionBestPractices;
}

interface RecommendationItem {
  id: string;
  field: string;
  label: string;
  value: string;
  pageUrl: string;
  selected: boolean;
}

const AVAILABLE_PAGES = [
  { url: '/', label: 'Accueil' },
  { url: '/inscription', label: 'Inscription' },
  { url: '/faq', label: 'FAQ' },
  { url: '/contact', label: 'Contact' },
  { url: '/organiser-achat-groupe', label: 'Organiser un achat groupé' },
];

export const UnifiedSEOPanel = () => {
  const { 
    isLoading, 
    competitors, 
    analysis: baseAnalysis, 
    fetchCompetitors, 
    analyzeAllCompetitors,
    clearAnalysis 
  } = useCompetitorAnalysis();
  const { updateSettings, isLoading: isApplying } = useSEOPageSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPage, setSelectedPage] = useState('/');
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [applyProgress, setApplyProgress] = useState(0);
  const [isApplyingRecs, setIsApplyingRecs] = useState(false);

  const analysis = baseAnalysis as ExtendedAnalysis | null;

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  // Générer les recommandations à partir de l'analyse
  useEffect(() => {
    if (analysis?.switchlyRecommendations?.metaTagsOptimizations) {
      const meta = analysis.switchlyRecommendations.metaTagsOptimizations;
      const keywords = analysis.switchlyRecommendations.keywordsToTarget || [];
      
      const newRecs: RecommendationItem[] = [
        {
          id: 'meta_title',
          field: 'meta_title',
          label: 'Titre SEO',
          value: meta.title,
          pageUrl: selectedPage,
          selected: true,
        },
        {
          id: 'meta_description',
          field: 'meta_description',
          label: 'Meta Description',
          value: meta.description,
          pageUrl: selectedPage,
          selected: true,
        },
        {
          id: 'og_title',
          field: 'og_title',
          label: 'Open Graph Title',
          value: meta.title,
          pageUrl: selectedPage,
          selected: true,
        },
        {
          id: 'og_description',
          field: 'og_description',
          label: 'Open Graph Description',
          value: meta.description,
          pageUrl: selectedPage,
          selected: true,
        },
      ];
      
      if (keywords.length > 0) {
        newRecs.push({
          id: 'keywords',
          field: 'keywords',
          label: 'Mots-clés',
          value: keywords.slice(0, 10).join(', '),
          pageUrl: selectedPage,
          selected: true,
        });
      }
      
      setRecommendations(newRecs);
    }
  }, [analysis, selectedPage]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié", description: "Texte copié dans le presse-papiers" });
  };

  const toggleRecommendation = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => rec.id === id ? { ...rec, selected: !rec.selected } : rec)
    );
  };

  const selectAllRecommendations = () => {
    setRecommendations(prev => prev.map(rec => ({ ...rec, selected: true })));
  };

  const applySelectedRecommendations = async () => {
    const selectedRecs = recommendations.filter(r => r.selected);
    if (selectedRecs.length === 0) {
      toast({
        title: "Aucune recommandation sélectionnée",
        description: "Veuillez sélectionner au moins une recommandation à appliquer",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingRecs(true);
    setApplyProgress(0);

    try {
      const updates: Record<string, any> = {};
      
      for (let i = 0; i < selectedRecs.length; i++) {
        const rec = selectedRecs[i];
        
        if (rec.field === 'keywords') {
          updates[rec.field] = rec.value.split(',').map(k => k.trim());
        } else {
          updates[rec.field] = rec.value;
        }
        
        setApplyProgress(Math.round(((i + 1) / selectedRecs.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      const success = await updateSettings(selectedPage, updates);
      
      if (success) {
        toast({
          title: "Recommandations appliquées",
          description: `${selectedRecs.length} paramètres SEO mis à jour pour ${selectedPage}`,
        });
      }
    } catch (error) {
      console.error('Error applying recommendations:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer les recommandations",
        variant: "destructive",
      });
    } finally {
      setIsApplyingRecs(false);
      setApplyProgress(0);
    }
  };

  const selectedCount = recommendations.filter(r => r.selected).length;

  return (
    <div className="space-y-6">
      {/* Header avec CTA principal */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-primary" />
            Intelligence SEO & Conversion
          </CardTitle>
          <CardDescription className="text-base">
            Analyse concurrentielle + meilleures pratiques d'acquisition des leaders mondiaux
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={analyzeAllCompetitors} 
              disabled={isLoading}
              size="lg"
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyse IA en cours...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Lancer l'analyse complète
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
          
          {!analysis && !isLoading && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                L'analyse va scraper vos {Object.keys(competitors).length} concurrents et générer des recommandations basées sur les meilleures pratiques d'acquisition.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-semibold text-lg">Analyse IA en cours...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Scraping des concurrents + génération des recommandations (30-60 sec)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats de l'analyse */}
      {analysis && !('parseError' in analysis) && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview" className="gap-2">
              <Zap className="w-4 h-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="apply" className="gap-2">
              <Save className="w-4 h-4" />
              Appliquer
            </TabsTrigger>
            <TabsTrigger value="competitors" className="gap-2">
              <Target className="w-4 h-4" />
              Concurrents
            </TabsTrigger>
            <TabsTrigger value="acquisition" className="gap-2">
              <Rocket className="w-4 h-4" />
              Acquisition
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Actions
            </TabsTrigger>
          </TabsList>

          {/* Tab: Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            {/* Résumé exécutif */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Résumé exécutif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{analysis.summary}</p>
              </CardContent>
            </Card>

            {/* Avantages compétitifs */}
            <Card className="border-green-500/50 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Vos avantages concurrentiels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {analysis.competitiveAdvantages?.map((advantage, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-green-500/10 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <span className="font-medium">{advantage}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Meta tags preview */}
            {analysis.switchlyRecommendations?.metaTagsOptimizations && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Meta tags optimisés
                    </CardTitle>
                    <Button onClick={() => setActiveTab('apply')} className="gap-2">
                      <Save className="w-4 h-4" />
                      Appliquer ces recommandations
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Title SEO</label>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(analysis.switchlyRecommendations.metaTagsOptimizations.title)}
                        className="gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copier
                      </Button>
                    </div>
                    <code className="text-sm block">
                      {analysis.switchlyRecommendations.metaTagsOptimizations.title}
                    </code>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Meta Description</label>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(analysis.switchlyRecommendations.metaTagsOptimizations.description)}
                        className="gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copier
                      </Button>
                    </div>
                    <code className="text-sm block">
                      {analysis.switchlyRecommendations.metaTagsOptimizations.description}
                    </code>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Appliquer les recommandations */}
          <TabsContent value="apply" className="space-y-6">
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="w-5 h-5 text-primary" />
                  Appliquer les recommandations SEO
                </CardTitle>
                <CardDescription>
                  Sélectionnez les recommandations à appliquer et la page cible
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sélection de la page */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Page à optimiser</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVAILABLE_PAGES.map(page => (
                      <button
                        key={page.url}
                        onClick={() => setSelectedPage(page.url)}
                        className={`p-3 rounded-lg border-2 text-left transition-all text-sm ${
                          selectedPage === page.url 
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="font-medium">{page.label}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{page.url}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Liste des recommandations */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">
                      Recommandations ({selectedCount}/{recommendations.length} sélectionnées)
                    </label>
                    <Button variant="ghost" size="sm" onClick={selectAllRecommendations}>
                      Tout sélectionner
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {recommendations.map(rec => (
                      <div 
                        key={rec.id}
                        className={`p-4 rounded-lg border transition-all ${
                          rec.selected ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={rec.id}
                            checked={rec.selected}
                            onCheckedChange={() => toggleRecommendation(rec.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <label 
                              htmlFor={rec.id}
                              className="text-sm font-medium cursor-pointer flex items-center gap-2"
                            >
                              {rec.label}
                              {rec.selected && <Check className="w-4 h-4 text-primary" />}
                            </label>
                            <p className="text-sm text-muted-foreground mt-1 break-all">
                              {rec.value}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(rec.value)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bouton appliquer */}
                {isApplyingRecs && (
                  <div className="space-y-2">
                    <Progress value={applyProgress} />
                    <p className="text-sm text-center text-muted-foreground">
                      Application en cours... {applyProgress}%
                    </p>
                  </div>
                )}

                <Button 
                  size="lg" 
                  className="w-full gap-2"
                  onClick={applySelectedRecommendations}
                  disabled={isApplyingRecs || selectedCount === 0}
                >
                  {isApplyingRecs ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Application en cours...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Appliquer {selectedCount} recommandation{selectedCount > 1 ? 's' : ''} à {selectedPage}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Concurrents */}
          <TabsContent value="competitors" className="space-y-6">
            {analysis.competitorAnalysis && analysis.competitorAnalysis.length > 0 && (
              <>
                {analysis.competitorAnalysis.map((comp, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        {comp.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 bg-green-500/10 rounded-lg">
                          <h5 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Forces SEO
                          </h5>
                          <ul className="space-y-2">
                            {comp.seoStrengths?.map((s, j) => (
                              <li key={j} className="text-sm flex items-start gap-2">
                                <span className="text-green-600 mt-1">•</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-destructive/10 rounded-lg">
                          <h5 className="text-sm font-semibold text-destructive mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Faiblesses à exploiter
                          </h5>
                          <ul className="space-y-2">
                            {comp.seoWeaknesses?.map((w, j) => (
                              <li key={j} className="text-sm flex items-start gap-2">
                                <span className="text-destructive mt-1">•</span>
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-semibold mb-2">Mots-clés ciblés</h5>
                        <div className="flex flex-wrap gap-2">
                          {comp.keywordsTheyRank?.map((kw, j) => (
                            <Badge 
                              key={j} 
                              variant="secondary" 
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                              onClick={() => copyToClipboard(kw)}
                            >
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <h5 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Comment les battre
                        </h5>
                        <p className="text-sm">{comp.howToBeat}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

          {/* Tab: Acquisition & Conversion */}
          <TabsContent value="acquisition" className="space-y-6">
            {analysis.acquisitionBestPractices ? (
              <>
                {/* Hero Section optimisé */}
                <Card className="border-primary/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-primary" />
                      Hero Section optimisée
                    </CardTitle>
                    <CardDescription>
                      Basé sur les meilleures pratiques des leaders (Airbnb, Booking, Netflix)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">HEADLINE</label>
                        <p className="text-xl font-bold mt-1">{analysis.acquisitionBestPractices.heroSection.headline}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">SOUS-TITRE</label>
                        <p className="text-base mt-1">{analysis.acquisitionBestPractices.heroSection.subheadline}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">CTA</label>
                          <Button className="mt-1">{analysis.acquisitionBestPractices.heroSection.ctaText}</Button>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-medium text-muted-foreground">PREUVE SOCIALE</label>
                          <p className="text-sm mt-1 text-muted-foreground">{analysis.acquisitionBestPractices.heroSection.socialProof}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Éléments de confiance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Éléments de confiance à ajouter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {analysis.acquisitionBestPractices.trustElements?.map((element, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                          <span>{element}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Techniques d'urgence */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Techniques d'urgence éthiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {analysis.acquisitionBestPractices.urgencyTactics?.map((tactic, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg">
                          <Zap className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                          <span>{tactic}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Optimisations Copywriting */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Améliorations copywriting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {analysis.acquisitionBestPractices.copywritingTips?.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                          <Lightbulb className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Optimisations conversion */}
                <Card className="border-green-500/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <MousePointer className="w-5 h-5" />
                      Optimisations conversion (CRO)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {analysis.acquisitionBestPractices.conversionOptimizations?.map((opt, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-green-500/10 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                          <span className="font-medium">{opt}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Lancez une nouvelle analyse pour obtenir les recommandations d'acquisition et conversion.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Actions prioritaires */}
          <TabsContent value="actions" className="space-y-6">
            {/* Actions urgentes */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Actions urgentes (cette semaine)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.switchlyRecommendations?.urgentActions?.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-sm font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mots-clés prioritaires */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Mots-clés prioritaires à cibler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.switchlyRecommendations?.keywordsToTarget?.map((keyword, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground px-3 py-1 text-sm"
                      onClick={() => copyToClipboard(keyword)}
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contenus à créer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Contenus à créer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {analysis.switchlyRecommendations?.contentGaps?.map((gap, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">{gap}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Différenciateurs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Différenciateurs à mettre en avant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {analysis.switchlyRecommendations?.differentiators?.map((diff, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">{diff}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Liste des concurrents (avant analyse) */}
      {!analysis && !isLoading && Object.keys(competitors).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Concurrents à analyser</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {Object.entries(competitors).map(([key, competitor]) => (
                <div 
                  key={key}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
