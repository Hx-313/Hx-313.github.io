import { useEffect, useRef, useState, useCallback } from 'react';
import AeroMascot from './mascots/AeroMascot.jsx';
import DashMascot from './mascots/DashMascot.jsx';

/**
 * PAGE-BOUND ACTIVE MASCOTS SYSTEM — AERO & DASH
 * - Strictly bounded to the active page container (Page 1 Hero vs Page 2 Command Center).
 * - Guaranteed: Mascots NEVER cross into Page 2 when reader is on Page 1.
 * - Interactive with reader: real-time cursor tracking, curious swoop passes, click/drag physics.
 * - Random collisions and playful argument skits occur strictly within the active page.
 */

const PAGE_ZONES = {
  page1: [
    { x: 18, y: 22, label: 'Hero Headline' },
    { x: 26, y: 64, label: 'CTA Buttons' },
    { x: 62, y: 28, label: 'Above Globe' },
    { x: 82, y: 55, label: 'Overview Card' },
    { x: 46, y: 16, label: 'Top Nav' },
    { x: 14, y: 46, label: 'Left Monolith' },
    { x: 84, y: 32, label: 'Right Sky' },
  ],
  page2: [
    { x: 22, y: 34, label: 'Active Build' },
    { x: 50, y: 26, label: 'System Core' },
    { x: 78, y: 48, label: 'Project Constellation' },
    { x: 48, y: 66, label: 'Command Telemetry' },
    { x: 18, y: 58, label: 'Ecosystem Controls' },
    { x: 82, y: 28, label: 'Performance Metrics' },
  ],
};

const PAGE_COMMENTARY = {
  page1: [
    { who: 'aero', text: "Scanning Page 1 hero architecture. All systems nominal. 🤖", expr: 'analyzing' },
    { who: 'dash', text: "Flying across Page 1! Look at that headline! ⚡💨", expr: 'excited' },
    { who: 'aero', text: "Notice the clean typography: 'A mindset Beyond ordinary.' ✨", expr: 'happy' },
    { who: 'dash', text: "Hey reader! Tap [Explore work] to see our live apps! 🚀", expr: 'winking' },
    { who: 'aero', text: "I analyze the architecture while Dash keeps systems moving.", expr: 'thinking' },
    { who: 'dash', text: "Swooping past your cursor, visitor! Catch me! 🐦⚡", expr: 'executing' },
    { who: 'aero', text: "Staying right here on Page 1 with you, reader! 👋", expr: 'happy' },
  ],
  page2: [
    { who: 'dash', text: "We're on Page 2: Command Center! Full WOS ecosystem! 🍔", expr: 'executing' },
    { who: 'aero', text: "Distributed ordering SaaS with real-time websocket sync. 🌐", expr: 'thinking' },
    { who: 'dash', text: "5+ published Flutter apps running live in production! 📱", expr: 'excited' },
    { who: 'aero', text: "Clean architecture verified. Zero ghosting, fixed scope. ✅", expr: 'happy' },
    { who: 'dash', text: "Tap any project card below to inspect live telemetry! ⚡", expr: 'winking' },
    { who: 'aero', text: "Command Center unlocked. Explore the constellation.", expr: 'happy' },
  ],
};

export const SPOT_COMMENTARY = PAGE_COMMENTARY;

const ARGUMENT_SKITS = [
  {
    title: "Airspace Collision",
    sound: "*CRASH! BOOP!*",
    lines: [
      { who: 'dash', text: "Whoa! Watch out, Aero! We almost crashed into the reader's cursor! ⚡💨", aExpr: 'surprised', dExpr: 'alert', aAnim: 'm-wobble', dAnim: 'm-jump-back' },
      { who: 'aero', text: "(>_<) Dash! That's because you were flying 200 knots over the hero layout!", aExpr: 'confused', dExpr: 'winking', aAnim: 'm-poke-right', dAnim: 'm-wobble' },
      { who: 'dash', text: "The reader likes speed! Speed is a feature! 🚀", aExpr: 'thinking', dExpr: 'excited', aAnim: '', dAnim: 'm-spin' },
      { who: 'aero', text: "Stability and clean architecture first, speedy drone! 🤖", aExpr: 'happy', dExpr: 'happy', aAnim: 'm-dance', dAnim: '' },
    ]
  },
  {
    title: "Hot Reload Overdrive",
    sound: "*CLANG! BZZT!*",
    lines: [
      { who: 'aero', text: "Dash, did you just trigger 42 hot reloads in 3 seconds?! (o_O)", aExpr: 'confused', dExpr: 'excited', aAnim: 'm-wobble', dAnim: 'm-flap' },
      { who: 'dash', text: "Every keystroke deserves immediate visual feedback! It feels faster! ✨", aExpr: 'analyzing', dExpr: 'winking', aAnim: '', dAnim: 'm-dance' },
      { who: 'aero', text: "You're going to overheat my thinking halo, you speed demon!", aExpr: 'surprised', dExpr: 'executing', aAnim: 'm-poke-right', dAnim: 'm-bounce' },
      { who: 'dash', text: "Zero compile lag, 60 FPS for our visitor! That's Flutter power! ⚡", aExpr: 'happy', dExpr: 'happy', aAnim: '', dAnim: 'm-spin' },
    ]
  },
  {
    title: "Code Review Showdown",
    sound: "*BUMP! SPARK!*",
    lines: [
      { who: 'dash', text: "Hey! Why did you comment on my pull request with 'needs more tests'?! 😤", aExpr: 'thinking', dExpr: 'focused', aAnim: 'm-jump-back', dAnim: 'm-poke-left' },
      { who: 'aero', text: "Because 99.8% test coverage is Abdullah's engineering standard! 🤖", aExpr: 'happy', dExpr: 'confused', aAnim: 'm-dance', dAnim: 'm-wobble' },
      { who: 'dash', text: "My tests passed in production in my head! 🐦⚡", aExpr: 'surprised', dExpr: 'excited', aAnim: '', dAnim: 'm-flap' },
      { who: 'aero', text: "(^o^) That is NOT how CI/CD works, Dash! Refactoring now... ✨", aExpr: 'analyzing', dExpr: 'happy', aAnim: '', dAnim: '' },
    ]
  },
  {
    title: "Tag & Chase Game",
    sound: "*TAG! BOOP!*",
    lines: [
      { who: 'dash', text: "*boops Aero's halo* Tag! You're it, slow-orb! Catch me if you can! 👉🐦", aExpr: 'surprised', dExpr: 'winking', aAnim: 'm-wobble', dAnim: 'm-spin' },
      { who: 'aero', text: "Activating dual ion thruster override! Initiating pursuit! 🛸💨", aExpr: 'excited', dExpr: 'excited', aAnim: 'm-bounce', dAnim: 'm-jump-back' },
      { who: 'dash', text: "Thrusters at maximum! Doing a barrel roll across the page! 🌀", aExpr: 'analyzing', dExpr: 'executing', aAnim: 'm-dance', dAnim: 'm-flap' },
      { who: 'aero', text: "Target locked! Gotcha! Telemetry calibrated. 🤖✨", aExpr: 'happy', dExpr: 'happy', aAnim: 'm-poke-right', dAnim: 'm-wobble' },
    ]
  },
  {
    title: "Architecture Consensus",
    sound: "*SMACK! CRACKLE!*",
    lines: [
      { who: 'dash', text: "Microservices! 500 serverless functions for a todo list! ⚡", aExpr: 'confused', dExpr: 'excited', aAnim: 'm-wobble', dAnim: 'm-bounce' },
      { who: 'aero', text: "Modular monolith with clean domain boundaries and fast builds! 🤖", aExpr: 'thinking', dExpr: 'focused', aAnim: 'm-dance', dAnim: '' },
      { who: 'dash', text: "Okay okay, but we agree Abdullah writes the best Flutter apps? 💙", aExpr: 'happy', dExpr: 'winking', aAnim: '', dAnim: 'm-flap' },
      { who: 'aero', text: "Unanimous consensus. Let's ship the build! 🚀", aExpr: 'happy', dExpr: 'happy', aAnim: 'm-spin', dAnim: 'm-spin' },
    ]
  }
];

export default function Mascots({ stage = 'page1', showController = true }) {
  const containerRef = useRef(null);
  const [isRoam, setIsRoam] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const activePage = stage; // Strictly bound to the section container

  // Position coordinates (% within active container)
  const defaultAero = stage === 'page1' ? { x: 18, y: 26 } : { x: 20, y: 32 };
  const defaultDash = stage === 'page1' ? { x: 74, y: 46 } : { x: 72, y: 44 };

  const [aeroPos, setAeroPos] = useState(defaultAero);
  const [dashPos, setDashPos] = useState(defaultDash);

  // Eye tracking offsets relative to cursor
  const [eyeOffsetAero, setEyeOffsetAero] = useState({ x: 0, y: 0 });
  const [eyeOffsetDash, setEyeOffsetDash] = useState({ x: 0, y: 0 });

  // Expressions & Animations
  const [aeroAnim, setAeroAnim] = useState('');
  const [dashAnim, setDashAnim] = useState('');
  const [aeroExpr, setAeroExpr] = useState('happy');
  const [dashExpr, setDashExpr] = useState('happy');

  // Speech bubbles
  const [aeroBubble, setAeroBubble] = useState(null);
  const [dashBubble, setDashBubble] = useState(null);

  // Collision Spark
  const [collisionEffect, setCollisionEffect] = useState(null);
  const isBickering = useRef(false);
  const roamTimer = useRef(null);
  const collisionTimer = useRef(null);
  const draggingRef = useRef(null);
  const mousePosRef = useRef({ x: 500, y: 300 });

  // 1. REAL-TIME CURSOR EYE-TRACKING (Accurate to active page container)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Store local container mouse position
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      const aeroPixelX = (aeroPos.x / 100) * rect.width;
      const aeroPixelY = (aeroPos.y / 100) * rect.height;
      const dashPixelX = (dashPos.x / 100) * rect.width;
      const dashPixelY = (dashPos.y / 100) * rect.height;

      const aeroAngle = Math.atan2((e.clientY - rect.left) - aeroPixelY, (e.clientX - rect.top) - aeroPixelX);
      const dashAngle = Math.atan2((e.clientY - rect.left) - dashPixelY, (e.clientX - rect.top) - dashPixelX);

      setEyeOffsetAero({
        x: Math.cos(aeroAngle) * 4,
        y: Math.sin(aeroAngle) * 3,
      });

      setEyeOffsetDash({
        x: Math.cos(dashAngle) * 4,
        y: Math.sin(dashAngle) * 3,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [aeroPos, dashPos]);

  // 2. GENERATE WAYPOINT CONFINED 100% TO CURRENT ACTIVE PAGE
  const getRandomWaypoint = useCallback((current, isDash = false) => {
    const currentZones = PAGE_ZONES[activePage] || PAGE_ZONES.page1;

    // Occasionally fly towards the reader's cursor on the CURRENT page
    if (Math.random() < 0.28 && containerRef.current && mousePosRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const mouseXPct = (mousePosRef.current.x / rect.width) * 100;
        const mouseYPct = (mousePosRef.current.y / rect.height) * 100;
        return {
          x: Math.max(8, Math.min(88, mouseXPct + (Math.random() * 16 - 8))),
          y: Math.max(12, Math.min(78, mouseYPct + (Math.random() * 14 - 7))),
        };
      }
    }

    const targetZone = currentZones[Math.floor(Math.random() * currentZones.length)];
    const jitterX = Math.random() * 10 - 5;
    const jitterY = Math.random() * 8 - 4;

    return {
      x: Math.max(8, Math.min(88, targetZone.x + jitterX)),
      y: Math.max(12, Math.min(78, targetZone.y + jitterY)),
    };
  }, [activePage]);

  // 3. CONTEXTUAL SPOT COMMENTARY (Active Page specific)
  const triggerSpotCommentary = useCallback((pos, isDash) => {
    if (isBickering.current || Math.random() > 0.42) return;

    const pool = PAGE_COMMENTARY[activePage] || PAGE_COMMENTARY.page1;
    const item = pool[Math.floor(Math.random() * pool.length)];

    if (item.who === 'aero' && !isDash) {
      setAeroBubble(item.text);
      setAeroExpr(item.expr || 'happy');
      setTimeout(() => setAeroBubble(null), 3800);
    } else if (item.who === 'dash' && isDash) {
      setDashBubble(item.text);
      setDashExpr(item.expr || 'happy');
      setTimeout(() => setDashBubble(null), 3800);
    }
  }, [activePage]);

  // 4. TRIGGER COLLISION & ARGUMENT SKIT ON CURRENT PAGE
  const triggerCollision = useCallback((forced = false) => {
    if (isBickering.current && !forced) return;
    isBickering.current = true;

    // Intercept towards each other within active page bounds
    const midX = (aeroPos.x + dashPos.x) / 2 || 50;
    const midY = (aeroPos.y + dashPos.y) / 2 || 40;

    setAeroPos({ x: midX - 4, y: midY });
    setDashPos({ x: midX + 4, y: midY });

    const skit = ARGUMENT_SKITS[Math.floor(Math.random() * ARGUMENT_SKITS.length)];
    
    setTimeout(() => {
      // Impact burst effect
      setCollisionEffect({ x: midX, y: midY, text: skit.sound });
      
      // Elastic recoil bounce (confined to current page)
      setAeroPos({ x: Math.max(8, midX - 14), y: Math.max(12, midY - 8) });
      setDashPos({ x: Math.min(88, midX + 14), y: Math.min(78, midY + 8) });

      // Multi-turn dialogue argument skit
      let lineIndex = 0;
      const playNextLine = () => {
        if (lineIndex >= skit.lines.length) {
          setTimeout(() => {
            setAeroBubble(null);
            setDashBubble(null);
            setAeroAnim('');
            setDashAnim('');
            setAeroExpr('happy');
            setDashExpr('happy');
            setCollisionEffect(null);
            isBickering.current = false;
          }, 1400);
          return;
        }

        const line = skit.lines[lineIndex];
        setAeroExpr(line.aExpr);
        setDashExpr(line.dExpr);
        setAeroAnim(line.aAnim);
        setDashAnim(line.dAnim);

        if (line.who === 'aero') {
          setAeroBubble(line.text);
          setDashBubble(null);
        } else {
          setDashBubble(line.text);
          setAeroBubble(null);
        }

        lineIndex++;
        setTimeout(playNextLine, 2800);
      };

      playNextLine();
    }, 450);
  }, [aeroPos, dashPos]);

  // 5. AUTONOMOUS FLIGHT LOOP (Confined to active page)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches || !isRoam || minimized) return undefined;

    roamTimer.current = setInterval(() => {
      if (isBickering.current) return;

      // Aero glides smoothly within active page
      setAeroPos((prev) => {
        const next = getRandomWaypoint(prev, false);
        triggerSpotCommentary(next, false);
        return next;
      });

      // Dash darts within active page
      setTimeout(() => {
        if (isBickering.current) return;
        setDashPos((prev) => {
          const next = getRandomWaypoint(prev, true);
          triggerSpotCommentary(next, true);
          return next;
        });
      }, 750);

    }, 4400);

    // Random Collision Interval (every 13s on current page)
    collisionTimer.current = setInterval(() => {
      if (!isBickering.current && Math.random() > 0.2) {
        triggerCollision();
      }
    }, 13000);

    return () => {
      clearInterval(roamTimer.current);
      clearInterval(collisionTimer.current);
    };
  }, [isRoam, minimized, getRandomWaypoint, triggerSpotCommentary, triggerCollision]);

  // 6. POINTER DRAGGING & DIZZINESS ACCUMULATION
  const handlePointerDown = (mascot, e) => {
    if (isBickering.current) return;
    draggingRef.current = mascot;
    let dragDist = 0;
    let lastX = e.clientX;
    let lastY = e.clientY;
    let isDizzyTriggered = false;

    const handlePointerMove = (moveEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const xPct = Math.max(6, Math.min(90, ((moveEvent.clientX - rect.left) / rect.width) * 100));
      const yPct = Math.max(10, Math.min(80, ((moveEvent.clientY - rect.top) / rect.height) * 100));

      const dx = moveEvent.clientX - lastX;
      const dy = moveEvent.clientY - lastY;
      dragDist += Math.sqrt(dx * dx + dy * dy);
      lastX = moveEvent.clientX;
      lastY = moveEvent.clientY;

      if (draggingRef.current === 'aero') {
        setAeroPos({ x: xPct, y: yPct });
        if (dragDist > 320 && !isDizzyTriggered) {
          isDizzyTriggered = true;
          setAeroExpr('dizzy');
          setAeroAnim('m-wobble');
          setAeroBubble('*Whoa... spinning sensory overload! @_@*');
        }
      } else if (draggingRef.current === 'dash') {
        setDashPos({ x: xPct, y: yPct });
        if (dragDist > 320 && !isDizzyTriggered) {
          isDizzyTriggered = true;
          setDashExpr('dizzy');
          setDashAnim('m-wobble');
          setDashBubble('*Thrusters disoriented! Gyroscope spinning! @~@*');
        }
      }
    };

    const handlePointerUp = () => {
      const activeMascot = draggingRef.current;
      draggingRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      if (isDizzyTriggered) {
        setTimeout(() => {
          if (activeMascot === 'aero') {
            setAeroBubble('*Gyroscopes calibrated! Systems nominal. ✨*');
            setAeroExpr('analyzing');
            setTimeout(() => {
              setAeroBubble(null);
              setAeroExpr('happy');
              setAeroAnim('');
            }, 2000);
          } else {
            setDashBubble('*Rebooting flight stabilization... ⚡*');
            setDashExpr('scanning');
            setTimeout(() => {
              setDashBubble(null);
              setDashExpr('happy');
              setDashAnim('');
            }, 2000);
          }
        }, 1800);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Direct Reader Clicks / Hits
  const handleAeroClick = () => {
    if (isBickering.current) return;
    const hitExpressions = ['hit', 'surprised', 'confused', 'analyzing'];
    const randomHit = hitExpressions[Math.floor(Math.random() * hitExpressions.length)];
    setAeroAnim('m-jump-back');
    setAeroExpr(randomHit);
    setAeroBubble(randomHit === 'hit' ? '*Ouch! Kinetic impact detected! 🤖*' : `*Scanning ${activePage === 'page1' ? 'Page 1 Hero' : 'Page 2 Command Center'}! ✨*`);
    setTimeout(() => {
      setAeroAnim('');
      setAeroBubble(null);
      setAeroExpr('happy');
    }, 2200);
  };

  const handleDashClick = () => {
    if (isBickering.current) return;
    const hitExpressions = ['hit', 'alert', 'confused', 'executing'];
    const randomHit = hitExpressions[Math.floor(Math.random() * hitExpressions.length)];
    setDashAnim('m-bounce');
    setDashExpr(randomHit);
    setDashBubble(randomHit === 'hit' ? '*Whoa! Direct hit to thrusters! ⚡💥*' : `*Thrusters locked on ${activePage === 'page1' ? 'Page 1' : 'Page 2'}! 🚀*`);
    setTimeout(() => {
      setDashAnim('');
      setDashBubble(null);
      setDashExpr('happy');
    }, 2200);
  };

  if (minimized) {
    return (
      <div className="mascots-minimized-launcher" onClick={() => setMinimized(false)} title="Restore Aero & Dash mascots">
        <div className="mini-icon">🤖⚡</div>
        <span className="mini-label">Mascots ({activePage === 'page1' ? 'P1' : 'P2'})</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mascots-roam-universe" aria-label={`Aero and Dash interactive mascots on ${activePage}`}>
      {/* Collision Impact Spark Burst */}
      {collisionEffect && (
        <div
          className="collision-spark-burst"
          style={{ left: `${collisionEffect.x}%`, top: `${collisionEffect.y}%` }}
        >
          <div className="spark-ring"></div>
          <div className="spark-text">{collisionEffect.text}</div>
        </div>
      )}

      {/* ================= AERO RIG ================= */}
      <div
        className={`roam-mascot-pod pod-aero ${aeroAnim} ${isRoam ? 'free-roam-active' : 'docked-mode'}`}
        style={{
          left: isRoam ? `${aeroPos.x}%` : 'auto',
          top: isRoam ? `${aeroPos.y}%` : 'auto',
          right: isRoam ? 'auto' : '110px',
          bottom: isRoam ? 'auto' : '24px',
        }}
        onPointerDown={(e) => handlePointerDown('aero', e)}
        onClick={handleAeroClick}
        role="button"
        tabIndex={0}
        aria-label="Aero AI Assistant mascot"
        title="Aero · AI Assistant (Drag anywhere on this page or click to interact)"
      >
        <AeroMascot
          expression={aeroExpr}
          size={105}
          bubble={aeroBubble}
          eyeOffset={eyeOffsetAero}
          isFloating={!isBickering.current}
        />
      </div>

      {/* ================= DASH RIG ================= */}
      <div
        className={`roam-mascot-pod pod-dash ${dashAnim} ${isRoam ? 'free-roam-active' : 'docked-mode'}`}
        style={{
          left: isRoam ? `${dashPos.x}%` : 'auto',
          top: isRoam ? `${dashPos.y}%` : 'auto',
          right: isRoam ? 'auto' : '24px',
          bottom: isRoam ? 'auto' : '24px',
        }}
        onPointerDown={(e) => handlePointerDown('dash', e)}
        onClick={handleDashClick}
        role="button"
        tabIndex={0}
        aria-label="Dash System Drone mascot"
        title="Dash · System Drone (Drag anywhere on this page or click to interact)"
      >
        <DashMascot
          expression={dashExpr}
          size={100}
          bubble={dashBubble}
          eyeOffset={eyeOffsetDash}
          isFloating={!isBickering.current}
        />
      </div>

      {/* ================= CYBER FLIGHT CONTROLLER BAR ================= */}
      {showController && (
        <div className="mascot-flight-controller" role="toolbar" aria-label="Mascot flight controls">
          <div className="page-badge-indicator" title="Current active page boundary">
            <span className="dot"></span>
            <span>{activePage === 'page1' ? 'PAGE 1 HERO' : 'PAGE 2 COMMAND'}</span>
          </div>

          <button
            className={`ctrl-btn ${isRoam ? 'active' : ''}`}
            onClick={() => setIsRoam(!isRoam)}
            title={isRoam ? "Dock mascots to corner" : "Enable active-page free flight"}
          >
            <span>{isRoam ? '🚀 Roam: ON' : '⚓ Docked'}</span>
          </button>

          <button
            className="ctrl-btn mischief-trigger-btn"
            onClick={() => triggerCollision(true)}
            title="Force Aero & Dash to collide on the current page and start an argument!"
          >
            <span>⚡ Bicker / Play!</span>
          </button>

          <button
            className="ctrl-btn-close"
            onClick={() => setMinimized(true)}
            title="Minimize mascots"
            aria-label="Minimize mascots"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
