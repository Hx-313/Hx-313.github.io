import { useEffect, useState } from 'react';

export default function MascotCrew() {
  const [aeroBubble, setAeroBubble] = useState(null);
  const [dashBubble, setDashBubble] = useState(null);
  const [aeroAnim, setAeroAnim] = useState('');
  const [dashAnim, setDashAnim] = useState('');

  // Autonomous Mischief Bickering Loop
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return undefined;

    const interval = setInterval(() => {
      // 1. Dash swoops over and pecks Aero
      setDashAnim('poke-dash-action');
      setDashBubble('*Hey Aero! 🐦*');

      setTimeout(() => {
        setDashAnim('');
        setDashBubble(null);

        // 2. Aero gets startled & wobbles
        setAeroAnim('aero-shock-action');
        setAeroBubble('*(>_<) Focus, Dash!*');

        setTimeout(() => {
          setAeroAnim('');
          setAeroBubble(null);

          // 3. Dash does a 360 victory spin
          setDashAnim('dash-loop-action');
          setDashBubble('*Deploying! 🚀*');

          setTimeout(() => {
            setDashAnim('');
            setDashBubble(null);
          }, 1000);

        }, 800);
      }, 600);
    }, 7500);

    return () => clearInterval(interval);
  }, []);

  const triggerAero = () => {
    setAeroAnim('aero-shock-action');
    setAeroBubble('*I think, analyze & assist! 🤖*');
    setTimeout(() => {
      setAeroAnim('');
      setAeroBubble(null);
    }, 1400);
  };

  const triggerDash = () => {
    setDashAnim('dash-loop-action');
    setDashBubble('*I move, monitor & execute! ⚡*');
    setTimeout(() => {
      setDashAnim('');
      setDashBubble(null);
    }, 1400);
  };

  return (
    <div className="mascots-playfield" aria-label="Aero and Dash system mascots">
      {/* AERO: The AI Assistant */}
      <div
        className={`mascot-unit mascot-aero ${aeroAnim}`}
        onClick={triggerAero}
        role="button"
        tabIndex={0}
        aria-label="Aero, AI Assistant mascot"
        title="Aero · AI Assistant (Click to interact)"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerAero(); }}
      >
        <div className={`mischief-bubble bubble-aero ${aeroBubble ? 'show' : ''}`}>
          {aeroBubble}
        </div>
        <svg viewBox="0 0 200 240" width="88" height="106" role="img" aria-hidden="true">
          <defs>
            <linearGradient id="aero_body_grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#223046" />
              <stop offset="100%" stopColor="#0a101d" />
            </linearGradient>
            <filter id="haloGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Floating Green Halo Ring (Thinking Indicator) */}
          <ellipse cx="100" cy="36" rx="42" ry="12" fill="none" stroke="#22c55e" strokeWidth="4.5" filter="url(#haloGlowFilter)" opacity="0.95" />

          {/* Floating Thruster Energy Leaves */}
          <path d="M 80,185 Q 70,205 85,215 Q 92,200 86,185 Z" fill="#22c55e" opacity="0.85" filter="url(#haloGlowFilter)" />
          <path d="M 120,185 Q 130,205 115,215 Q 108,200 114,185 Z" fill="#22c55e" opacity="0.85" filter="url(#haloGlowFilter)" />
          <ellipse cx="100" cy="188" rx="14" ry="5" fill="#22c55e" opacity="0.9" />

          {/* Spherical Core Body */}
          <circle cx="100" cy="115" r="62" fill="url(#aero_body_grad)" stroke="#334155" strokeWidth="2.5" />

          {/* Ear Pods (Audio Interface) */}
          <rect x="32" y="98" width="12" height="34" rx="6" fill="#10b981" filter="url(#haloGlowFilter)" />
          <circle cx="38" cy="115" r="14" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
          <circle cx="38" cy="115" r="6" fill="#22c55e" />

          <rect x="156" y="98" width="12" height="34" rx="6" fill="#10b981" filter="url(#haloGlowFilter)" />
          <circle cx="162" cy="115" r="14" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
          <circle cx="162" cy="115" r="6" fill="#22c55e" />

          {/* Dark Glass Face Screen */}
          <ellipse cx="100" cy="115" rx="46" ry="34" fill="#020617" stroke="#1e293b" strokeWidth="1.5" />

          {/* Expressive Glowing LED Eyes (Happy ^ ^) */}
          <path d="M 78,118 Q 88,102 98,118" fill="none" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" filter="url(#haloGlowFilter)" />
          <path d="M 102,118 Q 112,102 122,118" fill="none" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" filter="url(#haloGlowFilter)" />

          {/* Hx313 Imprint on Chin */}
          <text x="100" y="162" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="8" fontWeight="700" fill="#94a3b8" letterSpacing="1">Hx313</text>
        </svg>
      </div>

      {/* DASH: The System Drone */}
      <div
        className={`mascot-unit mascot-dash ${dashAnim}`}
        onClick={triggerDash}
        role="button"
        tabIndex={0}
        aria-label="Dash, System Drone mascot"
        title="Dash · System Drone (Click to interact)"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerDash(); }}
      >
        <div className={`mischief-bubble bubble-dash ${dashBubble ? 'show' : ''}`}>
          {dashBubble}
        </div>
        <svg viewBox="0 0 200 240" width="82" height="100" role="img" aria-hidden="true">
          <defs>
            <linearGradient id="dash_white_grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="dash_dark_grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* Wing Thrusters (Flight & Movement) */}
          <path d="M 38,105 Q 10,85 24,125 Q 38,115 38,105 Z" fill="#22c55e" filter="url(#haloGlowFilter)" opacity="0.9" />
          <path d="M 162,105 Q 190,85 176,125 Q 162,115 162,105 Z" fill="#22c55e" filter="url(#haloGlowFilter)" opacity="0.9" />

          {/* Antennae Signal Receivers */}
          <polygon points="58,65 42,22 72,55" fill="url(#dash_dark_grad)" stroke="#334155" strokeWidth="1.5" />
          <polygon points="56,60 46,28 66,54" fill="#22c55e" />

          <polygon points="142,65 158,22 128,55" fill="url(#dash_dark_grad)" stroke="#334155" strokeWidth="1.5" />
          <polygon points="144,60 154,28 134,54" fill="#22c55e" />

          {/* Main Helmet Body */}
          <rect x="52" y="52" width="96" height="78" rx="34" fill="url(#dash_white_grad)" stroke="#cbd5e1" strokeWidth="2" />

          {/* Dark Glass Face Screen */}
          <rect x="62" y="62" width="76" height="58" rx="22" fill="#050a14" stroke="#0f172a" strokeWidth="1.5" />

          {/* Glowing LED Eyes */}
          <path d="M 76,92 Q 84,80 92,92" fill="none" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" filter="url(#haloGlowFilter)" />
          <path d="M 108,92 Q 116,80 124,92" fill="none" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" filter="url(#haloGlowFilter)" />

          {/* Articulated Torso & Arms */}
          <rect x="76" y="132" width="48" height="36" rx="14" fill="url(#dash_dark_grad)" />
          <circle cx="58" cy="142" r="10" fill="url(#dash_white_grad)" />
          <circle cx="142" cy="142" r="10" fill="url(#dash_white_grad)" />
          <text x="100" y="154" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="7" fontWeight="800" fill="#fff">HX313</text>
        </svg>
      </div>
    </div>
  );
}
