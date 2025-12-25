import { motion } from "framer-motion";

export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 500 350"
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
          d="M180 15L155 60H180L165 95L205 50H180L195 15H180Z"
          fill="#FBBF24"
          stroke="#F59E0B"
          strokeWidth="2"
        />
        <path
          d="M180 15L155 60H180L165 95L205 50H180L195 15H180Z"
          fill="url(#lightning-gradient)"
        />
      </motion.g>

      {/* WiFi icon */}
      <motion.g
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <path
          d="M280 75C280 75 300 55 330 55C360 55 380 75 380 75"
          stroke="#22C55E"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M295 60C295 60 310 45 330 45C350 45 365 60 365 60"
          stroke="#22C55E"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M310 45C310 45 320 35 330 35C340 35 350 45 350 45"
          stroke="#22C55E"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="330" cy="85" r="8" fill="#22C55E" />
      </motion.g>

      {/* Decorative sparkles */}
      <motion.circle
        cx="140" cy="40"
        r="4"
        fill="#FBBF24"
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx="400" cy="30"
        r="3"
        fill="#22C55E"
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.circle
        cx="120" cy="70"
        r="3"
        fill="#3B82F6"
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      />
      <motion.circle
        cx="420" cy="60"
        r="2.5"
        fill="#FBBF24"
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
      />

      {/* Back row - Person 1 (elderly man, gray hair) */}
      <g>
        <ellipse cx="95" cy="280" rx="28" ry="45" fill="#6B7280" />
        <circle cx="95" cy="175" r="28" fill="#D1D5DB" />
        <circle cx="95" cy="175" r="22" fill="#E8D4C4" />
        <ellipse cx="88" cy="172" rx="3" ry="2" fill="#1F2937" />
        <ellipse cx="102" cy="172" rx="3" ry="2" fill="#1F2937" />
        <path d="M88 182C88 182 95 188 102 182" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M75 160C75 160 80 145 95 145C110 145 115 160 115 160" fill="#D1D5DB" />
      </g>

      {/* Back row - Person 2 (dark-skinned man with beard) */}
      <g>
        <ellipse cx="165" cy="275" rx="30" ry="48" fill="#3B82F6" />
        <circle cx="165" cy="165" r="30" fill="#1F2937" />
        <circle cx="165" cy="165" r="24" fill="#8B6F5C" />
        <ellipse cx="157" cy="162" rx="3" ry="2.5" fill="#1F2937" />
        <ellipse cx="173" cy="162" rx="3" ry="2.5" fill="#1F2937" />
        <path d="M155 175C155 175 165 182 175 175" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M150 175C150 182 155 190 165 190C175 190 180 182 180 175" fill="#5C4033" />
        <path d="M145 150C145 150 155 135 165 135C175 135 185 150 185 150" fill="#1F2937" />
      </g>

      {/* Back row - Person 3 (woman with long dark hair) */}
      <g>
        <ellipse cx="250" cy="270" rx="32" ry="50" fill="#10B981" />
        <circle cx="250" cy="158" r="32" fill="#1F2937" />
        <circle cx="250" cy="160" r="25" fill="#D4A574" />
        <ellipse cx="242" cy="157" rx="3" ry="2.5" fill="#1F2937" />
        <ellipse cx="258" cy="157" rx="3" ry="2.5" fill="#1F2937" />
        <path d="M242 170C242 170 250 176 258 170" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M220 145C220 165 225 200 250 200C275 200 280 165 280 145C280 145 265 155 250 155C235 155 220 145 220 145Z" fill="#1F2937" />
      </g>

      {/* Back row - Person 4 (light-skinned man) */}
      <g>
        <ellipse cx="335" cy="275" rx="30" ry="48" fill="#EF4444" />
        <circle cx="335" cy="165" r="28" fill="#92400E" />
        <circle cx="335" cy="168" r="22" fill="#F5E6D3" />
        <ellipse cx="328" cy="165" rx="3" ry="2" fill="#1F2937" />
        <ellipse cx="342" cy="165" rx="3" ry="2" fill="#1F2937" />
        <path d="M325 178C325 178 335 184 345 178" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M310 155C310 155 320 140 335 140C350 140 360 155 360 155" fill="#92400E" />
      </g>

      {/* Back row - Person 5 (elderly man right) */}
      <g>
        <ellipse cx="405" cy="280" rx="28" ry="45" fill="#059669" />
        <circle cx="405" cy="175" r="26" fill="#E5E7EB" />
        <circle cx="405" cy="178" r="20" fill="#D4B896" />
        <ellipse cx="398" cy="175" rx="2.5" ry="2" fill="#1F2937" />
        <ellipse cx="412" cy="175" rx="2.5" ry="2" fill="#1F2937" />
        <path d="M398 188C398 188 405 193 412 188" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M380 165C380 165 390 150 405 150C420 150 430 165 430 165" fill="#E5E7EB" />
        <path d="M395 195C395 200 400 205 405 205C410 205 415 200 415 195" fill="#9CA3AF" />
      </g>

      {/* Front row - Person 6 (young woman, blonde) */}
      <g>
        <ellipse cx="130" cy="300" rx="26" ry="42" fill="#06B6D4" />
        <circle cx="130" cy="200" r="25" fill="#FBBF24" />
        <circle cx="130" cy="202" r="20" fill="#F5E6D3" />
        <ellipse cx="124" cy="200" rx="2.5" ry="2" fill="#1F2937" />
        <ellipse cx="136" cy="200" rx="2.5" ry="2" fill="#1F2937" />
        <path d="M122 212C122 212 130 217 138 212" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M108 190C108 210 115 235 130 235C145 235 152 210 152 190C152 190 142 200 130 200C118 200 108 190 108 190Z" fill="#FBBF24" />
      </g>

      {/* Front row - Person 7 (child girl, orange shirt) */}
      <g>
        <ellipse cx="195" cy="310" rx="22" ry="35" fill="#F97316" />
        <circle cx="195" cy="218" r="22" fill="#92400E" />
        <circle cx="195" cy="220" r="17" fill="#E8D4C4" />
        <ellipse cx="189" cy="218" rx="2.5" ry="2" fill="#1F2937" />
        <ellipse cx="201" cy="218" rx="2.5" ry="2" fill="#1F2937" />
        <path d="M188 228C188 228 195 233 202 228" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M178 208C178 208 185 195 195 195C205 195 212 208 212 208" fill="#92400E" />
        <circle cx="178" cy="210" r="8" fill="#92400E" />
        <circle cx="212" cy="210" r="8" fill="#92400E" />
      </g>

      {/* Front row - Person 8 (boy, blue shirt) */}
      <g>
        <ellipse cx="250" cy="308" rx="24" ry="38" fill="#3B82F6" />
        <circle cx="250" cy="215" r="23" fill="#1F2937" />
        <circle cx="250" cy="217" r="18" fill="#C4A77D" />
        <ellipse cx="244" cy="215" rx="2.5" ry="2" fill="#1F2937" />
        <ellipse cx="256" cy="215" rx="2.5" ry="2" fill="#1F2937" />
        <path d="M243 227C243 227 250 232 257 227" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M230 205C230 205 238 190 250 190C262 190 270 205 270 205" fill="#1F2937" />
      </g>

      {/* Front row - Person 9 (young woman, red shirt) */}
      <g>
        <ellipse cx="310" cy="305" rx="25" ry="40" fill="#EC4899" />
        <circle cx="310" cy="210" r="24" fill="#1F2937" />
        <circle cx="310" cy="212" r="19" fill="#D4A574" />
        <ellipse cx="303" cy="210" rx="2.5" ry="2" fill="#1F2937" />
        <ellipse cx="317" cy="210" rx="2.5" ry="2" fill="#1F2937" />
        <path d="M303 222C303 222 310 227 317 222" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M288 200C288 215 295 245 310 245C325 245 332 215 332 200C332 200 322 210 310 210C298 210 288 200 288 200Z" fill="#1F2937" />
      </g>

      {/* Front row - Person 10 (boy, yellow shirt) */}
      <g>
        <ellipse cx="370" cy="310" rx="22" ry="35" fill="#FBBF24" />
        <circle cx="370" cy="218" r="21" fill="#6B4423" />
        <circle cx="370" cy="220" r="16" fill="#8B6F5C" />
        <ellipse cx="364" cy="218" rx="2.5" ry="2" fill="#1F2937" />
        <ellipse cx="376" cy="218" rx="2.5" ry="2" fill="#1F2937" />
        <path d="M363 228C363 228 370 233 377 228" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M352 208C352 208 360 195 370 195C380 195 388 208 388 208" fill="#6B4423" />
      </g>

      {/* Gradients */}
      <defs>
        <linearGradient id="lightning-gradient" x1="155" y1="15" x2="205" y2="95" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  );
}
