import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, Phone, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { DynamicSEOHead } from "@/components/seo/DynamicSEOHead";

const schema = z.object({
  nom:     z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email:   z.string().email("Adresse email invalide"),
  sujet:   z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  message: z.string().min(20, "Le message doit contenir au moins 20 caractères"),
});

export default function Contact() {
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [form, setForm] = useState({ nom: "", email: "", sujet: "", message: "" });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = schema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.errors.forEach(err => { if (err.path[0]) fe[err.path[0] as string] = err.message; });
      setErrors(fe);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: { name: form.nom, email: form.email, subject: form.sujet, message: form.message },
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Message envoyé avec succès !");
    } catch {
      toast.error("Erreur lors de l'envoi. Réessayez ou appelez-nous.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact — Switchly</title>
        <meta name="description" content="Contactez l'équipe Switchly. Comparateur d'électricité et de gaz gratuit." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-lg py-10 md:py-16">

          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Nous contacter</h1>
            <p className="text-base text-muted-foreground">
              Une question, une suggestion ? On vous répond sous 24h.
            </p>
          </motion.div>

          {/* Infos rapides */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <a
              href="tel:0973727300"
              className="flex items-center gap-2.5 bg-card border border-border rounded-xl p-3.5 hover:border-primary transition-colors group"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">09 73 72 73 00</p>
                <p className="text-xs text-muted-foreground">Lun–Ven 7h–21h</p>
              </div>
            </a>
            <div className="flex items-center gap-2.5 bg-card border border-border rounded-xl p-3.5">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Email</p>
                <p className="text-xs text-muted-foreground">Réponse sous 24h</p>
              </div>
            </div>
          </motion.div>

          {/* Formulaire / Succès */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-5 sm:p-6"
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-secondary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Message envoyé !</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Nous vous répondrons dans les 24 heures ouvrées.
                </p>
                <Button size="lg" className="h-11 bg-secondary hover:bg-secondary/90 text-white font-bold" asChild>
                  <Link to="/">Retour à l'accueil</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                {/* Nom */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5" htmlFor="nom">Nom complet</label>
                  <input
                    id="nom" name="nom" type="text" value={form.nom} onChange={change}
                    placeholder="Jean Dupont"
                    className={`w-full bg-background border rounded-xl px-4 py-3 text-base outline-none transition-all ${
                      errors.nom ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                  />
                  {errors.nom && <p className="text-xs text-destructive mt-1">{errors.nom}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5" htmlFor="email">Adresse email</label>
                  <input
                    id="email" name="email" type="email" value={form.email} onChange={change}
                    placeholder="jean@exemple.fr"
                    className={`w-full bg-background border rounded-xl px-4 py-3 text-base outline-none transition-all ${
                      errors.email ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                {/* Sujet */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5" htmlFor="sujet">Sujet</label>
                  <input
                    id="sujet" name="sujet" type="text" value={form.sujet} onChange={change}
                    placeholder="Question sur une offre…"
                    className={`w-full bg-background border rounded-xl px-4 py-3 text-base outline-none transition-all ${
                      errors.sujet ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                  />
                  {errors.sujet && <p className="text-xs text-destructive mt-1">{errors.sujet}</p>}
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5" htmlFor="message">Message</label>
                  <textarea
                    id="message" name="message" value={form.message} onChange={change}
                    rows={4}
                    placeholder="Décrivez votre demande…"
                    className={`w-full bg-background border rounded-xl px-4 py-3 text-base outline-none transition-all resize-none ${
                      errors.message ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                  />
                  {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white font-bold text-base"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Envoi en cours…</>
                  ) : (
                    'Envoyer le message →'
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  En envoyant ce formulaire, vous acceptez notre{' '}
                  <Link to="/politique-confidentialite" className="underline text-primary">politique de confidentialité</Link>.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
