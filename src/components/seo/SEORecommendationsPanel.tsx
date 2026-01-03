import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Check, 
  X, 
  Wand2, 
  AlertTriangle, 
  CheckCircle2, 
  Edit2, 
  RefreshCw,
  FileText,
  Globe,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import { useSEOMetrics, SEOMetric } from '@/hooks/useSEOMetrics';
import { useSEOPageSettings, SEORecommendation } from '@/hooks/useSEOPageSettings';
import { useSEOAnalyzer } from '@/hooks/useSEOAnalyzer';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GeneratedRecommendation {
  type: 'meta_title' | 'meta_description' | 'og_title' | 'og_description' | 'keywords';
  field: string;
  label: string;
  icon: React.ReactNode;
  suggestedValue: string;
  priority: 'high' | 'medium' | 'low';
}

export function SEORecommendationsPanel() {
  const { toast } = useToast();
  const { metrics, latestMetric, fetchMetrics, isLoading: metricsLoading } = useSEOMetrics();
  const { settings, applyRecommendation, updateSettings, isLoading: settingsLoading } = useSEOPageSettings();
  const { generateMetaTags, isLoading: aiLoading } = useSEOAnalyzer();
  
  const [selectedPage, setSelectedPage] = useState<string>('/');
  const [recommendations, setRecommendations] = useState<GeneratedRecommendation[]>([]);
  const [appliedFields, setAppliedFields] = useState<Set<string>>(new Set());
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Get unique page URLs from metrics
  const pageUrls = [...new Set(metrics.map(m => m.page_url))];

  // Check which fields are already applied for the selected page
  useEffect(() => {
    const pageSettings = settings.find(s => s.page_url === selectedPage);
    if (pageSettings) {
      const applied = new Set<string>();
      if (pageSettings.meta_title) applied.add('meta_title');
      if (pageSettings.meta_description) applied.add('meta_description');
      if (pageSettings.og_title) applied.add('og_title');
      if (pageSettings.og_description) applied.add('og_description');
      if (pageSettings.keywords && pageSettings.keywords.length > 0) applied.add('keywords');
      setAppliedFields(applied);
    } else {
      setAppliedFields(new Set());
    }
  }, [selectedPage, settings]);

  const generateRecommendationsForPage = async () => {
    setIsGenerating(true);
    try {
      const result = await generateMetaTags({
        url: selectedPage,
        pageTitle: document.title,
      });

      if (result) {
        const newRecommendations: GeneratedRecommendation[] = [
          {
            type: 'meta_title',
            field: 'meta_title',
            label: 'Titre SEO',
            icon: <FileText className="w-4 h-4" />,
            suggestedValue: result.title || '',
            priority: 'high',
          },
          {
            type: 'meta_description',
            field: 'meta_description',
            label: 'Meta Description',
            icon: <FileText className="w-4 h-4" />,
            suggestedValue: result.description || '',
            priority: 'high',
          },
          {
            type: 'og_title',
            field: 'og_title',
            label: 'Open Graph Title',
            icon: <Globe className="w-4 h-4" />,
            suggestedValue: result.ogTitle || result.title || '',
            priority: 'medium',
          },
          {
            type: 'og_description',
            field: 'og_description',
            label: 'Open Graph Description',
            icon: <Globe className="w-4 h-4" />,
            suggestedValue: result.ogDescription || result.description || '',
            priority: 'medium',
          },
          {
            type: 'keywords',
            field: 'keywords',
            label: 'Mots-clés',
            icon: <Tag className="w-4 h-4" />,
            suggestedValue: (result.keywords || []).join(', '),
            priority: 'low',
          },
        ];

        setRecommendations(newRecommendations);
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

  const handleApply = async (rec: GeneratedRecommendation) => {
    const value = rec.field === 'keywords' 
      ? rec.suggestedValue.split(',').map(k => k.trim())
      : rec.suggestedValue;

    const success = await applyRecommendation(
      selectedPage,
      rec.field,
      rec.field === 'keywords' ? JSON.stringify(value) : rec.suggestedValue
    );

    if (success) {
      setAppliedFields(prev => new Set([...prev, rec.field]));
    }
  };

  const handleApplyEdited = async (field: string) => {
    const value = field === 'keywords'
      ? editValue.split(',').map(k => k.trim())
      : editValue;

    const success = await applyRecommendation(
      selectedPage,
      field,
      field === 'keywords' ? JSON.stringify(value) : editValue
    );

    if (success) {
      setAppliedFields(prev => new Set([...prev, field]));
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleApplyAll = async () => {
    for (const rec of recommendations) {
      if (!appliedFields.has(rec.field)) {
        await handleApply(rec);
      }
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Priorité haute</Badge>;
      case 'medium':
        return <Badge variant="secondary">Priorité moyenne</Badge>;
      case 'low':
        return <Badge variant="outline">Priorité basse</Badge>;
    }
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Recommandations SEO</h2>
          <p className="text-muted-foreground">Générez et appliquez des optimisations SEO</p>
        </div>
      </div>

      {/* Page Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sélectionner une page</CardTitle>
          <CardDescription>Choisissez la page à optimiser</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['/', '/inscription', '/faq', '/contact', '/organiser-achat-groupe'].map(url => (
              <Button
                key={url}
                variant={selectedPage === url ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedPage(url);
                  setRecommendations([]);
                }}
              >
                {url === '/' ? 'Accueil' : url.replace('/', '').replace(/-/g, ' ')}
              </Button>
            ))}
            {pageUrls.filter(url => !['/', '/inscription', '/faq', '/contact', '/organiser-achat-groupe'].includes(url)).map(url => (
              <Button
                key={url}
                variant={selectedPage === url ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedPage(url);
                  setRecommendations([]);
                }}
              >
                {url}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Page sélectionnée: {selectedPage}</h3>
              <p className="text-sm text-muted-foreground">
                {appliedFields.size > 0 
                  ? `${appliedFields.size} champ(s) déjà configuré(s)`
                  : 'Aucun paramètre SEO configuré'}
              </p>
            </div>
            <Button onClick={generateRecommendationsForPage} disabled={isGenerating || aiLoading}>
              <Wand2 className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Génération...' : 'Générer les recommandations'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recommandations pour {selectedPage}</CardTitle>
                <CardDescription>
                  {recommendations.filter(r => !appliedFields.has(r.field)).length} recommandation(s) à appliquer
                </CardDescription>
              </div>
              <Button 
                onClick={handleApplyAll}
                disabled={recommendations.every(r => appliedFields.has(r.field))}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Tout appliquer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div 
                  key={rec.field}
                  className={`p-4 rounded-lg border ${
                    appliedFields.has(rec.field) 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                      : 'bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {rec.icon}
                        <span className="font-medium">{rec.label}</span>
                        {getPriorityBadge(rec.priority)}
                        {appliedFields.has(rec.field) && (
                          <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            <Check className="w-3 h-3 mr-1" />
                            Appliqué
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
                            <Button size="sm" onClick={() => handleApplyEdited(rec.field)}>
                              <Check className="w-3 h-3 mr-1" />
                              Appliquer
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingField(null);
                              setEditValue('');
                            }}>
                              <X className="w-3 h-3 mr-1" />
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          {rec.suggestedValue || <em>Aucune valeur suggérée</em>}
                        </p>
                      )}
                    </div>

                    {!appliedFields.has(rec.field) && editingField !== rec.field && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingField(rec.field);
                            setEditValue(rec.suggestedValue);
                          }}
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Modifier
                        </Button>
                        <Button size="sm" onClick={() => handleApply(rec)}>
                          <Check className="w-3 h-3 mr-1" />
                          Appliquer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres SEO appliqués</CardTitle>
          <CardDescription>Configuration actuelle des pages</CardDescription>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun paramètre SEO configuré</p>
              <p className="text-sm">Générez des recommandations pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {settings.map((setting) => (
                <div key={setting.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-medium">{setting.page_url}</span>
                      <p className="text-xs text-muted-foreground">
                        Mis à jour le {format(new Date(setting.updated_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </p>
                    </div>
                    <Badge variant={setting.is_active ? 'default' : 'secondary'}>
                      {setting.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {setting.meta_title && (
                      <div className="flex gap-2">
                        <span className="text-muted-foreground">Titre:</span>
                        <span className="truncate">{setting.meta_title}</span>
                      </div>
                    )}
                    {setting.meta_description && (
                      <div className="flex gap-2">
                        <span className="text-muted-foreground">Description:</span>
                        <span className="truncate">{setting.meta_description}</span>
                      </div>
                    )}
                    {setting.keywords && setting.keywords.length > 0 && (
                      <div className="flex gap-2 col-span-2">
                        <span className="text-muted-foreground">Mots-clés:</span>
                        <div className="flex flex-wrap gap-1">
                          {setting.keywords.slice(0, 5).map((kw, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                          ))}
                          {setting.keywords.length > 5 && (
                            <Badge variant="outline" className="text-xs">+{setting.keywords.length - 5}</Badge>
                          )}
                        </div>
                      </div>
                    )}
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
