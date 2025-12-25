import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Zap, ArrowLeft, Phone, Loader2, KeyRound, Check, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { PageTransition } from "@/components/PageTransition";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const phoneSchema = z.string().regex(/^(\+33|0)[1-9]\d{8}$/, "Numéro de téléphone invalide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");

type Step = "phone" | "code" | "newPassword" | "success";

export default function MotDePasseOublie() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [telephone, setTelephone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = phoneSchema.safeParse(telephone);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      // Check if user exists with this phone number
      const cleanPhone = telephone.replace(/[^0-9]/g, "");
      const email = `${cleanPhone}@switchly.temp`;

      // Generate a 6-digit code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(resetCode);

      // Send SMS with code
      const { data, error: smsError } = await supabase.functions.invoke("send-reset-code-sms", {
        body: {
          telephone,
          code: resetCode,
        },
      });

      if (smsError) {
        throw smsError;
      }

      if (data?.userId) {
        setUserId(data.userId);
        setStep("code");
        toast.success("Code envoyé par SMS !");
      } else {
        setError("Aucun compte trouvé avec ce numéro de téléphone.");
      }
    } catch (err) {
      console.error("Error sending reset code:", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Veuillez entrer le code à 6 chiffres");
      return;
    }

    if (code !== generatedCode) {
      setError("Code incorrect. Veuillez réessayer.");
      return;
    }

    setStep("newPassword");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      setError(passwordResult.error.errors[0].message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);

    try {
      // Update password via edge function
      const { error: updateError } = await supabase.functions.invoke("update-password", {
        body: {
          userId,
          newPassword,
        },
      });

      if (updateError) {
        throw updateError;
      }

      setStep("success");
      toast.success("Mot de passe réinitialisé avec succès !");
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(resetCode);

      await supabase.functions.invoke("send-reset-code-sms", {
        body: {
          telephone,
          code: resetCode,
        },
      });

      toast.success("Nouveau code envoyé !");
    } catch {
      toast.error("Erreur lors de l'envoi du code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen flex items-center justify-center px-5 sm:px-6 py-10 sm:py-12 bg-gradient-subtle relative">
      {/* Fixed Back Button */}
      <Link
        to="/connexion"
        className="fixed top-4 left-4 z-50 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/80 backdrop-blur border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Retour</span>
      </Link>

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-2xl p-6 md:p-8 shadow-switchly-xl border border-border"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Switchly</span>
            </Link>

            {step === "phone" && (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Mot de passe oublié ?
                </h1>
                <p className="text-base text-muted-foreground">
                  Entrez votre numéro de téléphone pour recevoir un code de réinitialisation
                </p>
              </>
            )}

            {step === "code" && (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Vérification
                </h1>
                <p className="text-base text-muted-foreground">
                  Entrez le code à 6 chiffres envoyé au {telephone}
                </p>
              </>
            )}

            {step === "newPassword" && (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Nouveau mot de passe
                </h1>
                <p className="text-base text-muted-foreground">
                  Choisissez votre nouveau mot de passe
                </p>
              </>
            )}

            {step === "success" && (
              <>
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-secondary" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Mot de passe réinitialisé !
                </h1>
                <p className="text-base text-muted-foreground">
                  Vous pouvez maintenant vous connecter avec votre nouveau mot de passe
                </p>
              </>
            )}
          </div>

          {/* Step: Phone */}
          {step === "phone" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telephone" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  Numéro de téléphone
                </Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="0612345678"
                  className="h-12 text-base"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le code SMS"
                )}
              </Button>
            </form>
          )}

          {/* Step: Code verification */}
          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-foreground justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                  Code de vérification
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(value) => setCode(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full h-12 text-base"
                disabled={isLoading || code.length !== 6}
              >
                Vérifier le code
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-sm text-primary hover:underline"
                >
                  Renvoyer le code
                </button>
              </div>
            </form>
          )}

          {/* Step: New password */}
          {step === "newPassword" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Nouveau mot de passe
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6 caractères minimum"
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  className="h-12 text-base"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Réinitialisation...
                  </>
                ) : (
                  "Réinitialiser le mot de passe"
                )}
              </Button>
            </form>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <Button
              variant="hero"
              size="lg"
              className="w-full h-12 text-base"
              onClick={() => navigate("/connexion")}
            >
              Se connecter
            </Button>
          )}

          {/* Footer */}
          {step !== "success" && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Vous vous souvenez ?{" "}
                <Link to="/connexion" className="text-primary hover:underline font-medium">
                  Se connecter
                </Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
