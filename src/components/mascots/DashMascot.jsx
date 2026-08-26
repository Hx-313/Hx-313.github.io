import React from 'react';

/**
 * DASH: The System Drone Mascot
 * "I move, monitor and execute."
 * Personality: Energetic, Fast, Focused, Reliable
 * Signature elements:
 * - Antennae (Signal receiver)
 * - Face Screen (Expression engine)
 * - Thrusters (Flight & movement with green plasma trails)
 * - Arms & Hands (Interaction / action)
 * - White & Dark armor chassis with HX313 chest emblem
 */

export const DASH_EXPRESSIONS = [
  'happy',
  'winking',
  'excited',
  'focused',
  'scanning',
  'confused',
  'executing',
  'alert',
  'sleep',
];

export default function DashMascot({
  expression = 'happy',
  size = 180,
  className = '',
  bubble = null,
  onClick,
  eyeOffset = { x: 0, y: 0 },
  isFloating = true,
  armPose = 'point', // 'point', 'wave', 'idle'
}) {
  const renderEyes = () => {
    const { x, y } = eyeOffset;
    const transform = `translate(${x}px, ${y}px)`;

    switch (expression) {
      case 'winking':
        return (
          <g transform={transform}>
            {/* Left Eye Happy Arc */}
            <path d="M 120,150 Q 135,130 150,150" fill="none" stroke="#00FF66" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M 121,150 Q 135,132 149,150" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            {/* Right Eye Sharp Wink > */}
            <path d="M 172,142 L 186,150 L 200,142" fill="none" stroke="#00FF66" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 152,170 Q 160,178 168,170" fill="none" stroke="#00FF66" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );
      case 'excited':
        return (
          <g transform={transform}>
            {/* Wide Sparkle Eyes */}
            <path d="M 118,150 Q 135,125 152,150" fill="none" stroke="#00FF66" strokeWidth="7" strokeLinecap="round" />
            <path d="M 168,150 Q 185,125 202,150" fill="none" stroke="#00FF66" strokeWidth="7" strokeLinecap="round" />
            <path d="M 120,150 Q 135,127 150,150" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 170,150 Q 185,127 200,150" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            {/* Open Happy Mouth */}
            <path d="M 150,166 Q 160,178 170,166 Z" fill="#00FF66" />
          </g>
        );
      case 'focused':
        return (
          <g transform={transform}>
            {/* Sharp Angled Eyebrows / Eyes \ / */}
            <line x1="120" y1="140" x2="150" y2="152" stroke="#00FF66" strokeWidth="6" strokeLinecap="round" />
            <line x1="200" y1="140" x2="170" y2="152" stroke="#00FF66" strokeWidth="6" strokeLinecap="round" />
            <circle cx="140" cy="154" r="4" fill="#ffffff" />
            <circle cx="180" cy="154" r="4" fill="#ffffff" />
            <line x1="154" y1="170" x2="166" y2="170" stroke="#00FF66" strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case 'scanning':
        return (
          <g transform={transform}>
            {/* Target Reticles */}
            <circle cx="135" cy="148" r="12" fill="none" stroke="#00FF66" strokeWidth="3" strokeDasharray="14 6" />
            <circle cx="185" cy="148" r="12" fill="none" stroke="#00FF66" strokeWidth="3" strokeDasharray="14 6" />
            <line x1="135" y1="138" x2="135" y2="158" stroke="#00FF66" strokeWidth="2" />
            <line x1="125" y1="148" x2="145" y2="148" stroke="#00FF66" strokeWidth="2" />
            <line x1="185" y1="138" x2="185" y2="158" stroke="#00FF66" strokeWidth="2" />
            <line x1="175" y1="148" x2="195" y2="148" stroke="#00FF66" strokeWidth="2" />
          </g>
        );
      case 'confused':
        return (
          <g transform={transform}>
            <circle cx="132" cy="146" r="8" fill="#00FF66" />
            <circle cx="130" cy="144" r="3" fill="#ffffff" />
            <path d="M 172,152 Q 186,138 200,152" fill="none" stroke="#00FF66" strokeWidth="6" strokeLinecap="round" />
            <path d="M 150,172 Q 160,165 170,174" fill="none" stroke="#00FF66" strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case 'executing':
        return (
          <g transform={transform}>
            {/* Forward Chevron Arrows >> >> */}
            <path d="M 124,140 L 138,150 L 124,160" fill="none" stroke="#00FF66" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 138,140 L 152,150 L 138,160" fill="none" stroke="#00FF66" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 168,140 L 182,150 L 168,160" fill="none" stroke="#00FF66" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 182,140 L 196,150 L 182,160" fill="none" stroke="#00FF66" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      case 'alert':
        return (
          <g transform={transform}>
            <circle cx="135" cy="148" r="14" fill="none" stroke="#00FF66" strokeWidth="4" />
            <text x="135" y="154" textAnchor="middle" fill="#00FF66" fontSize="16" fontFamily="monospace" fontWeight="900">!</text>
            <circle cx="185" cy="148" r="14" fill="none" stroke="#00FF66" strokeWidth="4" />
            <text x="185" y="154" textAnchor="middle" fill="#00FF66" fontSize="16" fontFamily="monospace" fontWeight="900">!</text>
          </g>
        );
      case 'sleep':
        return (
          <g transform={transform}>
            <line x1="120" y1="150" x2="150" y2="150" stroke="#00FF66" strokeWidth="5" strokeLinecap="round" />
            <line x1="170" y1="150" x2="200" y2="150" stroke="#00FF66" strokeWidth="5" strokeLinecap="round" />
            <text x="200" y="132" fill="#00FF66" fontSize="12" fontFamily="monospace" fontWeight="bold">z</text>
            <text x="212" y="122" fill="#00FF66" fontSize="10" fontFamily="monospace" fontWeight="bold">z</text>
          </g>
        );
      case 'happy':
      default:
        return (
          <g transform={transform}>
            <path d="M 120,150 Q 135,130 150,150" fill="none" stroke="#00FF66" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M 170,150 Q 185,130 200,150" fill="none" stroke="#00FF66" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M 121,150 Q 135,132 149,150" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            <path d="M 171,150 Q 185,132 199,150" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            <path d="M 152,170 Q 160,178 168,170" fill="none" stroke="#00FF66" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );
    }
  };

  return (
    <div
      className={`dash-mascot-container relative inline-block select-none ${isFloating ? 'mascot-float-dash' : ''} ${className}`}
      style={{ width: size, height: (size * 380) / 320 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Dash mascot, currently expressing ${expression}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(e);
      }}
    >
      {bubble && (
        <div className="mischief-bubble bubble-dash show absolute -top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
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
          <filter id="dashCompGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur1" />
            <feGaussianBlur stdDeviation="12" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="dashWhiteArmorC" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="dashDarkArmorC" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="70%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="dashJetTrailC" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#00FF66" />
            <stop offset="80%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Jet Thruster Exhaust Flames */}
        <g filter="url(#dashCompGlow)">
          <path d="M 68,225 Q 25,265 15,315 Q 45,290 76,245 Z" fill="url(#dashJetTrailC)" opacity="0.9" />
          <path d="M 252,225 Q 295,265 305,315 Q 275,290 244,245 Z" fill="url(#dashJetTrailC)" opacity="0.9" />
          <path d="M 128,300 Q 120,345 110,360 Q 135,340 138,300 Z" fill="url(#dashJetTrailC)" opacity="0.85" />
          <path d="M 192,300 Q 200,345 210,360 Q 185,340 182,300 Z" fill="url(#dashJetTrailC)" opacity="0.85" />
        </g>

        {/* Rear Wing Thruster Fins */}
        <g>
          <path d="M 95,185 L 45,200 Q 35,215 50,225 L 90,210 Z" fill="url(#dashDarkArmorC)" stroke="#334155" strokeWidth="2" />
          <polygon points="50,205 40,215 65,215 75,205" fill="#00FF66" filter="url(#dashCompGlow)" />
          <path d="M 225,185 L 275,200 Q 285,215 270,225 L 230,210 Z" fill="url(#dashDarkArmorC)" stroke="#334155" strokeWidth="2" />
          <polygon points="270,205 280,215 255,215 245,205" fill="#00FF66" filter="url(#dashCompGlow)" />
        </g>

        {/* Cyber Antennae */}
        <g>
          <polygon points="98,110 65,30 125,90" fill="url(#dashDarkArmorC)" stroke="#334155" strokeWidth="2.5" />
          <polygon points="92,95 72,45 110,85" fill="#00FF66" filter="url(#dashCompGlow)" />
          <polygon points="222,110 255,30 195,90" fill="url(#dashDarkArmorC)" stroke="#334155" strokeWidth="2.5" />
          <polygon points="228,95 248,45 210,85" fill="#00FF66" filter="url(#dashCompGlow)" />
        </g>

        {/* White Armor Helmet */}
        <rect x="80" y="85" width="160" height="135" rx="55" fill="url(#dashWhiteArmorC)" stroke="#94a3b8" strokeWidth="3" />
        <path d="M 115,95 Q 160,88 205,95" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />

        {/* Dark Screen Face */}
        <rect x="98" y="105" width="124" height="96" rx="34" fill="#020617" stroke="#1e293b" strokeWidth="2" />

        {/* Dynamic Expressions */}
        <g filter="url(#dashCompGlow)">
          {renderEyes()}
        </g>

        {/* Torso & Arms */}
        <g>
          <rect x="145" y="218" width="30" height="12" rx="4" fill="#0f172a" />
          <path d="M 120,230 L 200,230 L 188,285 L 132,285 Z" fill="url(#dashDarkArmorC)" stroke="#334155" strokeWidth="2" />
          <path d="M 128,235 L 192,235 L 182,275 L 138,275 Z" fill="url(#dashWhiteArmorC)" />

          {/* HX313 Logo */}
          <text x="160" y="260" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="11" fontWeight="900" fill="#0f172a">HX313</text>

          {/* Left Arm (Point Pose default) */}
          <g>
            <circle cx="102" cy="240" r="12" fill="url(#dashWhiteArmorC)" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 98,245 L 72,225 Q 65,215 58,225 L 88,255 Z" fill="url(#dashDarkArmorC)" />
            <circle cx="62" cy="218" r="7" fill="#020617" />
            <path d="M 62,216 L 52,205" stroke="#020617" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Right Arm */}
          <g>
            <circle cx="218" cy="240" r="12" fill="url(#dashWhiteArmorC)" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 222,245 L 248,258 Q 258,265 252,275 L 228,258 Z" fill="url(#dashDarkArmorC)" />
            <circle cx="254" cy="270" r="7" fill="#020617" />
          </g>

          {/* Legs */}
          <rect x="134" y="285" width="18" height="24" rx="6" fill="url(#dashWhiteArmorC)" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="168" y="285" width="18" height="24" rx="6" fill="url(#dashWhiteArmorC)" stroke="#94a3b8" strokeWidth="1.5" />
          <ellipse cx="143" cy="308" rx="8" ry="4" fill="#00FF66" filter="url(#dashCompGlow)" />
          <ellipse cx="177" cy="308" rx="8" ry="4" fill="#00FF66" filter="url(#dashCompGlow)" />
        </g>
      </svg>
    </div>
  );
}
