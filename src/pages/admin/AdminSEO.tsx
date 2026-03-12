import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Loader2, MapPin, FileText, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSEO() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [slugInput, setSlugInput] = useState('');
  const [stats, setStats] = useState({ total: 0, avecIA: 0, sansIA: 0 });
  const [tarifs, setTarifs] = useState<any>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [
      { count: total },
      { count: avecIA },
      { data: tarifsData },
    ] = await Promise.all([
      (supabase.from('villes') as any).select('*', { count: 'exact', head: true }),
      (supabase.from('villes') as any).select('*', { count: 'exact', head: true }).not('contenu_genere_at', 'is', null),
      (supabase.from('tarifs_energie') as any).select('*').eq('id', 'current').single(),
    ]);
    setStats({ total: total || 0, avecIA: avecIA || 0, sansIA: (total || 0) - (avecIA || 0) });
    setTarifs(tarifsData);
    setLoading(false);
  };

  const regenerateContent = async () => {
    if (!slugInput.trim()) {
      toast({ title: 'Slug requis', description: 'Entrez le slug de la ville (ex: paris-75001)', variant: 'destructive' });
      return;
    }
    setRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ville-content', {
        body: { slug: slugInput.trim(), type: 'both' },
      });
      if (error) throw error;
      if (data?.warning === 'no_api_key') {
        toast({ title: 'Clé API absente', description: 'LOVABLE_API_KEY non configurée — contenu IA ignoré.' });
      } else {
        toast({ title: 'Contenu régénéré', description: `Sections: ${data?.generated?.join(', ') || 'aucune'}` });
      }
      setSlugInput('');
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
    setRegenerating(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">SEO & Contenu</h1>
        <p className="text-sm text-muted-foreground">Gestion des pages locales et tarifs CRE</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Pages villes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avec contenu IA</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold text-secondary">{stats.avecIA}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Sans contenu IA</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold text-destructive">{stats.sansIA}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tarifs CRE */}
      <Card className="rounded-xl border border-border">
        <CardHeader className="p-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4" /> Tarifs CRE en vigueur
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-xs">TRV Électricité</p>
              <p className="font-bold">{tarifs?.trv_elec_kwh?.toFixed(4) || '—'} €/kWh</p>
              <p className="text-xs text-muted-foreground">{tarifs?.source_trv_elec || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Tarif repère Gaz</p>
              <p className="font-bold">{tarifs?.trv_gaz_kwh?.toFixed(4) || '—'} €/kWh</p>
              <p className="text-xs text-muted-foreground">{tarifs?.source_trv_gaz || '—'}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Dernière MAJ : {tarifs?.updated_at ? new Date(tarifs.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'} · par {tarifs?.updated_by || '—'}
          </p>
        </CardContent>
      </Card>

      {/* Régénérer contenu */}
      <Card className="rounded-xl border border-border">
        <CardHeader className="p-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Régénérer contenu IA d'une ville
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex gap-2">
            <Input
              placeholder="slug (ex: paris-75001)"
              value={slugInput}
              onChange={e => setSlugInput(e.target.value)}
              className="text-base"
            />
            <Button onClick={regenerateContent} disabled={regenerating} size="sm">
              {regenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Régénérer
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Génère les sections intro, contexte, conseils et meta pour les pages électricité et gaz de cette ville.
          </p>
        </CardContent>
      </Card>

      {/* Info routes */}
      <Card className="rounded-xl border border-border">
        <CardHeader className="p-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Search className="w-4 h-4" /> Routes SEO
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm space-y-1 text-muted-foreground">
          <p>• <strong>/electricite/:slug</strong> — Pages électricité par ville</p>
          <p>• <strong>/gaz/:slug</strong> — Pages gaz par ville</p>
          <p>• <strong>/electricite/</strong> — Hub électricité (index)</p>
          <p>• <strong>/gaz/</strong> — Hub gaz (index)</p>
        </CardContent>
      </Card>
    </div>
  );
}
