import React from 'react';

/**
 * AERO: The AI Assistant Mascot Robot
 * "I think, analyze and assist."
 * Personality: Calm, Smart, Helpful, Curious
 * Signature elements:
 * - Floating Holographic Halo (Thinking & AI telemetry indicator)
 * - Cybernetic Ear Pods with communication beacons & aero fins
 * - High-tech Emotion Display Visor (Emerald LED matrix)
 * - Brushed Titanium / Obsidian Core Sphere with Hx313 insignia
 * - Ion Plasma Anti-Gravity Thruster Rings
 */

export const AERO_EXPRESSIONS = [
  'happy',
  'thinking',
  'excited',
  'analyzing',
  'confused',
  'winking',
  'loading',
  'surprised',
  'sleep',
  'hit',
  'dizzy',
];

export default function AeroMascot({
  expression = 'happy',
  size = 180,
  className = '',
  bubble = null,
  onClick,
  eyeOffset = { x: 0, y: 0 },
  isFloating = true,
}) {
  const renderEyes = () => {
    const { x, y } = eyeOffset;
    const transform = `translate(${x}px, ${y}px)`;

    switch (expression) {
      case 'thinking':
        return (
          <g transform={transform}>
            <circle cx="136" cy="166" r="8" fill="#10b981" filter="url(#aeroGlow)" />
            <circle cx="184" cy="154" r="10" fill="#10b981" filter="url(#aeroGlow)" />
            <path d="M 128,150 Q 140,144 150,152" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 174,138 Q 188,132 200,142" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="194" cy="186" r="3" fill="#10b981" opacity="0.8" />
            <circle cx="204" cy="176" r="4.5" fill="#10b981" opacity="0.9" />
          </g>
        );
      case 'excited':
        return (
          <g transform={transform}>
            {/* Wide smiling glowing cyber arcs */}
            <path d="M 120,172 Q 140,138 160,172" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" filter="url(#aeroGlow)" />
            <path d="M 160,172 Q 180,138 200,172" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" filter="url(#aeroGlow)" />
            <path d="M 122,172 Q 140,142 158,172" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <path d="M 162,172 Q 180,142 198,172" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            {/* Open glowing mouth */}
            <path d="M 148,188 Q 160,206 172,188 Z" fill="#10b981" filter="url(#aeroGlow)" />
          </g>
        );
      case 'analyzing':
        return (
          <g transform={transform}>
            {/* Reticles, crosshairs & HUD scanlines */}
            <line x1="116" y1="168" x2="154" y2="168" stroke="#10b981" strokeWidth="6" strokeLinecap="round" filter="url(#aeroGlow)" />
            <line x1="166" y1="168" x2="204" y2="168" stroke="#10b981" strokeWidth="6" strokeLinecap="round" filter="url(#aeroGlow)" />
            <circle cx="135" cy="168" r="3.5" fill="#ffffff" />
            <circle cx="185" cy="168" r="3.5" fill="#ffffff" />
            <rect x="110" y="152" width="100" height="32" rx="6" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.75" />
            <text x="160" y="196" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">SCANNING</text>
          </g>
        );
      case 'confused':
        return (
          <g transform={transform}>
            <circle cx="134" cy="165" r="9" fill="#10b981" filter="url(#aeroGlow)" />
            <circle cx="132" cy="163" r="3.5" fill="#ffffff" />
            <path d="M 166,174 Q 182,156 198,174" fill="none" stroke="#10b981" strokeWidth="7" strokeLinecap="round" filter="url(#aeroGlow)" />
            <path d="M 148,194 Q 160,188 172,196" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      case 'winking':
        return (
          <g transform={transform}>
            {/* Left Eye Open */}
            <path d="M 124,172 Q 140,146 156,172" fill="none" stroke="#10b981" strokeWidth="7.5" strokeLinecap="round" filter="url(#aeroGlow)" />
            <path d="M 126,172 Q 140,150 154,172" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            {/* Right Eye Winking Chevron */}
            <path d="M 168,162 L 182,172 L 196,162" fill="none" stroke="#10b981" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" filter="url(#aeroGlow)" />
            <path d="M 150,192 Q 160,200 170,192" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      case 'loading':
        return (
          <g transform={transform}>
            <circle cx="138" cy="168" r="11" fill="none" stroke="#10b981" strokeWidth="4.5" strokeDasharray="38 18" className="animate-spin" />
            <circle cx="182" cy="168" r="11" fill="none" stroke="#10b981" strokeWidth="4.5" strokeDasharray="38 18" className="animate-spin" />
            <circle cx="138" cy="168" r="3.5" fill="#10b981" filter="url(#aeroGlow)" />
            <circle cx="182" cy="168" r="3.5" fill="#10b981" filter="url(#aeroGlow)" />
          </g>
        );
      case 'surprised':
        return (
          <g transform={transform}>
            <circle cx="134" cy="164" r="14" fill="none" stroke="#10b981" strokeWidth="6" filter="url(#aeroGlow)" />
            <circle cx="134" cy="164" r="5.5" fill="#ffffff" />
            <circle cx="186" cy="164" r="14" fill="none" stroke="#10b981" strokeWidth="6" filter="url(#aeroGlow)" />
            <circle cx="186" cy="164" r="5.5" fill="#ffffff" />
            <circle cx="160" cy="194" r="6" fill="#10b981" filter="url(#aeroGlow)" />
          </g>
        );
      case 'hit':
        return (
          <g transform={transform}>
            {/* Impact >< eyes */}
            <path d="M 124,158 L 140,172 L 124,184" fill="none" stroke="#10b981" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#aeroGlow)" />
            <path d="M 152,158 L 136,172 L 152,184" fill="none" stroke="#10b981" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#aeroGlow)" />
            <path d="M 172,158 L 188,172 L 172,184" fill="none" stroke="#10b981" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#aeroGlow)" />
            <path d="M 200,158 L 184,172 L 200,184" fill="none" stroke="#10b981" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#aeroGlow)" />
            <path d="M 148,198 Q 160,190 172,198" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      case 'dizzy':
        return (
          <g transform={transform}>
            {/* Hypnotic Spiral Eyes @_@ */}
            <path d="M 136,168 m -16,0 a 16,16 0 1,0 32,0 a 12,12 0 1,0 -24,0 a 8,8 0 1,0 16,0 a 4,4 0 1,0 -8,0" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" filter="url(#aeroGlow)" className="animate-spin" style={{ transformOrigin: '136px 168px' }} />
            <path d="M 184,168 m -16,0 a 16,16 0 1,0 32,0 a 12,12 0 1,0 -24,0 a 8,8 0 1,0 16,0 a 4,4 0 1,0 -8,0" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" filter="url(#aeroGlow)" className="animate-spin" style={{ transformOrigin: '184px 168px' }} />
            {/* Wobbly wavy dizzy mouth */}
            <path d="M 144,196 Q 152,190 160,196 Q 168,202 176,196" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );
      case 'sleep':
        return (
          <g transform={transform}>
            <path d="M 124,168 L 156,168" stroke="#10b981" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
            <path d="M 164,168 L 196,168" stroke="#10b981" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
            <text x="196" y="148" fill="#10b981" fontSize="13" fontFamily="monospace" fontWeight="bold" filter="url(#aeroGlow)">z</text>
            <text x="210" y="136" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold" filter="url(#aeroGlow)">z</text>
          </g>
        );
      case 'happy':
      default:
        return (
          <g transform={transform}>
            <path d="M 124,172 Q 140,146 156,172" fill="none" stroke="#10b981" strokeWidth="7.5" strokeLinecap="round" filter="url(#aeroGlow)" />
            <path d="M 164,172 Q 180,146 196,172" fill="none" stroke="#10b981" strokeWidth="7.5" strokeLinecap="round" filter="url(#aeroGlow)" />
            <path d="M 126,172 Q 140,150 154,172" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
            <path d="M 166,172 Q 180,150 194,172" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
            <path d="M 150,192 Q 160,200 170,192" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
          </g>
        );
    }
  };

  return (
    <div
      className={`aero-mascot-container relative inline-block select-none ${isFloating ? 'mascot-float' : ''} ${className}`}
      style={{ width: size, height: (size * 380) / 320 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Aero mascot, currently expressing ${expression}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(e);
      }}
    >
      {bubble && (
        <div className="mischief-bubble bubble-aero show absolute -top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          {bubble}
        </div>
      )}

      <svg
        viewBox="0 0 320 380"
        width="100%"
        height="100%"
        fill="none"
        role="img"
        aria-hidden="true"
        className="transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Intense Cyber Glow Filter */}
          <filter id="aeroGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur1" />
            <feGaussianBlur stdDeviation="10" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Premium Brushed Titanium / Obsidian Shading */}
          <radialGradient id="aeroBodyGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="25%" stopColor="#334155" />
            <stop offset="65%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          {/* Visor Deep Curved Glass */}
          <radialGradient id="aeroVisorGrad" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#0a1520" />
            <stop offset="70%" stopColor="#030712" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          {/* Metallic Highlight Reflection */}
          <radialGradient id="aeroHighlightGrad" cx="32%" cy="24%" r="48%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#cbd5e1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Halo Ring Gradient */}
          <linearGradient id="aeroHaloGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Ear Pod Metal */}
          <linearGradient id="aeroEarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* 1. Orbiting Ion Plasma Energy Rings (Base) */}
        <g opacity="0.85" filter="url(#aeroGlow)">
          <ellipse cx="160" cy="315" rx="72" ry="18" stroke="#10b981" strokeWidth="2.5" strokeDasharray="16 8" opacity="0.65" />
          <ellipse cx="160" cy="332" rx="48" ry="11" stroke="#34d399" strokeWidth="2" opacity="0.9" />
        </g>

        {/* 2. Ion Plasma Thruster Plumes */}
        <g filter="url(#aeroGlow)">
          <path d="M 122,258 Q 102,298 130,314 Q 140,286 132,258 Z" fill="#10b981" opacity="0.9" />
          <path d="M 198,258 Q 218,298 190,314 Q 180,286 188,258 Z" fill="#10b981" opacity="0.9" />
          <ellipse cx="160" cy="268" rx="24" ry="7" fill="#34d399" opacity="0.95" />
        </g>

        {/* 3. Floating Holographic Halo Ring (AI Indicator) */}
        <g transform="translate(0, -12)" filter="url(#aeroGlow)">
          <ellipse cx="160" cy="64" rx="76" ry="22" fill="none" stroke="url(#aeroHaloGrad)" strokeWidth="7" />
          <ellipse cx="160" cy="64" rx="76" ry="22" fill="none" stroke="#ffffff" strokeWidth="1.8" opacity="0.9" />
          {/* Orbital Satellite Nodes on Halo */}
          <circle cx="86" cy="64" r="4.5" fill="#ffffff" />
          <circle cx="234" cy="64" r="4.5" fill="#ffffff" />
        </g>

        {/* 4. Left Cyber Ear Pod & Winglet */}
        <g>
          {/* Aero Fin */}
          <path d="M 48,142 Q 12,106 28,174 Q 48,158 48,142 Z" fill="#10b981" opacity="0.9" filter="url(#aeroGlow)" />
          {/* Pod Base */}
          <rect x="38" y="142" width="20" height="54" rx="10" fill="url(#aeroEarGrad)" stroke="#10b981" strokeWidth="1.5" />
          {/* Communication Beacon */}
          <circle cx="48" cy="169" r="22" fill="#0b1320" stroke="#10b981" strokeWidth="3" />
          <circle cx="48" cy="169" r="6" fill="#10b981" filter="url(#aeroGlow)" />
          <circle cx="48" cy="169" r="2" fill="#ffffff" />
        </g>

        {/* 5. Right Cyber Ear Pod & Winglet */}
        <g>
          {/* Aero Fin */}
          <path d="M 272,142 Q 308,106 292,174 Q 272,158 272,142 Z" fill="#10b981" opacity="0.9" filter="url(#aeroGlow)" />
          {/* Pod Base */}
          <rect x="262" y="142" width="20" height="54" rx="10" fill="url(#aeroEarGrad)" stroke="#10b981" strokeWidth="1.5" />
          {/* Communication Beacon */}
          <circle cx="272" cy="169" r="22" fill="#0b1320" stroke="#10b981" strokeWidth="3" />
          <circle cx="272" cy="169" r="6" fill="#10b981" filter="url(#aeroGlow)" />
          <circle cx="272" cy="169" r="2" fill="#ffffff" />
        </g>

        {/* 6. Titanium Core Chassis Sphere */}
        <circle cx="160" cy="176" r="98" fill="url(#aeroBodyGrad)" stroke="#334155" strokeWidth="3.5" />
        <circle cx="160" cy="176" r="98" fill="url(#aeroHighlightGrad)" />

        {/* Outer Bevel Ring Accent */}
        <circle cx="160" cy="176" r="95" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="40 10" opacity="0.4" />

        {/* 7. Glossy Visor Display Face */}
        <ellipse cx="160" cy="172" rx="76" ry="56" fill="url(#aeroVisorGrad)" stroke="#1e293b" strokeWidth="3" />
        {/* Visor Glare Arc */}
        <path d="M 104,138 Q 160,122 216,138" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" fill="none" />

        {/* 8. Dynamic Emotive Eyes & Face Elements */}
        <g filter="url(#aeroGlow)">
          {renderEyes()}
        </g>

        {/* 9. Hx313 Cyber Insignia & Status Indicator (Chin) */}
        <g transform="translate(160, 248)">
          <rect x="-38" y="-12" width="76" height="18" rx="5" fill="#0b1320" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" />
          <circle cx="-28" cy="-3" r="2.5" fill="#10b981" filter="url(#aeroGlow)" />
          <text x="4" y="0" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="800" fill="#94a3b8" letterSpacing="1.5">
            Hx<tspan fill="#10b981">313</tspan>
          </text>
        </g>
      </svg>
    </div>
  );
}
