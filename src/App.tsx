import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import Index from "./pages/Index";
import Inscription from "./pages/Inscription";
import Connexion from "./pages/Connexion";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import MentionsLegales from "./pages/MentionsLegales";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUtilisateurs from "./pages/admin/AdminUtilisateurs";
import AdminCampagnesList from "./pages/admin/AdminCampagnesList";
import AdminCampagneDetail from "./pages/admin/AdminCampagneDetail";
import AdminOffresClients from "./pages/admin/AdminOffresClients";
import AdminReactivation from "./pages/admin/AdminReactivation";
import FormulaireLogement from "./pages/FormulaireLogement";
import MonOffre from "./pages/MonOffre";
import OffreConfirmation from "./pages/OffreConfirmation";
import DashboardClient from "./pages/DashboardClient";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth pages */}
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/connexion" element={<Connexion />} />
          
          {/* Public pages with full layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
          </Route>

          {/* Client journey pages (SMS-based) */}
          <Route path="/formulaire-logement/:token" element={<FormulaireLogement />} />
          <Route path="/mon-offre" element={<MonOffre />} />
          <Route path="/offre-confirmation" element={<OffreConfirmation />} />
          <Route path="/dashboard-client" element={<DashboardClient />} />

          {/* Admin pages */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<AdminUtilisateurs />} />
            <Route path="campagnes" element={<AdminCampagnesList />} />
            <Route path="campagnes/:id" element={<AdminCampagneDetail />} />
            <Route path="offres" element={<AdminOffresClients />} />
            <Route path="reactivation" element={<AdminReactivation />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
