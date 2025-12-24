import { useEffect, useRef, useState, ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
  placeholder?: ReactNode;
}

export function LazySection({ 
  children, 
  className = "",
  rootMargin = "200px",
  placeholder
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (placeholder || <div className="min-h-[200px]" />)}
    </div>
  );
}
