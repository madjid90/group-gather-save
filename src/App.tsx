import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { HelmetProvider } from "react-helmet-async";

import Index from "./pages/Index";
import ComparerPage from "./pages/ComparerPage";
import ResultatsPage from "./pages/ResultatsPage";
import VillePage from "./pages/VillePage";
import ElectriciteIndexPage from "./pages/ElectriciteIndexPage";
import GazIndexPage from "./pages/GazIndexPage";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueRGPD from "./pages/PolitiqueRGPD";
import CGU from "./pages/CGU";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminImportVilles from "./pages/admin/AdminImportVilles";
import AdminImportVilles from "./pages/admin/AdminImportVilles";
import AdminValidation from "./pages/admin/AdminValidation";
import AdminSEO from "./pages/admin/AdminSEO";
import AdminLogin from "./pages/admin/AdminLogin";

const queryClient = new QueryClient();

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/comparer" element={<ComparerPage />} />
              <Route path="/resultats" element={<ResultatsPage />} />
              <Route path="/electricite" element={<ElectriciteIndexPage />} />
              <Route path="/electricite/:slug" element={<VillePage />} />
              <Route path="/gaz" element={<GazIndexPage />} />
              <Route path="/gaz/:slug" element={<VillePage />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/politique-rgpd" element={<PolitiqueRGPD />} />
              <Route path="/cgu" element={<CGU />} />
              <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
            </Route>
            <Route path="/electricite-gaz/:slug" element={<Navigate to="../electricite/" replace />} />
            <Route path="/ville/:slug" element={<Navigate to="../electricite/" replace />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="import-villes" element={<AdminImportVilles />} />
              <Route path="seo" element={<AdminSEO />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
