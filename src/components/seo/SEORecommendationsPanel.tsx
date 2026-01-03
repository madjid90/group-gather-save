import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Check, 
  X, 
  Wand2, 
  ChevronRight,
  ChevronLeft,
  CheckCircle2, 
  Edit2, 
  FileText,
  Globe,
  Tag,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useSEOMetrics } from '@/hooks/useSEOMetrics';
import { useSEOPageSettings } from '@/hooks/useSEOPageSettings';
import { useSEOAnalyzer } from '@/hooks/useSEOAnalyzer';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Types
interface GeneratedRecommendation {
  type: 'meta_title' | 'meta_description' | 'og_title' | 'og_description' | 'keywords' | 'canonical';
  field: string;
  label: string;
  icon: React.ReactNode;
  suggestedValue: string;
  priority: 'high' | 'medium' | 'low';
  validated: boolean;
  editedValue?: string;
}

type WorkflowStep = 'select' | 'generate' | 'validate' | 'apply';

const STEPS: { key: WorkflowStep; label: string; description: string }[] = [
  { key: 'select', label: 'Sélection', description: 'Choisir la page' },
  { key: 'generate', label: 'Génération', description: 'Recommandations IA' },
  { key: 'validate', label: 'Validation', description: 'Vérifier chaque point' },
  { key: 'apply', label: 'Application', description: 'Appliquer les changements' },
];

const AVAILABLE_PAGES = [
  { url: '/', label: 'Accueil' },
  { url: '/inscription', label: 'Inscription' },
  { url: '/faq', label: 'FAQ' },
  { url: '/contact', label: 'Contact' },
  { url: '/organiser-achat-groupe', label: 'Organiser un achat groupé' },
];

export function SEORecommendationsPanel() {
  const { toast } = useToast();
  const { metrics, isLoading: metricsLoading } = useSEOMetrics();
  const { settings, updateSettings, isLoading: settingsLoading } = useSEOPageSettings();
  const { generateMetaTags, isLoading: aiLoading } = useSEOAnalyzer();
  
  // Workflow state
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('select');
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<GeneratedRecommendation[]>([]);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyProgress, setApplyProgress] = useState(0);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Get current step index
  const currentStepIndex = STEPS.findIndex(s => s.key === currentStep);

  // Get page content based on URL
  const getPageContent = (url: string): string => {
    const pageContents: Record<string, string> = {
      '/': 'Switchly - Achat groupé énergie et internet. Rejoignez des milliers de Français pour économiser sur vos factures d\'électricité, gaz et internet. 100% gratuit, sans engagement. Plus de 2500 participants. Économies jusqu\'à 30%. Fournisseurs partenaires: EDF, Engie, TotalEnergies, Orange, Free, SFR, Bouygues. Achat groupé pour réduire vos factures. Négociation collective des tarifs énergie et télécoms. Service 100% digital et transparent. Inscription en 2 minutes. Comparateur indépendant.',
      '/inscription': 'Inscription gratuite à Switchly. Rejoignez l\'achat groupé énergie et internet. Formulaire simple et rapide. Économisez sur vos factures sans engagement. Créez votre compte en quelques clics.',
      '/faq': 'Questions fréquentes sur Switchly. Comment fonctionne l\'achat groupé? Quels sont les fournisseurs partenaires? Combien puis-je économiser? Est-ce vraiment gratuit? Réponses à toutes vos questions sur l\'achat groupé énergie internet.',
      '/contact': 'Contactez l\'équipe Switchly. Formulaire de contact, assistance et support. Réponse sous 24h garantie. Questions sur l\'achat groupé énergie internet.',
      '/organiser-achat-groupe': 'Organisez un achat groupé dans votre commune, copropriété ou entreprise. Devenez partenaire Switchly et faites économiser votre communauté. Programme partenaires collectivités.'
    };
    return pageContents[url] || `Page ${url} - Switchly achat groupé énergie internet`;
  };

  // Get metrics for selected page
  const getPageMetrics = () => {
    return metrics.find(m => m.page_url === selectedPage);
  };

  // Get existing settings for selected page
  const getPageSettings = () => {
    return settings.find(s => s.page_url === selectedPage);
  };

  // Generate recommendations
  const handleGenerate = async () => {
    if (!selectedPage) return;
    
    setIsGenerating(true);
    try {
      const pageContent = getPageContent(selectedPage);
      const pageMetrics = getPageMetrics();
      const existingSettings = getPageSettings();
      
      const siteData = {
        participants: '2500+',
        savings: '30%',
        partners: 'EDF, Engie, TotalEnergies, Orange, Free, SFR, Bouygues'
      };
      
      const result = await generateMetaTags({
        url: selectedPage,
        pageTitle: selectedPage === '/' ? 'Switchly - Achat Groupé Énergie & Internet' : `Switchly - ${selectedPage.replace('/', '').replace(/-/g, ' ')}`,
        content: pageContent,
        metrics: pageMetrics,
        existingSettings: existingSettings,
        siteData: siteData,
      });

      if (result) {
        setAiReasoning(result.reasoning || null);

        const newRecommendations: GeneratedRecommendation[] = [
          {
            type: 'meta_title',
            field: 'meta_title',
            label: 'Titre SEO',
            icon: <FileText className="w-4 h-4" />,
            suggestedValue: result.title || '',
            priority: 'high',
            validated: false,
          },
          {
            type: 'meta_description',
            field: 'meta_description',
            label: 'Meta Description',
            icon: <FileText className="w-4 h-4" />,
            suggestedValue: result.description || '',
            priority: 'high',
            validated: false,
          },
          {
            type: 'og_title',
            field: 'og_title',
            label: 'Open Graph Title',
            icon: <Globe className="w-4 h-4" />,
            suggestedValue: result.ogTitle || result.title || '',
            priority: 'medium',
            validated: false,
          },
          {
            type: 'og_description',
            field: 'og_description',
            label: 'Open Graph Description',
            icon: <Globe className="w-4 h-4" />,
            suggestedValue: result.ogDescription || result.description || '',
            priority: 'medium',
            validated: false,
          },
          {
            type: 'keywords',
            field: 'keywords',
            label: 'Mots-clés',
            icon: <Tag className="w-4 h-4" />,
            suggestedValue: (result.keywords || []).join(', '),
            priority: 'low',
            validated: false,
          },
        ];

        if (result.canonical) {
          newRecommendations.push({
            type: 'canonical',
            field: 'canonical_url',
            label: 'URL Canonique',
            icon: <Globe className="w-4 h-4" />,
            suggestedValue: result.canonical,
            priority: 'low',
            validated: false,
          });
        }

        setRecommendations(newRecommendations);
        setCurrentStep('validate');
        
        toast({
          title: "Recommandations générées",
          description: `${newRecommendations.length} suggestions SEO pour ${selectedPage}`,
        });
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les recommandations",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle validation of a recommendation
  const toggleValidation = (field: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.field === field 
          ? { ...rec, validated: !rec.validated }
          : rec
      )
    );
  };

  // Validate all recommendations
  const validateAll = () => {
    setRecommendations(prev => prev.map(rec => ({ ...rec, validated: true })));
  };

  // Update edited value
  const saveEdit = (field: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.field === field 
          ? { ...rec, suggestedValue: editValue, editedValue: editValue, validated: true }
          : rec
      )
    );
    setEditingField(null);
    setEditValue('');
  };

  // Apply all validated recommendations
  const handleApplyAll = async () => {
    if (!selectedPage) return;
    
    const validatedRecs = recommendations.filter(r => r.validated);
    if (validatedRecs.length === 0) {
      toast({
        title: "Aucune recommandation validée",
        description: "Veuillez valider au moins une recommandation",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('apply');
    setIsApplying(true);
    setApplyProgress(0);

    try {
      // Build update object
      const updates: Record<string, any> = {};
      
      for (let i = 0; i < validatedRecs.length; i++) {
        const rec = validatedRecs[i];
        const value = rec.editedValue || rec.suggestedValue;
        
        if (rec.field === 'keywords') {
          updates[rec.field] = value.split(',').map(k => k.trim());
        } else {
          updates[rec.field] = value;
        }
        
        // Update progress
        setApplyProgress(Math.round(((i + 1) / validatedRecs.length) * 100));
        
        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Apply all updates at once
      const success = await updateSettings(selectedPage, updates);
      
      if (success) {
        toast({
          title: "Recommandations appliquées",
          description: `${validatedRecs.length} paramètres SEO mis à jour pour ${selectedPage}`,
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
      setIsApplying(false);
    }
  };

  // Reset workflow
  const resetWorkflow = () => {
    setCurrentStep('select');
    setSelectedPage(null);
    setRecommendations([]);
    setAiReasoning(null);
    setApplyProgress(0);
  };

  // Get priority badge
  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Haute</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Moyenne</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Basse</Badge>;
    }
  };

  // Count validated recommendations
  const validatedCount = recommendations.filter(r => r.validated).length;

  const isLoading = metricsLoading || settingsLoading;

  if (isLoading && metrics.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      index < currentStepIndex 
                        ? "bg-primary text-primary-foreground"
                        : index === currentStepIndex
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {index < currentStepIndex ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      "text-sm font-medium",
                      index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div 
                    className={cn(
                      "flex-1 h-0.5 mx-4 mt-[-1.5rem]",
                      index < currentStepIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Page Selection */}
      {currentStep === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Sélectionner une page à optimiser
            </CardTitle>
            <CardDescription>
              Choisissez la page pour laquelle générer des recommandations SEO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AVAILABLE_PAGES.map(page => {
                const existingSettings = settings.find(s => s.page_url === page.url);
                const hasSettings = existingSettings && (
                  existingSettings.meta_title || 
                  existingSettings.meta_description
                );
                
                return (
                  <button
                    key={page.url}
                    onClick={() => setSelectedPage(page.url)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all hover:shadow-md",
                      selectedPage === page.url 
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{page.label}</span>
                      {hasSettings && (
                        <Badge variant="secondary" className="text-xs">
                          Configuré
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{page.url}</p>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => setCurrentStep('generate')}
                disabled={!selectedPage}
              >
                Continuer
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Generate Recommendations */}
      {currentStep === 'generate' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Génération des recommandations IA
            </CardTitle>
            <CardDescription>
              L'IA analyse la page et génère des recommandations SEO personnalisées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Page: {AVAILABLE_PAGES.find(p => p.url === selectedPage)?.label}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Cliquez sur le bouton ci-dessous pour générer des recommandations SEO 
                optimisées basées sur l'analyse du contenu et des métriques existantes.
              </p>
              
              <Button 
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating || aiLoading}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Générer les recommandations
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('select')}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Validate Recommendations */}
      {currentStep === 'validate' && (
        <div className="space-y-4">
          {/* AI Reasoning */}
          {aiReasoning && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Analyse IA</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{aiReasoning}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Valider les recommandations
                  </CardTitle>
                  <CardDescription>
                    Cochez les recommandations à appliquer. Vous pouvez modifier chaque valeur.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {validatedCount}/{recommendations.length} validées
                  </Badge>
                  <Button variant="outline" size="sm" onClick={validateAll}>
                    Tout valider
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div 
                    key={rec.field}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      rec.validated 
                        ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" 
                        : "bg-card border-border"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox 
                        checked={rec.validated}
                        onCheckedChange={() => toggleValidation(rec.field)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {rec.icon}
                          <span className="font-medium">{rec.label}</span>
                          {getPriorityBadge(rec.priority)}
                          {rec.editedValue && (
                            <Badge variant="secondary" className="text-xs">
                              Modifié
                            </Badge>
                          )}
                        </div>
                        
                        {editingField === rec.field ? (
                          <div className="space-y-2">
                            {rec.field === 'meta_description' || rec.field === 'og_description' ? (
                              <Textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                rows={3}
                                className="w-full"
                              />
                            ) : (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full"
                              />
                            )}
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => saveEdit(rec.field)}>
                                <Check className="w-3 h-3 mr-1" />
                                Sauvegarder
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setEditingField(null);
                                  setEditValue('');
                                }}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Annuler
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded flex-1 break-words">
                              {rec.editedValue || rec.suggestedValue || <em>Aucune valeur</em>}
                            </p>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setEditingField(rec.field);
                                setEditValue(rec.editedValue || rec.suggestedValue);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('generate')}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Regénérer
                </Button>
                <Button 
                  onClick={handleApplyAll}
                  disabled={validatedCount === 0}
                >
                  Appliquer {validatedCount} recommandation(s)
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Apply Recommendations */}
      {currentStep === 'apply' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Application des recommandations
            </CardTitle>
            <CardDescription>
              Les paramètres SEO sont en cours de mise à jour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8">
              {isApplying ? (
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-4">
                    Application en cours...
                  </h3>
                  <Progress value={applyProgress} className="max-w-md mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {applyProgress}% terminé
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Recommandations appliquées !
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {validatedCount} paramètres SEO ont été mis à jour pour la page{' '}
                    <span className="font-medium">{selectedPage}</span>.
                    Les changements sont maintenant actifs.
                  </p>
                  
                  <div className="space-y-3">
                    {recommendations.filter(r => r.validated).map(rec => (
                      <div 
                        key={rec.field}
                        className="flex items-center justify-center gap-2 text-sm"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{rec.label}</span>
                        <span className="text-muted-foreground">mis à jour</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="mt-8" onClick={resetWorkflow}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Optimiser une autre page
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
