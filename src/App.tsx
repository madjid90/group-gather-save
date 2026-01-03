import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PublicLayout } from "@/components/layout/PublicLayout";
import Index from "./pages/Index";
import Inscription from "./pages/Inscription";
import Connexion from "./pages/Connexion";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueRGPD from "./pages/PolitiqueRGPD";
import CGU from "./pages/CGU";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import OrganiserAchatGroupe from "./pages/OrganiserAchatGroupe";
import DemandePartenaire from "./pages/DemandePartenaire";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUtilisateurs from "./pages/admin/AdminUtilisateurs";
import AdminCampagnesList from "./pages/admin/AdminCampagnesList";
import AdminCampagneDetail from "./pages/admin/AdminCampagneDetail";
import AdminOffresClients from "./pages/admin/AdminOffresClients";
import AdminReactivation from "./pages/admin/AdminReactivation";
import AdminClicsStats from "./pages/admin/AdminClicsStats";
import AdminSEO from "./pages/admin/AdminSEO";
import FormulaireLogement from "./pages/FormulaireLogement";
import MonOffre from "./pages/MonOffre";
import OffreConfirmation from "./pages/OffreConfirmation";
import DashboardClient from "./pages/DashboardClient";
import PartageInvitation from "./pages/PartageInvitation";
import PartageAccueil from "./pages/PartageAccueil";
import Invitation from "./pages/Invitation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Auth pages */}
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/partage-invitation" element={<PartageInvitation />} />
          <Route path="/partage-accueil" element={<PartageAccueil />} />
          <Route path="/invitation" element={<Invitation />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          
          {/* Public pages with full layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
          </Route>

          {/* Partner journey pages */}
          <Route path="/organiser-achat-groupe" element={<OrganiserAchatGroupe />} />
          <Route path="/demande-partenaire" element={<DemandePartenaire />} />

          {/* Client journey pages (SMS-based) */}
          <Route path="/formulaire-logement/:token" element={<FormulaireLogement />} />
          <Route path="/mon-offre/:token" element={<MonOffre />} />
          <Route path="/offre-confirmation" element={<OffreConfirmation />} />
          <Route path="/dashboard-client" element={<DashboardClient />} />

          {/* Legal pages */}
          <Route path="/politique-rgpd" element={<PolitiqueRGPD />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />

          {/* Admin pages */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<AdminUtilisateurs />} />
            <Route path="campagnes" element={<AdminCampagnesList />} />
            <Route path="campagnes/:id" element={<AdminCampagneDetail />} />
            <Route path="offres" element={<AdminOffresClients />} />
            <Route path="clics" element={<AdminClicsStats />} />
            <Route path="reactivation" element={<AdminReactivation />} />
            <Route path="seo" element={<AdminSEO />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
