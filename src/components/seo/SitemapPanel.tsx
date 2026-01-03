import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw, ExternalLink, Download, Copy, Check, Globe, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

interface SitemapData {
  generated_at: string;
  total_urls: number;
  static_pages?: number;
  local_seo_pages?: number;
  site_url: string;
  urls: SitemapUrl[];
}

export const SitemapPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sitemapData, setSitemapData] = useState<SitemapData | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState<'google' | 'bing' | null>(null);
  const [submitted, setSubmitted] = useState<{ google: boolean; bing: boolean }>({ google: false, bing: false });

  // URL du sitemap pour la production
  const PRODUCTION_SITEMAP_URL = 'https://switchly.fr/sitemap.xml';
  const DYNAMIC_SITEMAP_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sitemap`;

  const fetchSitemap = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sitemap?format=json`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch sitemap');
      
      const jsonData = await response.json();
      setSitemapData(jsonData);
    } catch (error) {
      console.error('Error fetching sitemap:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le sitemap",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSitemap();
  }, []);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(DYNAMIC_SITEMAP_URL);
    setCopied(true);
    toast({ title: "Copié", description: "URL du sitemap copiée" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadXml = async () => {
    try {
      const response = await fetch(
        DYNAMIC_SITEMAP_URL,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      const xml = await response.text();
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Téléchargé", description: "sitemap.xml téléchargé" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le sitemap",
        variant: "destructive"
      });
    }
  };

  const handleSubmitToGoogle = async () => {
    setSubmitting('google');
    try {
      // Google Ping URL pour notifier d'une mise à jour du sitemap
      const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(PRODUCTION_SITEMAP_URL)}`;
      
      // Ouvrir dans un nouvel onglet (la réponse est juste une page de confirmation)
      window.open(pingUrl, '_blank');
      
      setSubmitted(prev => ({ ...prev, google: true }));
      toast({ 
        title: "Sitemap soumis à Google", 
        description: "Google a été notifié de votre sitemap. L'indexation peut prendre quelques jours." 
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre à Google",
        variant: "destructive"
      });
    } finally {
      setSubmitting(null);
    }
  };

  const handleSubmitToBing = async () => {
    setSubmitting('bing');
    try {
      // Bing Ping URL pour notifier d'une mise à jour du sitemap
      const pingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(PRODUCTION_SITEMAP_URL)}`;
      
      // Ouvrir dans un nouvel onglet
      window.open(pingUrl, '_blank');
      
      setSubmitted(prev => ({ ...prev, bing: true }));
      toast({ 
        title: "Sitemap soumis à Bing", 
        description: "Bing a été notifié de votre sitemap. L'indexation peut prendre quelques jours." 
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre à Bing",
        variant: "destructive"
      });
    } finally {
      setSubmitting(null);
    }
  };

  const getPriorityColor = (priority?: number) => {
    if (!priority) return "secondary";
    if (priority >= 0.8) return "default";
    if (priority >= 0.5) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sitemap Dynamique</h2>
          <p className="text-muted-foreground">Généré automatiquement à partir des routes et pages SEO locales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSitemap} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
          <Button variant="outline" onClick={handleDownloadXml}>
            <Download className="w-4 h-4 mr-2" />
            Télécharger XML
          </Button>
        </div>
      </div>

      {/* Sitemap URL Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            URL du Sitemap
          </CardTitle>
          <CardDescription>
            Soumettez cette URL à Google Search Console et Bing Webmaster Tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm font-mono truncate">
              {DYNAMIC_SITEMAP_URL}
            </code>
            <Button size="sm" variant="outline" onClick={handleCopyUrl}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a 
                href={DYNAMIC_SITEMAP_URL} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>

          {/* Boutons de soumission aux moteurs de recherche */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              onClick={handleSubmitToGoogle}
              disabled={submitting === 'google'}
              className="flex-1"
              variant={submitted.google ? "outline" : "default"}
            >
              {submitting === 'google' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : submitted.google ? (
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {submitted.google ? 'Soumis à Google' : 'Soumettre à Google'}
            </Button>
            <Button 
              onClick={handleSubmitToBing}
              disabled={submitting === 'bing'}
              className="flex-1"
              variant={submitted.bing ? "outline" : "secondary"}
            >
              {submitting === 'bing' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : submitted.bing ? (
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {submitted.bing ? 'Soumis à Bing' : 'Soumettre à Bing'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            La soumission notifie les moteurs de recherche de mettre à jour leur index. L'indexation complète peut prendre quelques jours.
          </p>
        </CardContent>
      </Card>

      {/* Sitemap Stats */}
      {sitemapData && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total URLs</CardDescription>
              <CardTitle className="text-3xl">{sitemapData.total_urls}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pages statiques</CardDescription>
              <CardTitle className="text-3xl">{sitemapData.static_pages || '-'}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pages SEO locales</CardDescription>
              <CardTitle className="text-3xl">{sitemapData.local_seo_pages || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Dernière génération</CardDescription>
              <CardTitle className="text-lg">
                {new Date(sitemapData.generated_at).toLocaleString('fr-FR')}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* URLs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pages indexées</CardTitle>
          <CardDescription>Liste des URLs incluses dans le sitemap</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : sitemapData ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Fréquence</TableHead>
                  <TableHead>Dernière modification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sitemapData.urls.map((url, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">
                      {url.loc || '/'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(url.priority)}>
                        {url.priority?.toFixed(1) || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {url.changefreq || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {url.lastmod || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Aucune donnée disponible
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
