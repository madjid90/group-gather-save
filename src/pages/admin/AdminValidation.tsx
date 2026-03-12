import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle, XCircle, RefreshCw, Loader2, ExternalLink,
  ChevronDown, ChevronUp, AlertTriangle, Eye, Filter
} from 'lucide-react';

interface VilleValidation {
  slug: string;
  nom: string;
  code_postal: string;
  departement: string | null;
  population: number | null;
  statut_publication: string;
  validation_ia_score: number | null;
  validation_ia_statut: string | null;
  validation_ia_commentaire: string | null;
  validation_ia_at: string | null;
  validation_humaine_statut: string | null;
  contenu_elec_intro: string | null;
  contenu_gaz_intro: string | null;
  contenu_genere_at: string | null;
}

const STATUT_LABELS: Record<string, { label: string; color: string }> = {
  draft:             { label: 'Brouillon',         color: 'bg-gray-100 text-gray-600' },
  generation:        { label: 'Génération...',      color: 'bg-blue-100 text-blue-600 animate-pulse' },
  validation_ia:     { label: 'Validation IA...',   color: 'bg-purple-100 text-purple-600 animate-pulse' },
  a_valider_humain:  { label: 'À valider',          color: 'bg-orange-100 text-orange-700 font-semibold' },
  publiee:           { label: 'Publiée ✅',          color: 'bg-green-100 text-green-700' },
  rejetee:           { label: 'Rejetée',            color: 'bg-red-100 text-red-700' },
};

export default function AdminValidation() {
  const { toast } = useToast();
  const [villes, setVilles] = useState<VilleValidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState<'a_valider_humain' | 'tous' | 'publiee' | 'rejetee'>('a_valider_humain');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actions, setActions] = useState<Record<string, string>>({});

  const fetchVilles = useCallback(async () => {
    setLoading(true);
    let query = (supabase.from('villes') as any)
      .select(`slug, nom, code_postal, departement, population,
               statut_publication, validation_ia_score, validation_ia_statut,
               validation_ia_commentaire, validation_ia_at,
               validation_humaine_statut, contenu_elec_intro, contenu_gaz_intro, contenu_genere_at`)
      .order('validation_ia_at', { ascending: false });

    if (filtre !== 'tous') {
      query = query.eq('statut_publication', filtre);
    }

    const { data } = await query.limit(100);
    if (data) setVilles(data as VilleValidation[]);
    setLoading(false);
  }, [filtre]);

  useEffect(() => { fetchVilles(); }, [fetchVilles]);

  // Approuver une ville → publiée
  const approuver = async (slug: string, nom: string) => {
    setActions(prev => ({ ...prev, [slug]: 'loading' }));
    const { error } = await (supabase.from('villes') as any).update({
      statut_publication: 'publiee',
      validation_humaine_statut: 'approuvee',
      validation_humaine_par: 'admin',
      validation_humaine_at: new Date().toISOString(),
    }).eq('slug', slug);

    if (!error) {
      toast({ title: `✅ ${nom} publiée` });
      setVilles(prev => prev.map(v => v.slug === slug
        ? { ...v, statut_publication: 'publiee', validation_humaine_statut: 'approuvee' } : v));
    } else {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
    setActions(prev => ({ ...prev, [slug]: '' }));
  };

  // Rejeter une ville
  const rejeter = async (slug: string, nom: string, note?: string) => {
    setActions(prev => ({ ...prev, [slug]: 'loading' }));
    const { error } = await (supabase.from('villes') as any).update({
      statut_publication: 'rejetee',
      validation_humaine_statut: 'rejetee',
      validation_humaine_par: 'admin',
      validation_humaine_at: new Date().toISOString(),
      validation_humaine_note: note || null,
    }).eq('slug', slug);

    if (!error) {
      toast({ title: `🗑️ ${nom} rejetée` });
      setVilles(prev => prev.filter(v => v.slug !== slug));
    } else {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
    setActions(prev => ({ ...prev, [slug]: '' }));
  };

  // Régénérer : relance generate-ville-content puis validate-ville-content
  const regenerer = async (slug: string, nom: string) => {
    setActions(prev => ({ ...prev, [slug]: 'loading' }));

    // Marquer en génération
    await (supabase.from('villes') as any).update({
      statut_publication: 'generation',
      validation_humaine_statut: 'regenerer',
    }).eq('slug', slug);

    setVilles(prev => prev.map(v => v.slug === slug
      ? { ...v, statut_publication: 'generation' } : v));

    try {
      // 1. Regénérer contenu IA
      const { error: genError } = await supabase.functions.invoke('generate-ville-content', {
        body: { slug, type: 'both' },
      });

      if (genError) {
        toast({ title: `⚠️ Génération IA échouée pour ${nom}`, description: genError.message, variant: 'destructive' });
        await (supabase.from('villes') as any).update({ statut_publication: 'a_valider_humain' }).eq('slug', slug);
        setActions(prev => ({ ...prev, [slug]: '' }));
        fetchVilles();
        return;
      }

      // 2. Revalider
      const { data: valData, error: valError } = await supabase.functions.invoke('validate-ville-content', {
        body: { slug },
      });

      if (!valError && valData) {
        toast({
          title: valData.verdict === 'approuvee'
            ? `✅ ${nom} publiée (score ${valData.score}/100)`
            : `⚠️ ${nom} rejetée à nouveau (score ${valData.score}/100)`,
        });
      }

    } catch (e: any) {
      toast({ title: 'Erreur régénération', description: e.message, variant: 'destructive' });
    }

    setActions(prev => ({ ...prev, [slug]: '' }));
    fetchVilles();
  };

  const scoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600 font-bold';
    if (score >= 60) return 'text-orange-500 font-bold';
    return 'text-red-600 font-bold';
  };

  const counts = {
    a_valider: villes.filter(v => v.statut_publication === 'a_valider_humain').length,
    publiees:  villes.filter(v => v.statut_publication === 'publiee').length,
    rejetees:  villes.filter(v => v.statut_publication === 'rejetee').length,
  };

  return (
    <>
      <Helmet><title>Validation pages — Admin Switchly</title><meta name="robots" content="noindex" /></Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Validation des pages</h1>
            <p className="text-muted-foreground text-sm">
              Pages générées en attente de validation IA ou humaine
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchVilles}>
            <RefreshCw className="w-4 h-4 mr-1" /> Actualiser
          </Button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center cursor-pointer"
               onClick={() => setFiltre('a_valider_humain')}>
            <p className="text-2xl font-bold text-orange-600">{counts.a_valider}</p>
            <p className="text-xs text-orange-500">À valider</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center cursor-pointer"
               onClick={() => setFiltre('publiee')}>
            <p className="text-2xl font-bold text-green-600">{counts.publiees}</p>
            <p className="text-xs text-green-500">Publiées</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center cursor-pointer"
               onClick={() => setFiltre('rejetee')}>
            <p className="text-2xl font-bold text-red-600">{counts.rejetees}</p>
            <p className="text-xs text-red-500">Rejetées</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 flex-wrap">
          {(['a_valider_humain', 'tous', 'publiee', 'rejetee'] as const).map(f => (
            <button key={f}
              onClick={() => setFiltre(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filtre === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}>
              <Filter className="w-3 h-3 inline mr-1" />
              {f === 'a_valider_humain' ? 'À valider' : f === 'tous' ? 'Tous' : f === 'publiee' ? 'Publiées' : 'Rejetées'}
            </button>
          ))}
        </div>

        {/* Liste des villes */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : villes.length === 0 ? (
          <div className="bg-card border rounded-2xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-semibold">Aucune page à valider</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filtre === 'a_valider_humain'
                ? 'Toutes les pages ont été traitées !'
                : 'Aucune page dans ce statut.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {villes.map((ville) => {
              const isExpanded = expanded === ville.slug;
              const isLoading = actions[ville.slug] === 'loading';
              const statutInfo = STATUT_LABELS[ville.statut_publication] || { label: ville.statut_publication, color: 'bg-gray-100 text-gray-500' };

              return (
                <div key={ville.slug}
                  className={`bg-card border rounded-2xl overflow-hidden transition-all ${
                    ville.statut_publication === 'a_valider_humain' ? 'border-orange-200' : 'border-border'
                  }`}>

                  {/* En-tête de la carte */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{ville.nom}</h3>
                          <span className="text-xs text-muted-foreground">{ville.code_postal}</span>
                          {ville.departement && (
                            <span className="text-xs text-muted-foreground">· {ville.departement}</span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statutInfo.color}`}>
                            {statutInfo.label}
                          </span>
                        </div>

                        {/* Score IA */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {ville.validation_ia_score !== null && (
                            <span className={`text-sm ${scoreColor(ville.validation_ia_score)}`}>
                              Score IA : {ville.validation_ia_score}/100
                            </span>
                          )}
                          {ville.population && (
                            <span className="text-xs text-muted-foreground">
                              {ville.population.toLocaleString('fr-FR')} hab.
                            </span>
                          )}
                          {ville.validation_ia_at && (
                            <span className="text-xs text-muted-foreground">
                              Analysé le {new Date(ville.validation_ia_at).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>

                        {/* Commentaire IA court (2 premières lignes) */}
                        {ville.validation_ia_commentaire && !isExpanded && (
                          <p className="text-xs text-orange-600 mt-2 line-clamp-2">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            {ville.validation_ia_commentaire.split('\n')[0]}
                          </p>
                        )}
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {ville.statut_publication === 'a_valider_humain' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approuver(ville.slug, ville.nom)}
                              disabled={isLoading}
                              className="text-green-600 border-green-200 hover:bg-green-50 h-8 px-2">
                              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              <span className="ml-1 text-xs">Publier</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => regenerer(ville.slug, ville.nom)}
                              disabled={isLoading}
                              className="h-8 px-2">
                              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                              <span className="ml-1 text-xs">Régénérer</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejeter(ville.slug, ville.nom)}
                              disabled={isLoading}
                              className="text-red-500 border-red-200 hover:bg-red-50 h-8 px-2">
                              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                            </Button>
                          </>
                        )}

                        {/* Voir la page live */}
                        {ville.statut_publication === 'publiee' && (
                          <a href={`/electricite/${ville.slug}`} target="_blank" rel="noreferrer"
                             className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <Eye className="w-3 h-3" /> Voir
                          </a>
                        )}

                        {/* Expand/collapse */}
                        <button
                          onClick={() => setExpanded(isExpanded ? null : ville.slug)}
                          className="p-1 rounded hover:bg-muted transition-colors">
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section expandée — commentaire IA complet + aperçu contenu */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/30 p-4 space-y-4">

                      {/* Commentaire IA complet */}
                      {ville.validation_ia_commentaire && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            Rapport de validation IA
                          </h4>
                          <div className={`rounded-xl p-4 text-sm whitespace-pre-wrap font-mono text-xs ${
                            ville.validation_ia_statut === 'approuvee'
                              ? 'bg-green-50 text-green-800 border border-green-200'
                              : 'bg-orange-50 text-orange-900 border border-orange-200'
                          }`}>
                            {ville.validation_ia_commentaire}
                          </div>
                        </div>
                      )}

                      {/* Aperçu contenu */}
                      {(ville.contenu_elec_intro || ville.contenu_gaz_intro) && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            Aperçu contenu généré
                          </h4>
                          {ville.contenu_elec_intro && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">⚡ Intro électricité</p>
                              <p className="text-sm bg-background rounded-lg p-3 border border-border line-clamp-4">
                                {ville.contenu_elec_intro}
                              </p>
                            </div>
                          )}
                          {ville.contenu_gaz_intro && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">🔥 Intro gaz</p>
                              <p className="text-sm bg-background rounded-lg p-3 border border-border line-clamp-4">
                                {ville.contenu_gaz_intro}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Liens vers les pages */}
                      <div className="flex gap-3">
                        <a href={`/electricite/${ville.slug}`} target="_blank" rel="noreferrer"
                           className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <ExternalLink className="w-3 h-3" /> Page électricité
                        </a>
                        <a href={`/gaz/${ville.slug}`} target="_blank" rel="noreferrer"
                           className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <ExternalLink className="w-3 h-3" /> Page gaz
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
