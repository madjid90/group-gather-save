import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Flame, Wifi } from 'lucide-react';

const VILLES = [
  { nom: 'Paris', slug: 'paris' }, { nom: 'Lyon', slug: 'lyon' }, { nom: 'Marseille', slug: 'marseille' },
  { nom: 'Toulouse', slug: 'toulouse' }, { nom: 'Nice', slug: 'nice' }, { nom: 'Nantes', slug: 'nantes' },
  { nom: 'Montpellier', slug: 'montpellier' }, { nom: 'Strasbourg', slug: 'strasbourg' },
  { nom: 'Bordeaux', slug: 'bordeaux' }, { nom: 'Lille', slug: 'lille' }, { nom: 'Rennes', slug: 'rennes' },
  { nom: 'Reims', slug: 'reims' }, { nom: 'Saint-Étienne', slug: 'saint-etienne' }, { nom: 'Grenoble', slug: 'grenoble' },
  { nom: 'Toulon', slug: 'toulon' }, { nom: 'Dijon', slug: 'dijon' }, { nom: 'Angers', slug: 'angers' },
  { nom: 'Nîmes', slug: 'nimes' }, { nom: 'Aix-en-Provence', slug: 'aix-en-provence' }, { nom: 'Brest', slug: 'brest' },
  { nom: 'Tours', slug: 'tours' }, { nom: 'Amiens', slug: 'amiens' }, { nom: 'Limoges', slug: 'limoges' },
  { nom: 'Annecy', slug: 'annecy' }, { nom: 'Perpignan', slug: 'perpignan' }, { nom: 'Metz', slug: 'metz' },
  { nom: 'Besançon', slug: 'besancon' }, { nom: 'Orléans', slug: 'orleans' }, { nom: 'Rouen', slug: 'rouen' },
  { nom: 'Caen', slug: 'caen' }, { nom: 'Nancy', slug: 'nancy' }, { nom: 'Avignon', slug: 'avignon' },
  { nom: 'Pau', slug: 'pau' }, { nom: 'Cannes', slug: 'cannes' }, { nom: 'La Rochelle', slug: 'la-rochelle' },
  { nom: 'Lorient', slug: 'lorient' }, { nom: 'Valence', slug: 'valence' }, { nom: 'Poitiers', slug: 'poitiers' },
  { nom: 'Dunkerque', slug: 'dunkerque' }, { nom: 'Calais', slug: 'calais' },
];

export default function EnergiePage() {
  return (
    <>
      <Helmet>
        <title>Comparer énergie et internet en France — Jusqu'à 400€/an d'économies | Switchly</title>
        <meta name="description" content="Comparateur énergie et internet gratuit. Trouvez les meilleures offres électricité, gaz et fibre dans votre ville. 100% gratuit, sans engagement." />
        <link rel="canonical" href="https://switchly.fr/energie" />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">
          {/* Hero */}
          <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-6">
                Comparez énergie et internet.<br />
                Économisez jusqu'à <span className="text-primary">400€/an</span>.
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Switchly compare gratuitement les offres électricité, gaz et internet disponibles dans votre ville.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" asChild>
                  <Link to="/comparer?type=electricite">
                    <Zap className="mr-2 w-4 h-4" />Comparer l'électricité
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/comparer?type=gaz">
                    <Flame className="mr-2 w-4 h-4" />Comparer le gaz
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/comparer?type=internet">
                    <Wifi className="mr-2 w-4 h-4" />Comparer internet
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Tableau économies */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Combien pouvez-vous économiser ?</h2>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left py-3 px-4">Logement</th>
                      <th className="text-center py-3 px-4">Tarif EDF</th>
                      <th className="text-center py-3 px-4 text-primary">Meilleure offre</th>
                      <th className="text-center py-3 px-4 text-secondary">Économie/an</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Studio 30m²', '~720€', '~500€', '220€'],
                      ['Appart T2 50m²', '~960€', '~672€', '288€'],
                      ['Appart T3 75m²', '~1 320€', '~924€', '396€'],
                      ['Maison 100m²', '~1 680€', '~1 176€', '504€'],
                      ['Maison 150m²+', '~2 280€', '~1 596€', '684€'],
                    ].map(([s, e, o, ec]) => (
                      <tr key={s} className="border-t border-border hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">{s}</td>
                        <td className="py-3 px-4 text-center text-muted-foreground">{e}</td>
                        <td className="py-3 px-4 text-center font-semibold text-primary">{o}</td>
                        <td className="py-3 px-4 text-center font-bold text-secondary">-{ec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                *Estimations 2025. Économies réelles variables selon consommation.
              </p>
            </div>
          </section>

          {/* Villes */}
          <section className="py-16 bg-muted/20">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Comparer l'énergie par ville</h2>
              <p className="text-center text-muted-foreground mb-10 text-sm">
                Disponible dans toutes les communes desservies par Enedis et GRDF.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-w-4xl mx-auto">
                {VILLES.map(v => (
                  <Link
                    key={v.slug}
                    to={`/ville/${v.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group text-sm"
                  >
                    <span className="font-medium group-hover:text-primary">{v.nom}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button asChild>
                  <Link to="/comparer">Comparer dans ma ville</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="text-2xl font-bold text-center mb-10">Questions fréquentes</h2>
              <div className="space-y-3">
                {[
                  { q: 'Switchly est-il vraiment gratuit ?', a: 'Oui. Switchly est rémunéré par une commission versée par le fournisseur uniquement si vous souscrivez. Vous ne payez jamais rien.' },
                  { q: 'Y a-t-il une coupure lors du changement de fournisseur ?', a: 'Non. Le réseau de distribution (Enedis, GRDF) ne change pas. La transition se fait sans aucune coupure.' },
                  { q: 'Puis-je changer si je suis locataire ?', a: 'Oui. Tout consommateur peut librement choisir son fournisseur, qu\'il soit propriétaire ou locataire.' },
                  { q: 'Combien de temps prend le changement ?', a: 'Entre 1 et 5 jours ouvrés après signature. Vous choisissez la date de bascule.' },
                  { q: 'Puis-je revenir à EDF si je ne suis pas satisfait ?', a: 'Oui, à tout moment et sans frais si votre offre est sans engagement.' },
                ].map((item, i) => (
                  <details key={i} className="bg-card border border-border rounded-xl p-4 cursor-pointer">
                    <summary className="font-semibold list-none flex items-center justify-between text-sm">
                      {item.q}<span className="text-muted-foreground ml-3">▼</span>
                    </summary>
                    <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Final */}
          <section className="py-16 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Prêt à économiser ?</h2>
              <p className="opacity-90 mb-6">30 secondes. Sans engagement. Résultat immédiat.</p>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/comparer">
                  Comparer gratuitement <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
