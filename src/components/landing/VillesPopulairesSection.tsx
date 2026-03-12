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
    const load = async () => {
      const { data } = await supabase
        .from('villes' as any)
        .select('slug, nom, code_postal')
        .order('population', { ascending: false })
        .limit(12);
      if (data) setVilles(data as any as VilleLink[]);
    };
    load();
  }, []);

  if (villes.length === 0) return null;

  return (
    <section className="py-12 bg-muted/20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <MapPin className="w-5 h-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-bold">Comparer l'électricité dans votre ville</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {villes.map(v => (
            <Link
              key={v.slug}
              to={`/electricite/${v.slug}`}
              className="bg-card border border-border rounded-xl p-3 hover:border-primary transition-colors text-center group"
            >
              <p className="font-medium text-sm group-hover:text-primary transition-colors">{v.nom}</p>
              <p className="text-xs text-muted-foreground">{v.code_postal}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
