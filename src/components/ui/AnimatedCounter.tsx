import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  showLiveIndicator?: boolean;
  incrementInterval?: number;
}

export function AnimatedCounter({
  target,
  duration = 2,
  suffix = "",
  prefix = "",
  className = "",
  showLiveIndicator = false,
  incrementInterval = 8000,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [displayTarget, setDisplayTarget] = useState(target);
  const [isIncrementing, setIsIncrementing] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasAnimated = useRef(false);

  // Initial count-up animation
  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (duration * 1000), 1);
        
        // Easing function for smooth deceleration
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(easeOutQuart * displayTarget);
        
        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(displayTarget);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, displayTarget, duration]);

  // Simulate live increments
  useEffect(() => {
    if (!showLiveIndicator || !hasAnimated.current) return;

    const interval = setInterval(() => {
      const increment = Math.floor(Math.random() * 3) + 1; // 1-3 new signups
      setIsIncrementing(true);
      
      setDisplayTarget((prev) => {
        const newTarget = prev + increment;
        setCount(newTarget);
        return newTarget;
      });

      // Reset increment indicator after animation
      setTimeout(() => setIsIncrementing(false), 500);
    }, incrementInterval);

    return () => clearInterval(interval);
  }, [showLiveIndicator, incrementInterval]);

  const formattedCount = count.toLocaleString("fr-FR");

  return (
    <span ref={ref} className={`relative inline-flex items-center gap-2 ${className}`}>
      <motion.span
        key={count}
        initial={isIncrementing ? { scale: 1.1, color: "hsl(var(--secondary))" } : false}
        animate={{ scale: 1, color: "hsl(var(--foreground))" }}
        transition={{ duration: 0.3 }}
      >
        {prefix}{formattedCount}{suffix}
      </motion.span>
      
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
