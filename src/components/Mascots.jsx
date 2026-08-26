import { useEffect, useRef, useState } from 'react';

/*
  Aero (robot) + Dash (bird) — the guide & conversation system.
  - Scroll-driven "beats": each page section maps to a beat.
  - A beat can hold several lines that auto-advance, so the two mascots
    perform little skits — sometimes to the visitor, sometimes to each other
    (Dash plays the customer, Aero vouches for Abdullah) — each ending on a CTA.
  - Eye-tracking, random blinking, and click-to-play mischief are preserved.

  To add/adjust dialogue for a section, edit BEATS below (key = section id).
*/

const BEATS = {
  hero: {
    pos: 'center-right',
    lines: [
      { who: 'aero', text: "Hey there! 👋 I'm Aero. This is Dash. We'll show you around Abdullah's studio." },
      { who: 'dash', text: "Psst… Aero. This visitor probably needs an app built. 👀" },
      { who: 'aero', text: "Then they're in the right place. Abdullah ships real apps in <strong>weeks</strong>. Scroll on — I'll prove it. 🚀" },
    ],
    cta: { label: "Book a call →", href: '#book' },
  },
  principles: {
    pos: 'bottom-right',
    lines: [
      { who: 'dash', text: "Okay but is he actually reliable? I've been ghosted by devs before… 😩" },
      { who: 'aero', text: "Not here. Fixed scope, weekly demos, you own the code. These are the rules he works by. ✅" },
    ],
    cta: { label: "See the work →", href: '#work' },
  },
  services: {
    pos: 'bottom-left',
    lines: [
      { who: 'aero', text: "Whatever you need — an MVP, a cross-platform app, or a full SaaS — it's on the menu." },
      { who: 'dash', text: "One codebase, both app stores. That's half the cost right there. 💙" },
    ],
    cta: { label: "Start your project →", href: '#book' },
  },
  work: {
    pos: 'bottom-right',
    lines: [
      { who: 'dash', text: "Proof time! Every one of these is live on the App Store & Google Play. Tap one. 📱" },
    ],
    cta: { label: "Talk to Abdullah →", href: '#book' },
  },
  saas: {
    pos: 'bottom-left',
    lines: [
      { who: 'dash', text: "Wait — he built a whole ordering SaaS? Website, POS, dispatch app… by himself? 🤯" },
      { who: 'aero', text: "End to end. So whatever *you're* imagining — yeah, he can build that too. 🌐" },
    ],
    cta: { label: "Tell him your idea →", href: '#book' },
  },
  book: {
    pos: 'bottom-right',
    lines: [
      { who: 'aero', text: "This is the part where it gets real. Grab a free call — no pressure, no jargon." },
      { who: 'dash', text: "Go on. I'll wait right here. 🐦" },
    ],
    cta: { label: "Book the call ↑", href: '#book' },
  },
};

const AERO_MISCHIEF = [
  { a: 'm-poke-right', d: 'm-wobble', who: 'aero', text: "*pokes Dash* Wake up, birdie — we've got a visitor! 👉🐦" },
  { a: 'm-spin', d: 'm-jump-back', who: 'aero', text: "Watch this spin move! 🌀 …okay, I'm dizzy now." },
  { a: 'm-dance', d: 'm-flap', who: 'aero', text: "🎵 Hot reload, hot reload, watch my code just overload! 🎵" },
  { a: 'm-bounce', d: 'm-wave', who: 'aero', text: "I compiled 10,000 widgets before breakfast. Just sayin'. 🤖⚡" },
];
const DASH_MISCHIEF = [
  { d: 'm-poke-left', a: 'm-wobble', who: 'dash', text: "*pecks Aero* Beep boop yourself, tin can! 🐦💥" },
  { d: 'm-flap', a: 'm-jump-back', who: 'dash', text: "FLUTTER FLUTTER FLUTTER! 💙 I do what I want." },
  { d: 'm-spin', a: 'm-wave', who: 'dash', text: "Fun fact: setState(() {}) is basically magic. Fight me. ✨" },
  { d: 'm-dance', a: 'm-wobble', who: 'dash', text: "🎵 Build, run, hot reload — that's how Flutter rolls! 🎵" },
];

export default function Mascots() {
  const guideRef = useRef(null);
  const aeroRef = useRef(null);
  const dashRef = useRef(null);
  const eyeL = useRef(null);
  const eyeR = useRef(null);
  const dEyeL = useRef(null);
  const dEyeR = useRef(null);
  const lineTimer = useRef(null);
  const playing = useRef(false);

  const [beatKey, setBeatKey] = useState('hero');
  const [lineIdx, setLineIdx] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [banter, setBanter] = useState(null); // transient mischief line

  const beat = BEATS[beatKey] || BEATS.hero;
  const current = banter || beat.lines[Math.min(lineIdx, beat.lines.length - 1)];
  const pos = beat.pos === 'center-right' ? '' : beat.pos === 'bottom-left' ? 'bottom-left' : 'bottom-right';

  /* ---- scroll: pick the active beat ---- */
  useEffect(() => {
    const ids = Object.keys(BEATS);
    const targets = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (minimized) return;
        entries.forEach((e) => {
          if (e.isIntersecting && BEATS[e.target.id]) {
            setBeatKey(e.target.id);
            setBanter(null);
          }
        });
      },
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [minimized]);

  /* ---- auto-advance the lines within a beat (the "skit") ---- */
  useEffect(() => {
    setLineIdx(0);
    clearInterval(lineTimer.current);
    if (banter) return;
    if (beat.lines.length > 1) {
      lineTimer.current = setInterval(() => {
        setLineIdx((i) => {
          if (i >= beat.lines.length - 1) { clearInterval(lineTimer.current); return i; }
          return i + 1;
        });
      }, 3600);
    }
    return () => clearInterval(lineTimer.current);
  }, [beatKey, banter]);

  /* ---- eye tracking ---- */
  useEffect(() => {
    const move = (e) => {
      if (minimized) return;
      const g = guideRef.current;
      if (!g) return;
      const r = g.getBoundingClientRect();
      const ang = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
      const d = window.innerWidth <= 768 ? 2 : 4;
      const x = Math.cos(ang) * d, y = Math.sin(ang) * d;
      [eyeL, eyeR].forEach((ref) => ref.current && (ref.current.style.transform = `translate(${x}px,${y}px)`));
      [dEyeL, dEyeR].forEach((ref) => ref.current && (ref.current.style.transform = `translate(${x * 0.8}px,${y * 0.8}px)`));
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [minimized]);

  /* ---- random blink ---- */
  useEffect(() => {
    const blink = () => {
      [eyeL, eyeR, dEyeL, dEyeR].forEach((ref) => {
        if (!ref.current) return;
        const t = ref.current.style.transform;
        ref.current.style.transform = 'scaleY(0.1)';
        setTimeout(() => { if (ref.current) ref.current.style.transform = t || ''; }, 150);
      });
    };
    const iv = setInterval(() => { if (!minimized) blink(); }, 4200);
    return () => clearInterval(iv);
  }, [minimized]);

  /* ---- click mischief ---- */
  const playMischief = (initiator) => {
    if (minimized) { setMinimized(false); return; }
    if (playing.current) return;
    playing.current = true;
    const pool = initiator === 'aero' ? AERO_MISCHIEF : DASH_MISCHIEF;
    const act = pool[Math.floor(Math.random() * pool.length)];
    aeroRef.current && aeroRef.current.classList.add(act.a);
    setTimeout(() => dashRef.current && dashRef.current.classList.add(act.d), 140);
    setBanter({ who: act.who, text: act.text });
    setTimeout(() => {
      aeroRef.current && (aeroRef.current.className = 'avatar aero');
      dashRef.current && (dashRef.current.className = 'avatar dash');
      playing.current = false;
      setBanter(null);
    }, 1300);
  };

  return (
    <div className={`guide${minimized ? ' min' : ''}`} data-pos={pos} ref={guideRef}>
      <div className="avatars">
        {/* ---------------- AERO ---------------- */}
        <svg ref={aeroRef} onClick={() => playMischief('aero')} className="avatar aero"
          viewBox="0 0 200 220" width="96" height="106" role="img" aria-label="Aero, robot guide">
          <defs>
            <filter id="ng" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" /><stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="nt" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-accent)" />
            </linearGradient>
            <linearGradient id="vg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0d1527" /><stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>
          <path className="thruster" d="M 85,165 L 100,190 L 115,165 Z" fill="url(#nt)" opacity="0.8" filter="url(#ng)" />
          <path d="M 90,165 L 100,180 L 110,165 Z" fill="#fff" opacity="0.9" />
          <rect x="35" y="70" width="12" height="30" rx="6" fill="var(--color-secondary)" filter="url(#ng)" />
          <line x1="47" y1="85" x2="55" y2="85" stroke="var(--color-secondary)" strokeWidth="3" />
          <rect x="153" y="70" width="12" height="30" rx="6" fill="var(--color-secondary)" filter="url(#ng)" />
          <line x1="153" y1="85" x2="145" y2="85" stroke="var(--color-secondary)" strokeWidth="3" />
          <path d="M 47,75 A 53,53 0 0,1 153,75" fill="none" stroke="var(--color-secondary)" strokeWidth="4" />
          <rect x="65" y="115" width="70" height="50" rx="20" fill="url(#bg)" stroke="#1e293b" strokeWidth="2" />
          <circle cx="100" cy="138" r="10" fill="url(#nt)" filter="url(#ng)" />
          <circle cx="100" cy="138" r="4" fill="#fff" />
          <circle cx="45" cy="135" r="10" fill="url(#bg)" stroke="var(--color-primary)" strokeWidth="2" />
          <circle cx="155" cy="135" r="10" fill="url(#bg)" stroke="var(--color-primary)" strokeWidth="2" />
          <rect x="50" y="50" width="100" height="70" rx="30" fill="url(#bg)" stroke="#1e293b" strokeWidth="2" />
          <rect x="60" y="60" width="80" height="40" rx="15" fill="url(#vg)" stroke="#1e293b" strokeWidth="1" />
          <circle cx="85" cy="80" r="12" fill="#020617" />
          <circle ref={eyeL} className="eye" cx="85" cy="80" r="5" fill="var(--color-primary)" filter="url(#ng)" />
          <circle cx="83" cy="78" r="2" fill="#fff" />
          <circle cx="115" cy="80" r="12" fill="#020617" />
          <circle ref={eyeR} className="eye" cx="115" cy="80" r="5" fill="var(--color-primary)" filter="url(#ng)" />
          <circle cx="113" cy="78" r="2" fill="#fff" />
        </svg>

        {/* ---------------- DASH ---------------- */}
        <svg ref={dashRef} onClick={() => playMischief('dash')} className="avatar dash"
          viewBox="0 0 200 220" width="90" height="100" role="img" aria-label="Dash, mascot">
          <defs>
            <linearGradient id="db" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="dl" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bae6fd" /><stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
            <filter id="ds" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0ea5e9" floodOpacity="0.3" />
            </filter>
          </defs>
          <path d="M 50,110 C 50,55 150,55 150,110 C 150,165 130,195 100,195 C 70,195 50,165 50,110 Z" fill="url(#db)" filter="url(#ds)" />
          <path d="M 65,120 C 65,85 135,85 135,120 C 135,160 120,185 100,185 C 80,185 65,160 65,120 Z" fill="url(#dl)" />
          <path d="M 50,110 Q 15,135 30,170 Q 45,145 55,135" fill="url(#db)" />
          <path d="M 150,110 Q 185,135 170,170 Q 155,145 145,135" fill="url(#db)" />
          <path d="M 55,85 L 145,85" stroke="#0ea5e9" strokeWidth="6" fill="none" />
          <circle cx="80" cy="85" r="18" fill="#fff" stroke="#0ea5e9" strokeWidth="5" />
          <circle cx="120" cy="85" r="18" fill="#fff" stroke="#0ea5e9" strokeWidth="5" />
          <circle ref={dEyeL} className="eye" cx="80" cy="85" r="6" fill="#0f172a" />
          <circle cx="78" cy="83" r="2" fill="#fff" />
          <circle ref={dEyeR} className="eye" cx="120" cy="85" r="6" fill="#0f172a" />
          <circle cx="118" cy="83" r="2" fill="#fff" />
          <path d="M 88,105 L 112,105 L 100,122 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" strokeLinejoin="round" />
          <path d="M 95,55 Q 100,35 110,48 Q 105,40 115,55" fill="none" stroke="url(#dl)" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>

      {/* ---------------- BUBBLE ---------------- */}
      <div className="bubble">
        <div className={`speaker ${current.who}`}>{current.who === 'aero' ? 'Aero' : 'Dash'}</div>
        <div className="text" dangerouslySetInnerHTML={{ __html: current.text }} />
        <div className="controls">
          <button className="skip" onClick={() => setMinimized(true)}>Skip</button>
          <a className="next" href={beat.cta.href}>{beat.cta.label}</a>
        </div>
        <div className="arrow" />
      </div>
    </div>
  );
}
