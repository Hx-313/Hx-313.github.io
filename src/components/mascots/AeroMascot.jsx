import React from 'react';

/**
 * AERO: The AI Assistant Mascot
 * "I think, analyze and assist."
 * Personality: Calm, Smart, Helpful, Curious
 * Signature elements:
 * - Halo Ring (Thinking indicator)
 * - Ear Pods (Audio interface) with leaf fin wings
 * - Face Screen (Emotion engine) with neon emerald LED matrix
 * - Core Body (AI processor sphere with Hx313 branding)
 * - Floating energy rings
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
            <circle cx="138" cy="168" r="7" fill="#00FF66" />
            <circle cx="178" cy="158" r="9" fill="#00FF66" />
            <path d="M 130,154 Q 142,150 150,156" stroke="#00FF66" strokeWidth="3" fill="none" />
            <path d="M 168,144 Q 180,140 192,148" stroke="#00FF66" strokeWidth="3" fill="none" />
            <circle cx="188" cy="188" r="2.5" fill="#00FF66" opacity="0.8" />
            <circle cx="196" cy="180" r="3.5" fill="#00FF66" opacity="0.9" />
          </g>
        );
      case 'excited':
        return (
          <g transform={transform}>
            {/* Bright wide smiling eyes */}
            <path d="M 122,172 Q 140,142 158,172" fill="none" stroke="#00FF66" strokeWidth="7" strokeLinecap="round" />
            <path d="M 162,172 Q 180,142 198,172" fill="none" stroke="#00FF66" strokeWidth="7" strokeLinecap="round" />
            <path d="M 124,172 Q 140,145 156,172" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 164,172 Q 180,145 196,172" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            {/* Open mouth */}
            <path d="M 150,188 Q 160,202 170,188 Z" fill="#00FF66" />
          </g>
        );
      case 'analyzing':
        return (
          <g transform={transform}>
            {/* Reticles & Scanlines */}
            <line x1="120" y1="168" x2="155" y2="168" stroke="#00FF66" strokeWidth="5" strokeLinecap="round" />
            <line x1="165" y1="168" x2="200" y2="168" stroke="#00FF66" strokeWidth="5" strokeLinecap="round" />
            <circle cx="138" cy="168" r="3" fill="#ffffff" />
            <circle cx="182" cy="168" r="3" fill="#ffffff" />
            <rect x="115" y="156" width="90" height="24" rx="4" fill="none" stroke="#00FF66" strokeWidth="1" strokeDasharray="6 3" opacity="0.6" />
          </g>
        );
      case 'confused':
        return (
          <g transform={transform}>
            <circle cx="135" cy="166" r="8" fill="#00FF66" />
            <circle cx="133" cy="164" r="3" fill="#ffffff" />
            <path d="M 168,172 Q 182,158 196,172" fill="none" stroke="#00FF66" strokeWidth="6" strokeLinecap="round" />
            <path d="M 150,192 Q 158,187 166,194" fill="none" stroke="#00FF66" strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case 'winking':
        return (
          <g transform={transform}>
            {/* Left Eye Open */}
            <path d="M 125,172 Q 140,150 155,172" fill="none" stroke="#00FF66" strokeWidth="6.5" strokeLinecap="round" />
            {/* Right Eye Winking > */}
            <path d="M 166,162 L 180,172 L 194,162" fill="none" stroke="#00FF66" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 152,192 Q 160,199 168,192" fill="none" stroke="#00FF66" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );
      case 'loading':
        return (
          <g transform={transform}>
            <circle cx="140" cy="168" r="10" fill="none" stroke="#00FF66" strokeWidth="4" strokeDasharray="35 15" className="animate-spin-slow" />
            <circle cx="180" cy="168" r="10" fill="none" stroke="#00FF66" strokeWidth="4" strokeDasharray="35 15" className="animate-spin-slow" />
            <circle cx="140" cy="168" r="3" fill="#00FF66" />
            <circle cx="180" cy="168" r="3" fill="#00FF66" />
          </g>
        );
      case 'surprised':
        return (
          <g transform={transform}>
            <circle cx="136" cy="165" r="12" fill="none" stroke="#00FF66" strokeWidth="5" />
            <circle cx="136" cy="165" r="5" fill="#00FF66" />
            <circle cx="184" cy="165" r="12" fill="none" stroke="#00FF66" strokeWidth="5" />
            <circle cx="184" cy="165" r="5" fill="#00FF66" />
            <circle cx="160" cy="192" r="5" fill="#00FF66" />
          </g>
        );
      case 'sleep':
        return (
          <g transform={transform}>
            <path d="M 125,168 L 155,168" stroke="#00FF66" strokeWidth="5" strokeLinecap="round" />
            <path d="M 165,168 L 195,168" stroke="#00FF66" strokeWidth="5" strokeLinecap="round" />
            <text x="195" y="150" fill="#00FF66" fontSize="12" fontFamily="monospace" fontWeight="bold">z</text>
            <text x="206" y="140" fill="#00FF66" fontSize="10" fontFamily="monospace" fontWeight="bold">z</text>
          </g>
        );
      case 'happy':
      default:
        return (
          <g transform={transform}>
            <path d="M 125,172 Q 140,150 155,172" fill="none" stroke="#00FF66" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M 165,172 Q 180,150 195,172" fill="none" stroke="#00FF66" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M 126,172 Q 140,152 154,172" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            <path d="M 166,172 Q 180,152 194,172" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            <path d="M 152,192 Q 160,199 168,192" fill="none" stroke="#00FF66" strokeWidth="3.5" strokeLinecap="round" />
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
          <filter id="aeroCompGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur1" />
            <feGaussianBlur stdDeviation="12" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="aeroSphereGradC" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="35%" stopColor="#1e293b" />
            <stop offset="75%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <radialGradient id="aeroHighlightC" cx="30%" cy="25%" r="45%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#94a3b8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="aeroHaloGradC" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FF66" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Lower Energy Rings */}
        <g opacity="0.8" filter="url(#aeroCompGlow)">
          <ellipse cx="160" cy="312" rx="68" ry="16" stroke="#00FF66" strokeWidth="2.5" strokeDasharray="18 6" opacity="0.6" />
          <ellipse cx="160" cy="328" rx="46" ry="10" stroke="#22c55e" strokeWidth="2" opacity="0.8" />
        </g>

        {/* Floating Thruster Leaves */}
        <g filter="url(#aeroCompGlow)">
          <path d="M 125,260 Q 105,295 132,310 Q 142,285 133,260 Z" fill="#00FF66" opacity="0.9" />
          <path d="M 195,260 Q 215,295 188,310 Q 178,285 187,260 Z" fill="#00FF66" opacity="0.9" />
          <ellipse cx="160" cy="265" rx="20" ry="6" fill="#00FF66" opacity="0.95" />
        </g>

        {/* Floating Halo Ring (Thinking Indicator) */}
        <g transform="translate(0, -10)" filter="url(#aeroCompGlow)">
          <ellipse cx="160" cy="68" rx="72" ry="20" fill="none" stroke="url(#aeroHaloGradC)" strokeWidth="6.5" />
          <ellipse cx="160" cy="68" rx="72" ry="20" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.85" />
        </g>

        {/* Left Ear Pod */}
        <g>
          <path d="M 52,145 Q 18,110 32,175 Q 52,160 52,145 Z" fill="#00FF66" opacity="0.85" filter="url(#aeroCompGlow)" />
          <rect x="42" y="145" width="18" height="50" rx="9" fill="#047857" stroke="#00FF66" strokeWidth="1.5" />
          <circle cx="51" cy="170" r="20" fill="#0b1320" stroke="#00FF66" strokeWidth="3" />
          <circle cx="51" cy="170" r="5" fill="#00FF66" filter="url(#aeroCompGlow)" />
        </g>

        {/* Right Ear Pod */}
        <g>
          <path d="M 268,145 Q 302,110 288,175 Q 268,160 268,145 Z" fill="#00FF66" opacity="0.85" filter="url(#aeroCompGlow)" />
          <rect x="260" y="145" width="18" height="50" rx="9" fill="#047857" stroke="#00FF66" strokeWidth="1.5" />
          <circle cx="269" cy="170" r="20" fill="#0b1320" stroke="#00FF66" strokeWidth="3" />
          <circle cx="269" cy="170" r="5" fill="#00FF66" filter="url(#aeroCompGlow)" />
        </g>

        {/* Core Sphere */}
        <circle cx="160" cy="175" r="95" fill="url(#aeroSphereGradC)" stroke="#334155" strokeWidth="3.5" />
        <circle cx="160" cy="175" r="95" fill="url(#aeroHighlightC)" />

        {/* Dark Screen Face */}
        <ellipse cx="160" cy="172" rx="72" ry="54" fill="#020617" stroke="#1e293b" strokeWidth="2.5" />
        <path d="M 108,140 Q 160,126 212,140" stroke="#475569" strokeWidth="2" strokeLinecap="round" opacity="0.4" fill="none" />

        {/* Dynamic Expressions */}
        <g filter="url(#aeroCompGlow)">
          {renderEyes()}
        </g>

        {/* Hx313 Chin Branding */}
        <g transform="translate(160, 245)">
          <text x="0" y="0" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="12" fontWeight="800" fill="#94a3b8" letterSpacing="2">Hx313</text>
        </g>
      </svg>
    </div>
  );
}
