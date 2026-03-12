import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Flame, Search } from 'lucide-react';

interface VilleLink {
  slug: string; nom: string; code_postal: string; departement: string | null; population: number | null;
}

export default function GazIndexPage() {
  const [villes,  setVilles]  = useState<VilleLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from('villes') as any)
        .select('slug, nom, code_postal, departement, population')
        .eq('statut_publication', 'publiee')
        .order('population', { ascending: false })
        .limit(200);
      if (data) setVilles(data);
      setLoading(false);
    })();
  }, []);

  const filtered = search.trim().length >= 2
    ? villes.filter(v =>
        v.nom.toLowerCase().includes(search.toLowerCase()) ||
        v.code_postal.startsWith(search)
      )
    : villes;

  return (
    <>
      <Helmet>
        <title>Comparateur gaz par ville — Switchly</title>
        <meta name="description" content="Comparez les offres de gaz naturel dans votre ville. Trouvez le fournisseur le moins cher près de chez vous. 100% gratuit, sans engagement." />
        <link rel="canonical" href="https://switchly.fr/gaz/" />
      </Helmet>

      {/* Hero */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Flame className="w-3.5 h-3.5" /> Gaz naturel
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-3">
            Comparateur gaz par ville
          </h1>
          <p className="text-base text-muted-foreground mb-6">
            Trouvez le fournisseur de gaz naturel le moins cher dans votre commune. Gratuit, sans engagement.
          </p>
          <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold h-12 px-8" asChild>
            <Link to="/comparer?type=gaz">Comparer mon gaz →</Link>
          </Button>
        </div>
      </section>

      {/* Liste villes */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Barre de recherche */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une ville ou un code postal…"
              className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">{filtered.length} commune{filtered.length > 1 ? 's' : ''}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {filtered.map(v => (
                  <Link
                    key={v.slug}
                    to={`/gaz/${v.slug}`}
                    className="bg-card border border-border rounded-xl p-3 hover:border-orange-400 hover:shadow-sm transition-all group"
                  >
                    <p className="font-semibold text-sm group-hover:text-orange-600 transition-colors leading-tight">{v.nom}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {v.code_postal}{v.departement ? ` · ${v.departement}` : ''}
                    </p>
                  </Link>
                ))}
              </div>
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Aucune commune trouvée pour "{search}".<br />
                  <Link to="/comparer?type=gaz" className="text-primary hover:underline text-sm font-medium mt-1 inline-block">
                    Comparer directement avec votre code postal →
                  </Link>
                </p>
              )}
            </>
          )}

          <div className="mt-8 text-center">
            <Link to="/electricite/" className="text-primary hover:underline text-sm font-medium flex items-center justify-center gap-1">
              <Zap className="w-4 h-4" /> Voir aussi : Comparateur électricité par ville →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
