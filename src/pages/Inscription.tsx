import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Phone, User, MapPin, CheckCircle, ArrowLeft } from "lucide-react";
import { DynamicSEOHead } from "@/components/seo/DynamicSEOHead";

export default function Inscription() {
  const [form, setForm] = useState({ prenom: '', telephone: '', code_postal: '' });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prenom || !form.telephone) return;
    setLoading(true);
    try {
      await supabase.from('leads').insert({
        prenom: form.prenom,
        telephone: form.telephone,
        code_postal: form.code_postal || null,
        source: 'rappel',
        statut: 'nouveau',
      });
      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DynamicSEOHead
        defaultTitle="Être rappelé gratuitement — Switchly"
        defaultDescription="Laissez vos coordonnées et un conseiller Switchly vous rappelle gratuitement pour vous aider à comparer et choisir la meilleure offre énergie ou internet."
      />
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
            {!done ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-7 h-7 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Être rappelé gratuitement
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Un conseiller Switchly vous rappelle sous 24h pour vous aider à trouver la meilleure offre.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="prenom" className="flex items-center gap-2 text-sm font-medium mb-1.5">
                      <User className="w-4 h-4 text-primary" />
                      Prénom *
                    </Label>
                    <Input
                      id="prenom"
                      placeholder="Jean"
                      value={form.prenom}
                      onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))}
                      required
                      className="h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telephone" className="flex items-center gap-2 text-sm font-medium mb-1.5">
                      <Phone className="w-4 h-4 text-primary" />
                      Téléphone *
                    </Label>
                    <Input
                      id="telephone"
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={form.telephone}
                      onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))}
                      required
                      className="h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cp" className="flex items-center gap-2 text-sm font-medium mb-1.5">
                      <MapPin className="w-4 h-4 text-primary" />
                      Code postal (optionnel)
                    </Label>
                    <Input
                      id="cp"
                      placeholder="44000"
                      value={form.code_postal}
                      onChange={e => setForm(p => ({ ...p, code_postal: e.target.value }))}
                      className="h-12"
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                    {loading ? 'Envoi...' : 'Demander un rappel gratuit →'}
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  🔒 Vos données ne sont jamais revendues. Service 100% gratuit.
                </p>

                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Vous préférez comparer vous-même ?{' '}
                    <Link to="/comparer" className="text-primary hover:underline font-medium">
                      Comparer en 30 secondes →
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-secondary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Demande envoyée ! ✅
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Un conseiller Switchly vous contactera sous 24h au {form.telephone}.
                </p>
                <Link to="/comparer">
                  <Button className="w-full">
                    Comparer les offres maintenant →
                  </Button>
                </Link>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Ou attendez notre appel — un conseiller vous contactera sous 24h au {form.telephone}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
