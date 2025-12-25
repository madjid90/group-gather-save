import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const firstNames = [
  "Marie", "Thomas", "Julie", "Nicolas", "Sophie", "Pierre", "Camille", "Lucas",
  "Emma", "Maxime", "Léa", "Antoine", "Chloé", "Alexandre", "Manon", "Julien",
  "Sarah", "Romain", "Laura", "Mathieu", "Pauline", "Florian", "Marine", "Kevin",
  "Aurélie", "Sébastien", "Nadia", "Karim", "Isabelle", "David", "Élodie", "François"
];

const cities = [
  "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier",
  "Bordeaux", "Lille", "Rennes", "Reims", "Toulon", "Saint-Étienne", "Le Havre", "Grenoble",
  "Dijon", "Angers", "Nîmes", "Villeurbanne", "Clermont-Ferrand", "Aix-en-Provence",
  "Brest", "Tours", "Amiens", "Limoges", "Perpignan", "Metz", "Besançon", "Orléans"
];

const getRandomTime = () => {
  const times = ["à l'instant", "il y a 1 min", "il y a 2 min", "il y a 3 min"];
  return times[Math.floor(Math.random() * times.length)];
};

const generateNotification = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const initial = firstName.charAt(0);
  const time = getRandomTime();
  
  return { firstName, city, initial, time, id: Date.now() };
};

export function SocialProofNotifications() {
  const [notification, setNotification] = useState<{
    firstName: string;
    city: string;
    initial: string;
    time: string;
    id: number;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInHeroSection, setIsInHeroSection] = useState(true);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Detect if user has scrolled past hero section
  useEffect(() => {
    const handleScroll = () => {
      // Only check on homepage
      if (location.pathname === "/") {
        // Hero section is approximately viewport height
        const heroHeight = window.innerHeight;
        setIsInHeroSection(window.scrollY < heroHeight * 0.8);
      } else {
        // On other pages, always show notifications
        setIsInHeroSection(false);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    // Initial delay before first notification
    const initialDelay = setTimeout(() => {
      showNotification();
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, []);

  const showNotification = () => {
    const newNotification = generateNotification();
    setNotification(newNotification);
    setIsVisible(true);

    // Hide after 4 seconds
    setTimeout(() => {
      setIsVisible(false);
      
      // Schedule next notification (random interval between 8-15 seconds)
      const nextInterval = Math.random() * 7000 + 8000;
      setTimeout(showNotification, nextInterval);
    }, 4000);
  };

  // Don't show in hero section on desktop, but always show on mobile
  const shouldShow = isVisible && notification && (isMobile || !isInHeroSection);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-20 md:bottom-6 left-4 z-40 max-w-xs"
        >
          <div className="bg-card border border-border rounded-xl p-3 shadow-switchly-xl">
            {/* Content */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                <p className="text-sm font-medium text-foreground truncate">
                  {notification.firstName} vient de s'inscrire
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {notification.city} • {notification.time}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
