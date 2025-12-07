import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Zap, LayoutDashboard, Gift, FileText, User as UserIcon, Bell, LogOut } from "lucide-react";

const sidebarLinks = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/offres", label: "Mes Offres", icon: Gift },
  { href: "/dashboard/souscriptions", label: "Mes Souscriptions", icon: FileText },
  { href: "/dashboard/profil", label: "Mon Profil", icon: UserIcon },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/connexion");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/connexion");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 hidden md:flex flex-col">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(145,58%,55%)] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Switchly</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
        </nav>

        <Button variant="ghost" onClick={handleLogout} className="justify-start">
          <LogOut className="w-5 h-5 mr-2" />
          Déconnexion
        </Button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
