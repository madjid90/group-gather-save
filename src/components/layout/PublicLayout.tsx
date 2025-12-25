import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { SocialProofNotifications } from "@/components/landing/SocialProofNotifications";

export function PublicLayout() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
      <SocialProofNotifications />
    </div>
  );
}
