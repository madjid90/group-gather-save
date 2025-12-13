import { motion } from "framer-motion";

interface CurvedArrowProps {
  className?: string;
  flip?: boolean;
}

export function CurvedArrow({ className = "", flip = false }: CurvedArrowProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, pathLength: 0 }}
      whileInView={{ opacity: 1, pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className={`${className} ${flip ? "scale-y-[-1]" : ""}`}
      width="60"
      height="40"
      viewBox="0 0 60 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M2 20C8 8 18 4 28 8C38 12 32 24 22 20C12 16 18 6 32 10C42 13 52 18 56 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      {/* Arrow head */}
      <motion.path
        d="M52 16L58 20L52 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 1.3 }}
      />
    </motion.svg>
  );
}