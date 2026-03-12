import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MapPin } from 'lucide-react';

interface VilleLink {
  slug: string;
  nom: string;
  code_postal: string;
}

export function VillesPopulairesSection() {
  const [villes, setVilles] = useState<VilleLink[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from('villes') as any)
        .select('slug, nom, code_postal')
        .eq('statut_publication', 'publiee')
        .order('population', { ascending: false })
        .limit(12);
      if (data) setVilles(data as VilleLink[]);
    })();
  }, []);

  if (villes.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block text-primary font-semibold text-xs uppercase tracking-widest mb-3">
            Par ville
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 flex items-center justify-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Comparer l'électricité dans votre ville
          </h2>
          <p className="text-base text-muted-foreground">
            Sélectionnez votre commune pour voir les offres disponibles.
          </p>
        </div>

        {/* Grid — 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {villes.map(v => (
            <Link
              key={v.slug}
              to={`/electricite/${v.slug}`}
              className="bg-card border border-border rounded-xl p-3.5 hover:border-primary hover:shadow-sm transition-all text-center group"
            >
              <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{v.nom}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{v.code_postal}</p>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link to="/electricite/" className="text-sm text-primary hover:underline font-medium">
            Voir toutes les villes →
          </Link>
        </div>
      </div>
    </section>
  );
}
