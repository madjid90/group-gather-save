import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Flame } from 'lucide-react';

interface VilleLink { slug: string; nom: string; code_postal: string; departement: string | null; population: number | null; }

export default function GazIndexPage() {
  const [villes, setVilles] = useState<VilleLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from('villes') as any)
        .select('slug, nom, code_postal, departement, population')
        .order('population', { ascending: false })
        .limit(100);
      if (data) setVilles(data);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>Comparateur gaz par ville — Switchly</title>
        <meta name="description" content="Comparez les offres de gaz naturel dans votre ville. Trouvez le fournisseur le moins cher près de chez vous. 100% gratuit, sans engagement." />
        <link rel="canonical" href="https://switchly.fr/gaz/" />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20">
          <section className="py-10 bg-gradient-to-br from-orange-500/10 via-background to-secondary/5">
            <div className="container mx-auto px-4 max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <Flame className="w-3.5 h-3.5" /> Gaz naturel
              </div>
              <h1 className="text-2xl md:text-4xl font-bold mb-3">Comparateur gaz par ville</h1>
              <p className="text-muted-foreground mb-6">Trouvez le fournisseur de gaz naturel le moins cher dans votre commune. Gratuit, sans engagement.</p>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground" asChild>
                <Link to="/comparer?type=gaz">Comparer mon gaz →</Link>
              </Button>
            </div>
          </section>

          <section className="py-10">
            <div className="container mx-auto px-4 max-w-4xl">
              {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-6">Toutes les villes</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {villes.map(v => (
                      <Link key={v.slug} to={`/gaz/${v.slug}`} className="bg-card border border-border rounded-xl p-3 hover:border-orange-500 transition-colors group">
                        <p className="font-medium text-sm group-hover:text-orange-600 transition-colors">{v.nom}</p>
                        <p className="text-xs text-muted-foreground">{v.code_postal}{v.departement ? ` · ${v.departement}` : ''}</p>
                      </Link>
                    ))}
                  </div>
                  {villes.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune ville disponible pour le moment.</p>}
                </>
              )}
              <div className="mt-8 text-center">
                <Link to="/electricite/" className="text-primary hover:underline text-sm font-medium flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4" /> Voir aussi : Comparateur électricité par ville →
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
