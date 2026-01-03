import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, Save, Globe, Trash2, Eye, EyeOff, ExternalLink, Copy, ListPlus, CheckCircle2, XCircle, Pencil, RefreshCw } from 'lucide-react';
import { useLocalSeoPages, GeneratedContent } from '@/hooks/useLocalSeoPages';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';

// 100 plus grandes villes de France par population
const TOP_100_VILLES_FRANCE = [
  "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Montpellier", "Strasbourg", "Bordeaux", "Lille",
  "Rennes", "Reims", "Saint-Étienne", "Le Havre", "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Villeurbanne",
  "Saint-Denis", "Clermont-Ferrand", "Le Mans", "Aix-en-Provence", "Brest", "Tours", "Amiens", "Limoges", "Annecy", "Perpignan",
  "Boulogne-Billancourt", "Metz", "Besançon", "Orléans", "Saint-Denis", "Argenteuil", "Rouen", "Montreuil", "Mulhouse", "Caen",
  "Nancy", "Tourcoing", "Roubaix", "Nanterre", "Vitry-sur-Seine", "Avignon", "Créteil", "Dunkerque", "Poitiers", "Aubervilliers",
  "Asnières-sur-Seine", "Colombes", "Versailles", "Aulnay-sous-Bois", "Saint-Pierre", "Courbevoie", "Le Tampon", "Cherbourg-en-Cotentin", "Rueil-Malmaison", "Béziers",
  "Champigny-sur-Marne", "Fort-de-France", "Pau", "Calais", "Saint-Maur-des-Fossés", "Cannes", "Antibes", "Mamoudzou", "Drancy", "Mérignac",
  "Colmar", "Ajaccio", "Issy-les-Moulineaux", "Saint-Nazaire", "Noisy-le-Grand", "Bourges", "La Rochelle", "Vénissieux", "Levallois-Perret", "Évry-Courcouronnes",
  "Cergy", "Valence", "Pessac", "Ivry-sur-Seine", "Quimper", "Cayenne", "Troyes", "Antony", "La Seyne-sur-Mer", "Villeneuve-d'Ascq",
  "Neuilly-sur-Seine", "Sarcelles", "Clichy", "Chambéry", "Lorient", "Montauban", "Niort", "Saint-Quentin", "Hyères", "Beauvais"
];

// Groupes régionaux pour une meilleure organisation
const VILLES_PAR_REGION = {
  "Île-de-France": ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Argenteuil", "Montreuil", "Nanterre", "Vitry-sur-Seine", "Créteil", "Aubervilliers", "Asnières-sur-Seine", "Colombes", "Versailles", "Aulnay-sous-Bois", "Courbevoie", "Rueil-Malmaison", "Champigny-sur-Marne", "Saint-Maur-des-Fossés", "Drancy", "Issy-les-Moulineaux", "Noisy-le-Grand", "Levallois-Perret", "Évry-Courcouronnes", "Cergy", "Ivry-sur-Seine", "Antony", "Neuilly-sur-Seine", "Sarcelles", "Clichy"],
  "Auvergne-Rhône-Alpes": ["Lyon", "Grenoble", "Saint-Étienne", "Villeurbanne", "Clermont-Ferrand", "Annecy", "Valence", "Vénissieux", "Chambéry"],
  "Provence-Alpes-Côte d'Azur": ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Avignon", "Cannes", "Antibes", "La Seyne-sur-Mer", "Hyères"],
  "Occitanie": ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers", "Montauban"],
  "Nouvelle-Aquitaine": ["Bordeaux", "Limoges", "Poitiers", "Pau", "Mérignac", "La Rochelle", "Pessac", "Niort"],
  "Hauts-de-France": ["Lille", "Reims", "Amiens", "Tourcoing", "Roubaix", "Dunkerque", "Calais", "Villeneuve-d'Ascq", "Saint-Quentin", "Beauvais"],
  "Grand Est": ["Strasbourg", "Metz", "Mulhouse", "Nancy", "Colmar", "Troyes"],
  "Pays de la Loire": ["Nantes", "Angers", "Le Mans", "Saint-Nazaire"],
  "Bretagne": ["Rennes", "Brest", "Quimper", "Lorient"],
  "Normandie": ["Le Havre", "Rouen", "Caen", "Cherbourg-en-Cotentin"],
  "Bourgogne-Franche-Comté": ["Dijon", "Besançon", "Bourges"],
  "Centre-Val de Loire": ["Tours", "Orléans"],
  "Corse": ["Ajaccio"],
  "Outre-mer": ["Saint-Denis", "Saint-Pierre", "Le Tampon", "Fort-de-France", "Mamoudzou", "Cayenne"]
};

export const LocalSeoPanel = () => {
  const [ville, setVille] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [serviceType, setServiceType] = useState('tous');
  const [editedContent, setEditedContent] = useState<GeneratedContent | null>(null);
  
  // Bulk generation state
  const [bulkCities, setBulkCities] = useState('');
  const [bulkServiceType, setBulkServiceType] = useState('tous');
  const [bulkPublish, setBulkPublish] = useState(false);
  
  const {
    pages,
    isLoading,
    isGenerating,
    generatedContent,
    bulkProgress,
    fetchPages,
    generateContent,
    regenerateContent,
    generateBulk,
    resetBulkProgress,
    savePage,
    loadPageForEdit,
    togglePublish,
    deletePage,
    clearGeneratedContent
  } = useLocalSeoPages();

  const [isEditing, setIsEditing] = useState(false);
  const [editingPage, setEditingPage] = useState<typeof pages[0] | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (generatedContent && !isEditing) {
      setEditedContent(generatedContent);
    }
  }, [generatedContent, isEditing]);

  const handleGenerate = async () => {
    if (!ville.trim()) return;
    setIsEditing(false);
    await generateContent(ville.trim(), codePostal.trim() || undefined, serviceType);
  };

  const handleEdit = (page: typeof pages[0]) => {
    const content = loadPageForEdit(page);
    setEditedContent(content);
    setEditingPage(page);
    setIsEditing(true);
  };

  const handleRegenerate = async () => {
    if (!editingPage) return;
    const regenerated = await regenerateContent(editingPage, serviceType);
    if (regenerated) {
      setEditedContent(regenerated);
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!editedContent) return;
    await savePage(editedContent, publish);
    setEditedContent(null);
    setIsEditing(false);
    setVille('');
    setCodePostal('');
  };

  const handleCancelEdit = () => {
    setEditedContent(null);
    setEditingPage(null);
    setIsEditing(false);
    clearGeneratedContent();
  };

  const handleBulkGenerate = async () => {
    const cities = bulkCities
      .split('\n')
      .map(c => c.trim())
      .filter(c => c.length > 0);
    
    if (cities.length === 0) return;
    
    await generateBulk(cities, bulkServiceType, bulkPublish);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const siteUrl = 'https://switchly.fr';

  const isBulkGenerating = bulkProgress.status === 'generating' || bulkProgress.status === 'saving';
  const progressPercent = bulkProgress.total > 0 
    ? Math.round((bulkProgress.current / bulkProgress.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Générateur avec tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Générateur de pages SEO locales
          </CardTitle>
          <CardDescription>
            Utilisez l'IA pour générer automatiquement du contenu optimisé pour chaque ville
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Ville unique
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <ListPlus className="h-4 w-4" />
                Génération en lot
              </TabsTrigger>
            </TabsList>

            {/* Single city generation */}
            <TabsContent value="single" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ville">Ville *</Label>
                  <Input
                    id="ville"
                    placeholder="Ex: Lyon, Marseille..."
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codePostal">Code postal</Label>
                  <Input
                    id="codePostal"
                    placeholder="Ex: 69000"
                    value={codePostal}
                    onChange={(e) => setCodePostal(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type de service</Label>
                  <Select value={serviceType} onValueChange={setServiceType} disabled={isGenerating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tous">Énergie + Internet</SelectItem>
                      <SelectItem value="energie">Énergie uniquement</SelectItem>
                      <SelectItem value="internet">Internet uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !ville.trim()}
                className="w-full md:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Générer le contenu
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Bulk generation */}
            <TabsContent value="bulk" className="space-y-4">
              {bulkProgress.status === 'idle' ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bulkCities">Liste des villes (une par ligne)</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <ListPlus className="h-4 w-4 mr-2" />
                            Charger une liste
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
                          <DropdownMenuLabel>Listes prédéfinies</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setBulkCities(TOP_100_VILLES_FRANCE.join('\n'))}>
                            <span className="font-medium">Top 100 villes de France</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setBulkCities(TOP_100_VILLES_FRANCE.slice(0, 50).join('\n'))}>
                            <span>Top 50 villes</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setBulkCities(TOP_100_VILLES_FRANCE.slice(0, 20).join('\n'))}>
                            <span>Top 20 villes</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setBulkCities(TOP_100_VILLES_FRANCE.slice(0, 10).join('\n'))}>
                            <span>Top 10 villes</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Par région</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {Object.entries(VILLES_PAR_REGION).map(([region, villes]) => (
                            <DropdownMenuItem 
                              key={region} 
                              onClick={() => setBulkCities(prev => {
                                const existing = prev.split('\n').filter(c => c.trim());
                                const merged = [...new Set([...existing, ...villes])];
                                return merged.join('\n');
                              })}
                            >
                              <span>{region} ({villes.length})</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Textarea
                      id="bulkCities"
                      placeholder="Paris&#10;Lyon&#10;Marseille&#10;Toulouse&#10;Nice&#10;Nantes&#10;Bordeaux..."
                      value={bulkCities}
                      onChange={(e) => setBulkCities(e.target.value)}
                      rows={8}
                      className="font-mono"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{bulkCities.split('\n').filter(c => c.trim()).length} ville(s) détectée(s)</span>
                      {bulkCities.trim() && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setBulkCities('')}>
                          Effacer
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type de service</Label>
                      <Select value={bulkServiceType} onValueChange={setBulkServiceType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tous">Énergie + Internet</SelectItem>
                          <SelectItem value="energie">Énergie uniquement</SelectItem>
                          <SelectItem value="internet">Internet uniquement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label htmlFor="bulkPublish">Publier automatiquement</Label>
                        <p className="text-xs text-muted-foreground">Les pages seront publiées directement</p>
                      </div>
                      <Switch
                        id="bulkPublish"
                        checked={bulkPublish}
                        onCheckedChange={setBulkPublish}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleBulkGenerate} 
                    disabled={!bulkCities.trim()}
                    className="w-full md:w-auto"
                  >
                    <ListPlus className="h-4 w-4 mr-2" />
                    Générer {bulkCities.split('\n').filter(c => c.trim()).length} pages
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Progress display */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        {bulkProgress.status === 'done' ? 'Terminé' : (
                          bulkProgress.status === 'saving' 
                            ? `Sauvegarde de ${bulkProgress.currentCity}...`
                            : `Génération de ${bulkProgress.currentCity}...`
                        )}
                      </span>
                      <span className="font-medium">{bulkProgress.current}/{bulkProgress.total}</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  {/* Results summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-700 dark:text-green-400">
                          {bulkProgress.completed.length} réussie(s)
                        </span>
                      </div>
                      {bulkProgress.completed.length > 0 && (
                        <ScrollArea className="h-24">
                          <div className="space-y-1">
                            {bulkProgress.completed.map((city, idx) => (
                              <Badge key={idx} variant="secondary" className="mr-1 mb-1">
                                {city}
                              </Badge>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                    <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-red-700 dark:text-red-400">
                          {bulkProgress.failed.length} échec(s)
                        </span>
                      </div>
                      {bulkProgress.failed.length > 0 && (
                        <ScrollArea className="h-24">
                          <div className="space-y-1">
                            {bulkProgress.failed.map((city, idx) => (
                              <Badge key={idx} variant="destructive" className="mr-1 mb-1">
                                {city}
                              </Badge>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </div>

                  {bulkProgress.status === 'done' && (
                    <Button 
                      onClick={() => {
                        resetBulkProgress();
                        setBulkCities('');
                      }}
                      variant="outline"
                    >
                      Nouvelle génération en lot
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Prévisualisation et édition du contenu généré */}
      {editedContent && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {isEditing ? 'Édition de' : 'Contenu généré pour'} {editedContent.ville}
                {isEditing && <Badge variant="secondary" className="ml-2">Mode édition</Badge>}
              </span>
              <div className="flex gap-2">
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isGenerating || isLoading}
                    title="Régénérer le contenu avec l'IA"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Régénérer
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Annuler
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave(false)}
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Sauvegarder' : 'Brouillon'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSave(true)}
                  disabled={isLoading}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Publier
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              URL: {siteUrl}/ville/{editedContent.slug}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titre (H1)</Label>
                <Input
                  value={editedContent.titre}
                  onChange={(e) => setEditedContent({ ...editedContent, titre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Meta description</Label>
                <Input
                  value={editedContent.meta_description}
                  onChange={(e) => setEditedContent({ ...editedContent, meta_description: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Contenu Hero</Label>
              <Textarea
                value={editedContent.contenu_hero}
                onChange={(e) => setEditedContent({ ...editedContent, contenu_hero: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Contenu principal (HTML)</Label>
              <Textarea
                value={editedContent.contenu_principal}
                onChange={(e) => setEditedContent({ ...editedContent, contenu_principal: e.target.value })}
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Avantages (HTML)</Label>
              <Textarea
                value={editedContent.contenu_avantages}
                onChange={(e) => setEditedContent({ ...editedContent, contenu_avantages: e.target.value })}
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Call-to-Action</Label>
              <Textarea
                value={editedContent.contenu_cta}
                onChange={(e) => setEditedContent({ ...editedContent, contenu_cta: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Mots-clés</Label>
              <div className="flex flex-wrap gap-2">
                {editedContent.mots_cles.map((mot, idx) => (
                  <Badge key={idx} variant="secondary">{mot}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des pages existantes */}
      <Card>
        <CardHeader>
          <CardTitle>Pages SEO locales</CardTitle>
          <CardDescription>
            {pages.length} page{pages.length > 1 ? 's' : ''} créée{pages.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && pages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : pages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune page SEO locale créée. Utilisez le générateur ci-dessus.
            </p>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {pages.map((page) => (
                  <div 
                    key={page.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{page.ville}</span>
                        {page.code_postal && (
                          <span className="text-sm text-muted-foreground">({page.code_postal})</span>
                        )}
                        <Badge variant={page.publie ? "default" : "secondary"}>
                          {page.publie ? 'Publiée' : 'Brouillon'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {page.titre}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          /ville/{page.slug}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(`${siteUrl}/ville/${page.slug}`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(page)}
                        title="Éditer"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {page.publie && (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Voir la page"
                        >
                          <a href={`/ville/${page.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePublish(page.id, !page.publie)}
                        title={page.publie ? 'Dépublier' : 'Publier'}
                      >
                        {page.publie ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deletePage(page.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
