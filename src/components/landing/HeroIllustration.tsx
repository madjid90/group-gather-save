import { motion } from "framer-motion";

export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg mx-auto"
    >
      {/* Lightning bolt icon */}
      <motion.g
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <path
          d="M145 20L125 55H145L135 80L165 45H145L155 20H145Z"
          fill="#FBBF24"
          stroke="#F59E0B"
          strokeWidth="2"
        />
      </motion.g>

      {/* WiFi icon */}
      <motion.g
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <path
          d="M240 65C240 65 255 50 275 50C295 50 310 65 310 65"
          stroke="#22C55E"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M250 55C250 55 262 43 275 43C288 43 300 55 300 55"
          stroke="#22C55E"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M260 45C260 45 267 38 275 38C283 38 290 45 290 45"
          stroke="#22C55E"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="275" cy="72" r="6" fill="#22C55E" />
      </motion.g>

      {/* Person 1 - Left */}
      <g>
        <circle cx="80" cy="140" r="20" fill="#FBBF24" />
        <ellipse cx="80" cy="200" rx="25" ry="35" fill="#3B82F6" />
        <circle cx="80" cy="135" r="12" fill="#D4A574" />
        <path d="M72 130C72 130 76 128 80 128C84 128 88 130 88 130" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Person 2 */}
      <g>
        <circle cx="130" cy="130" r="22" fill="#8B5CF6" />
        <ellipse cx="130" cy="195" rx="28" ry="40" fill="#10B981" />
        <circle cx="130" cy="125" r="14" fill="#8B6F5C" />
        <path d="M120 120C120 120 125 116 130 116C135 116 140 120 140 120" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Person 3 - Center */}
      <g>
        <circle cx="185" cy="125" r="24" fill="#1F2937" />
        <ellipse cx="185" cy="195" rx="30" ry="42" fill="#EF4444" />
        <circle cx="185" cy="120" r="15" fill="#C4A77D" />
        <path d="M175 115C175 115 180 112 185 112C190 112 195 115 195 115" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Person 4 */}
      <g>
        <circle cx="240" cy="130" r="22" fill="#F97316" />
        <ellipse cx="240" cy="195" rx="28" ry="40" fill="#6366F1" />
        <circle cx="240" cy="125" r="14" fill="#A67C52" />
        <path d="M230 120C230 120 235 116 240 116C245 116 250 120 250 120" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Person 5 - Right */}
      <g>
        <circle cx="295" cy="140" r="20" fill="#EC4899" />
        <ellipse cx="295" cy="200" rx="25" ry="35" fill="#14B8A6" />
        <circle cx="295" cy="135" r="12" fill="#E8D4C4" />
        <path d="M287 130C287 130 291 128 295 128C299 128 303 130 303 130" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Person 6 - Back left */}
      <g>
        <circle cx="105" cy="155" r="18" fill="#A855F7" />
        <ellipse cx="105" cy="210" rx="22" ry="30" fill="#F59E0B" />
        <circle cx="105" cy="150" r="11" fill="#D4A574" />
      </g>

      {/* Person 7 - Back right */}
      <g>
        <circle cx="265" cy="155" r="18" fill="#22C55E" />
        <ellipse cx="265" cy="210" rx="22" ry="30" fill="#8B5CF6" />
        <circle cx="265" cy="150" r="11" fill="#8B6F5C" />
      </g>

      {/* Person 8 - Front center left */}
      <g>
        <circle cx="155" cy="160" r="16" fill="#F472B6" />
        <ellipse cx="155" cy="215" rx="20" ry="28" fill="#06B6D4" />
        <circle cx="155" cy="156" r="10" fill="#E8D4C4" />
      </g>

      {/* Person 9 - Front center right */}
      <g>
        <circle cx="215" cy="160" r="16" fill="#34D399" />
        <ellipse cx="215" cy="215" rx="20" ry="28" fill="#F43F5E" />
        <circle cx="215" cy="156" r="10" fill="#C4A77D" />
      </g>

      {/* Decorative sparkles */}
      <motion.circle
        cx="120" cy="60"
        r="3"
        fill="#FBBF24"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx="320" cy="40"
        r="2"
        fill="#22C55E"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.circle
        cx="100" cy="35"
        r="2.5"
        fill="#3B82F6"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      />
    </svg>
  );
}
