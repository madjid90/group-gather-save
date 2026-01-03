import { useState } from 'react';
import { useContentOptimizer, ContentItem } from '@/hooks/useContentOptimizer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Wand2, 
  FileText, 
  Heading1,
  MousePointer,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  List,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function ContentOptimizerDashboard() {
  const { toast } = useToast();
  const {
    isLoading,
    optimizationResult,
    singleOptimization,
    bulkOptimization,
    optimizeContent,
    optimizeSingle,
    optimizeBulk,
    extractPageContent,
    clearResults,
  } = useContentOptimizer();

  const [activeTab, setActiveTab] = useState('bulk');
  const [manualText, setManualText] = useState('');
  const [manualType, setManualType] = useState<'heading' | 'paragraph' | 'cta'>('paragraph');
  const [extractedContent, setExtractedContent] = useState<ContentItem[]>([]);
  const [autoApply, setAutoApply] = useState(false);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['hero']));

  const handleExtractContent = () => {
    const content = extractPageContent();
    setExtractedContent(content);
    toast({
      title: "Contenu extrait",
      description: `${content.length} éléments trouvés sur la page`,
    });
  };

  const handleOptimizeExtracted = async () => {
    if (extractedContent.length === 0) {
      handleExtractContent();
      return;
    }
    await optimizeContent(extractedContent);
  };

  const handleBulkOptimize = async () => {
    await optimizeBulk();
  };

  const handleSingleOptimize = async () => {
    if (!manualText.trim()) {
      toast({
        title: "Texte requis",
        description: "Veuillez entrer un texte à optimiser",
        variant: "destructive",
      });
      return;
    }
    await optimizeSingle(manualText, manualType);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItems(prev => new Set(prev).add(id));
    setTimeout(() => {
      setCopiedItems(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
    toast({
      title: "Copié !",
      description: "Le texte optimisé a été copié",
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">Bon</Badge>;
    return <Badge className="bg-red-500">À améliorer</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'heading': return <Heading1 className="w-4 h-4" />;
      case 'cta': return <MousePointer className="w-4 h-4" />;
      case 'meta': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-primary" />
            Optimisation de Contenu SEO
          </h2>
          <p className="text-muted-foreground">
            Optimisez automatiquement tout le contenu de votre site pour le référencement
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-apply"
              checked={autoApply}
              onCheckedChange={setAutoApply}
            />
            <Label htmlFor="auto-apply" className="text-sm">
              Application auto
            </Label>
          </div>
          <Button 
            onClick={handleBulkOptimize} 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Optimiser toute la page
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Optimisation globale
          </TabsTrigger>
          <TabsTrigger value="elements" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Par élément
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Manuel
          </TabsTrigger>
        </TabsList>

        {/* Bulk Optimization Tab */}
        <TabsContent value="bulk" className="space-y-4">
          {bulkOptimization ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Résultats de l'optimisation</CardTitle>
                    <div className="flex items-center gap-3">
                      <span className={`text-3xl font-bold ${getScoreColor(bulkOptimization.overallScore)}`}>
                        {bulkOptimization.overallScore}/100
                      </span>
                      {getScoreBadge(bulkOptimization.overallScore)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={bulkOptimization.overallScore} />
                  
                  {/* Meta optimisés */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Titre de page optimisé</Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(bulkOptimization.pageTitle, 'title')}
                        >
                          {copiedItems.has('title') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <code className="block p-3 bg-muted rounded-lg text-sm">
                        {bulkOptimization.pageTitle}
                      </code>
                      <p className="text-xs text-muted-foreground">
                        {bulkOptimization.pageTitle.length}/60 caractères
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Meta description optimisée</Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(bulkOptimization.metaDescription, 'desc')}
                        >
                          {copiedItems.has('desc') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <code className="block p-3 bg-muted rounded-lg text-sm">
                        {bulkOptimization.metaDescription}
                      </code>
                      <p className="text-xs text-muted-foreground">
                        {bulkOptimization.metaDescription.length}/160 caractères
                      </p>
                    </div>
                  </div>

                  {/* Sections optimisées */}
                  <div className="space-y-3 mt-6">
                    <h4 className="font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Sections optimisées
                    </h4>
                    {bulkOptimization.sections.map((section) => (
                      <Collapsible 
                        key={section.sectionId}
                        open={expandedSections.has(section.sectionId)}
                        onOpenChange={() => toggleSection(section.sectionId)}
                      >
                        <Card>
                          <CollapsibleTrigger className="w-full">
                            <CardHeader className="py-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg capitalize flex items-center gap-2">
                                  {section.sectionId}
                                  <Badge variant="secondary" className="text-xs">
                                    {section.headings.length + section.paragraphs.length + section.ctas.length} éléments
                                  </Badge>
                                </CardTitle>
                                {expandedSections.has(section.sectionId) ? 
                                  <ChevronUp className="w-4 h-4" /> : 
                                  <ChevronDown className="w-4 h-4" />
                                }
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="space-y-4 pt-0">
                              {/* Headings */}
                              {section.headings.length > 0 && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium flex items-center gap-2">
                                    <Heading1 className="w-4 h-4" /> Titres
                                  </Label>
                                  {section.headings.map((heading, idx) => (
                                    <div key={idx} className="p-3 bg-muted rounded-lg space-y-2">
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Badge variant="outline">H{heading.level}</Badge>
                                        Original
                                      </div>
                                      <p className="text-sm line-through opacity-60">{heading.original}</p>
                                      <div className="flex items-center gap-2">
                                        <ArrowRight className="w-4 h-4 text-primary" />
                                        <p className="text-sm font-medium">{heading.optimized}</p>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => copyToClipboard(heading.optimized, `h-${section.sectionId}-${idx}`)}
                                        >
                                          {copiedItems.has(`h-${section.sectionId}-${idx}`) ? 
                                            <Check className="w-3 h-3" /> : 
                                            <Copy className="w-3 h-3" />
                                          }
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Paragraphs */}
                              {section.paragraphs.length > 0 && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Textes
                                  </Label>
                                  {section.paragraphs.map((para, idx) => (
                                    <div key={idx} className="p-3 bg-muted rounded-lg space-y-2">
                                      <p className="text-xs text-muted-foreground">Original</p>
                                      <p className="text-sm line-through opacity-60">{para.original}</p>
                                      <div className="flex items-start gap-2">
                                        <ArrowRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                        <p className="text-sm">{para.optimized}</p>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="flex-shrink-0"
                                          onClick={() => copyToClipboard(para.optimized, `p-${section.sectionId}-${idx}`)}
                                        >
                                          {copiedItems.has(`p-${section.sectionId}-${idx}`) ? 
                                            <Check className="w-3 h-3" /> : 
                                            <Copy className="w-3 h-3" />
                                          }
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* CTAs */}
                              {section.ctas.length > 0 && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium flex items-center gap-2">
                                    <MousePointer className="w-4 h-4" /> Boutons / CTA
                                  </Label>
                                  {section.ctas.map((cta, idx) => (
                                    <div key={idx} className="p-3 bg-muted rounded-lg flex items-center gap-3">
                                      <span className="text-sm line-through opacity-60">{cta.original}</span>
                                      <ArrowRight className="w-4 h-4 text-primary" />
                                      <span className="text-sm font-medium text-primary">{cta.optimized}</span>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => copyToClipboard(cta.optimized, `cta-${section.sectionId}-${idx}`)}
                                      >
                                        {copiedItems.has(`cta-${section.sectionId}-${idx}`) ? 
                                          <Check className="w-3 h-3" /> : 
                                          <Copy className="w-3 h-3" />
                                        }
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    ))}
                  </div>

                  {/* Améliorations */}
                  {bulkOptimization.improvements.length > 0 && (
                    <Card className="bg-primary/5 border-primary/20">
                      <CardHeader className="py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          Améliorations apportées
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="space-y-1">
                          {bulkOptimization.improvements.map((improvement, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              <Button variant="outline" onClick={clearResults} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Nouvelle optimisation
              </Button>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center mb-4">
                  Cliquez sur "Optimiser toute la page" pour lancer l'analyse et l'optimisation SEO automatique
                </p>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  L'IA analysera tous les titres, textes, CTAs et meta tags de votre page et proposera des versions optimisées pour le référencement.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Elements Tab */}
        <TabsContent value="elements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Optimisation par élément</CardTitle>
                  <CardDescription>
                    Extrayez et optimisez les éléments individuellement
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExtractContent} disabled={isLoading}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Extraire le contenu
                  </Button>
                  <Button onClick={handleOptimizeExtracted} disabled={isLoading || extractedContent.length === 0}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    Optimiser
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {extractedContent.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">
                      {extractedContent.filter(i => i.type === 'heading').length} titres
                    </Badge>
                    <Badge variant="secondary">
                      {extractedContent.filter(i => i.type === 'paragraph').length} paragraphes
                    </Badge>
                    <Badge variant="secondary">
                      {extractedContent.filter(i => i.type === 'cta').length} CTAs
                    </Badge>
                    <Badge variant="secondary">
                      {extractedContent.filter(i => i.type === 'meta').length} meta
                    </Badge>
                  </div>
                  
                  {optimizationResult ? (
                    <div className="space-y-3">
                      {optimizationResult.optimizedItems.map((item) => (
                        <div key={item.id} className="p-4 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(item.type)}
                              <Badge variant="outline" className="capitalize">{item.type}</Badge>
                              <span className={`text-sm font-medium ${getScoreColor(item.seoScore)}`}>
                                {item.seoScore}/100
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(item.optimized, item.id)}
                            >
                              {copiedItems.has(item.id) ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                          <p className="text-sm line-through opacity-60">{item.original}</p>
                          <div className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-primary mt-1" />
                            <p className="text-sm font-medium">{item.optimized}</p>
                          </div>
                          {item.changes.length > 0 && (
                            <div className="flex gap-1 flex-wrap mt-2">
                              {item.changes.map((change, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {change}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {optimizationResult.globalRecommendations.length > 0 && (
                        <Card className="bg-yellow-500/10 border-yellow-500/20">
                          <CardContent className="py-4">
                            <p className="font-medium mb-2">Recommandations globales</p>
                            <ul className="text-sm space-y-1">
                              {optimizationResult.globalRecommendations.map((rec, idx) => (
                                <li key={idx} className="text-muted-foreground">• {rec}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {extractedContent.slice(0, 10).map((item) => (
                        <div key={item.id} className="p-3 bg-muted rounded-lg flex items-center gap-3">
                          {getTypeIcon(item.type)}
                          <span className="text-sm truncate">{item.content}</span>
                        </div>
                      ))}
                      {extractedContent.length > 10 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +{extractedContent.length - 10} autres éléments
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Cliquez sur "Extraire le contenu" pour analyser la page</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Tab */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimisation manuelle</CardTitle>
              <CardDescription>
                Entrez un texte spécifique à optimiser
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={manualType === 'heading' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setManualType('heading')}
                >
                  <Heading1 className="w-4 h-4 mr-1" />
                  Titre
                </Button>
                <Button
                  variant={manualType === 'paragraph' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setManualType('paragraph')}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Texte
                </Button>
                <Button
                  variant={manualType === 'cta' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setManualType('cta')}
                >
                  <MousePointer className="w-4 h-4 mr-1" />
                  CTA
                </Button>
              </div>

              <Textarea
                placeholder="Entrez le texte à optimiser..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="min-h-[120px]"
              />

              <Button 
                onClick={handleSingleOptimize} 
                disabled={isLoading || !manualText.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                Optimiser ce texte
              </Button>

              {singleOptimization && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Résultat</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getScoreColor(singleOptimization.seoScore)}`}>
                        {singleOptimization.seoScore}/100
                      </span>
                      {getScoreBadge(singleOptimization.seoScore)}
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <p className="text-sm line-through opacity-60">{singleOptimization.original}</p>
                    <div className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary mt-1" />
                      <p className="text-sm font-medium flex-1">{singleOptimization.optimized}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(singleOptimization.optimized, 'single')}
                      >
                        {copiedItems.has('single') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {singleOptimization.changes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Changements appliqués :</p>
                      <div className="flex gap-1 flex-wrap">
                        {singleOptimization.changes.map((change, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {change}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {singleOptimization.keywords.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Mots-clés intégrés :</p>
                      <div className="flex gap-1 flex-wrap">
                        {singleOptimization.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
