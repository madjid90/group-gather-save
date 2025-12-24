import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  showLiveIndicator?: boolean;
  onIncrement?: (newValue: number) => void;
  externalValue?: number;
}

export function AnimatedCounter({
  target,
  duration = 2,
  suffix = "",
  prefix = "",
  className = "",
  showLiveIndicator = false,
  externalValue,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasAnimated = useRef(false);

  // Use external value if provided, otherwise use internal count
  const displayValue = externalValue !== undefined ? externalValue : count;

  // Initial count-up animation
  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const startTime = Date.now();
      const animationTarget = externalValue !== undefined ? externalValue : target;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (duration * 1000), 1);
        
        // Easing function for smooth deceleration
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(easeOutQuart * animationTarget);
        
        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(animationTarget);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, target, duration, externalValue]);

  const formattedCount = displayValue.toLocaleString("fr-FR");

  return (
    <span ref={ref} className={`relative inline-flex items-center gap-2 ${className}`}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={displayValue}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
        >
          {prefix}{formattedCount}{suffix}
        </motion.span>
      </AnimatePresence>
      
      {showLiveIndicator && (
        <span className="inline-flex items-center gap-1.5">
          <motion.span
            className="w-2 h-2 rounded-full bg-secondary"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span className="text-xs text-secondary font-medium">en direct</span>
        </span>
      )}
    </span>
  );
}

// Hook to manage synchronized counter and notifications
const firstNames = [
  "Marie", "Thomas", "Julie", "Nicolas", "Sophie", "Pierre", "Camille", "Lucas",
  "Emma", "Maxime", "Léa", "Antoine", "Chloé", "Alexandre", "Manon", "Julien",
  "Sarah", "Romain", "Laura", "Mathieu", "Pauline", "Florian", "Marine", "Kevin"
];

const cities = [
  "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier",
  "Bordeaux", "Lille", "Rennes", "Reims", "Toulon", "Grenoble", "Dijon", "Angers"
];

export function useAnimatedSocialProof(initialCount: number, intervalMs: number = 10000) {
  const [count, setCount] = useState(initialCount);
  const [notification, setNotification] = useState<{
    name: string;
    city: string;
    initial: string;
    time: string;
  } | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const generateNotification = useCallback(() => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const times = ["à l'instant", "il y a 1 min", "il y a 2 min"];
    const time = times[Math.floor(Math.random() * times.length)];
    
    return {
      name: `${firstName} ${firstName.charAt(0)}.`,
      city,
      initial: firstName.charAt(0),
      time
    };
  }, []);

  useEffect(() => {
    // Initial notification after delay
    const initialTimeout = setTimeout(() => {
      const newNotification = generateNotification();
      setNotification(newNotification);
      setShowNotification(true);
      setCount(prev => prev + 1);

      // Hide after 4 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 4000);
    }, 4000);

    // Recurring notifications
    const interval = setInterval(() => {
      const newNotification = generateNotification();
      setNotification(newNotification);
      setShowNotification(true);
      setCount(prev => prev + 1);

      setTimeout(() => {
        setShowNotification(false);
      }, 4000);
    }, intervalMs);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [generateNotification, intervalMs]);

  return { count, notification, showNotification };
}
