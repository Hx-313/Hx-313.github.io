import { useEffect, useRef, useState, useCallback } from 'react';
import AeroMascot from './mascots/AeroMascot.jsx';
import DashMascot from './mascots/DashMascot.jsx';

/**
 * FREE-ROAMING AUTONOMOUS MASCOTS SYSTEM — AERO & DASH
 * - Full page / viewport free-flight navigation across all spots.
 * - Contextual commentary triggered by spot / section coordinates.
 * - Random collision detection triggering hilarious arguments, bickering, recoils & games.
 * - Interactive dragging, clicking, and mode toggle (Free Roam 🚀 vs Docked ⚓).
 * - Full accessibility and prefers-reduced-motion fallback.
 */

const SPOT_COMMENTARY = {
  top: [
    { who: 'aero', text: "Top-level viewport scanned. Navigation matrix nominal. 🌐", expr: 'analyzing' },
    { who: 'dash', text: "High altitude! I can see all the production systems from up here! ⚡", expr: 'excited' },
    { who: 'aero', text: "Systems online: Product Engineer ready to deploy. 🚀", expr: 'happy' },
    { who: 'dash', text: "Full throttle! Let's check out the rest of the site! 💨", expr: 'winking' },
  ],
  principles: [
    { who: 'dash', text: "Principle check: 100% weekly live demos & zero ghosting! 📡", expr: 'focused' },
    { who: 'aero', text: "Engineering discipline verified. Fixed scope, clean code. ✅", expr: 'thinking' },
    { who: 'dash', text: "You own every single line of code! That's how we roll! 💙", expr: 'happy' },
  ],
  services: [
    { who: 'aero', text: "Architecting MVPs, cross-platform apps & distributed SaaS. 🤖", expr: 'analyzing' },
    { who: 'dash', text: "Single Flutter codebase for iOS and Android = Half the cost! 📱", expr: 'excited' },
    { who: 'aero', text: "60 FPS rendering pipeline verified on both app stores. ✨", expr: 'happy' },
  ],
  work: [
    { who: 'dash', text: "Live app telemetry: onlineorder.pk, POS, Dispatch & Courier! 🍔", expr: 'executing' },
    { who: 'aero', text: "Real-time websocket sync & fault-tolerant offline storage. 🌐", expr: 'thinking' },
    { who: 'dash', text: "Every app here is published and battle-tested! Tap one! 📱", expr: 'winking' },
  ],
  bottom: [
    { who: 'aero', text: "Strategy consultation station reached. No jargon, just results.", expr: 'happy' },
    { who: 'dash', text: "Let's build something epic! Book a call with Abdullah! 🚀", expr: 'excited' },
  ],
};

const ARGUMENT_SKITS = [
  {
    title: "Airspace Violation",
    sound: "*CRASH! BOOP!*",
    lines: [
      { who: 'dash', text: "Whoa! Watch the airspace, Aero! I'm flying here! ⚡💨", aExpr: 'surprised', dExpr: 'alert', aAnim: 'm-wobble', dAnim: 'm-jump-back' },
      { who: 'aero', text: "(>_<) Dash! You were doing 200 knots in a no-fly zone!", aExpr: 'confused', dExpr: 'winking', aAnim: 'm-poke-right', dAnim: 'm-wobble' },
      { who: 'dash', text: "Continuous deployment waits for no one! Speed is a feature! 🚀", aExpr: 'thinking', dExpr: 'excited', aAnim: '', dAnim: 'm-spin' },
      { who: 'aero', text: "Stability is king! Next time, check your radar telemetry! 🤖", aExpr: 'happy', dExpr: 'happy', aAnim: 'm-dance', dAnim: '' },
    ]
  },
  {
    title: "Hot Reload Madness",
    sound: "*CLANG! BZZT!*",
    lines: [
      { who: 'aero', text: "Dash, did you just trigger 42 hot reloads in 3 seconds?! (o_O)", aExpr: 'confused', dExpr: 'excited', aAnim: 'm-wobble', dAnim: 'm-flap' },
      { who: 'dash', text: "Every keystroke deserves immediate visual feedback! It feels faster! ✨", aExpr: 'analyzing', dExpr: 'winking', aAnim: '', dAnim: 'm-dance' },
      { who: 'aero', text: "You almost melted the compiler cache, you speed demon!", aExpr: 'surprised', dExpr: 'executing', aAnim: 'm-poke-right', dAnim: 'm-bounce' },
      { who: 'dash', text: "Zero compile lag, 100% adrenaline! That's Flutter power! ⚡", aExpr: 'happy', dExpr: 'happy', aAnim: '', dAnim: 'm-spin' },
    ]
  },
  {
    title: "Code Review Showdown",
    sound: "*BUMP! SPARK!*",
    lines: [
      { who: 'dash', text: "Hey! Why did you comment on my pull request with 'needs more tests'?! 😤", aExpr: 'thinking', dExpr: 'focused', aAnim: 'm-jump-back', dAnim: 'm-poke-left' },
      { who: 'aero', text: "Because 99.8% test coverage is the minimum standard, little drone. 🤖", aExpr: 'happy', dExpr: 'confused', aAnim: 'm-dance', dAnim: 'm-wobble' },
      { who: 'dash', text: "My tests passed in production in my head! 🐦⚡", aExpr: 'surprised', dExpr: 'excited', aAnim: '', dAnim: 'm-flap' },
      { who: 'aero', text: "That is NOT how CI/CD pipelines work, Dash! Refactoring now... ✨", aExpr: 'analyzing', dExpr: 'happy', aAnim: '', dAnim: '' },
    ]
  },
  {
    title: "Tag & Chase Game",
    sound: "*TAG! BOOP!*",
    lines: [
      { who: 'dash', text: "*boops Aero's halo* Tag! You're it, slow-orb! Catch me if you can! 👉🐦", aExpr: 'surprised', dExpr: 'winking', aAnim: 'm-wobble', dAnim: 'm-spin' },
      { who: 'aero', text: "Activating dual ion thruster override! Initiating pursuit! 🛸💨", aExpr: 'excited', dExpr: 'excited', aAnim: 'm-bounce', dAnim: 'm-jump-back' },
      { who: 'dash', text: "Thrusters at maximum! Doing a 360 loop around the viewport! 🌀", aExpr: 'analyzing', dExpr: 'executing', aAnim: 'm-dance', dAnim: 'm-flap' },
      { who: 'aero', text: "Target locked! Gotcha! Telemetry calibrated. 🤖✨", aExpr: 'happy', dExpr: 'happy', aAnim: 'm-poke-right', dAnim: 'm-wobble' },
    ]
  },
  {
    title: "Architecture Debate",
    sound: "*SMACK! CRACKLE!*",
    lines: [
      { who: 'dash', text: "Microservices! 500 serverless functions for a todo list! ⚡", aExpr: 'confused', dExpr: 'excited', aAnim: 'm-wobble', dAnim: 'm-bounce' },
      { who: 'aero', text: "Modular monolith with clean domain boundaries & fast deploys! 🤖", aExpr: 'thinking', dExpr: 'focused', aAnim: 'm-dance', dAnim: '' },
      { who: 'dash', text: "Okay okay, but we agree Flutter + Dart is the best mobile framework? 💙", aExpr: 'happy', dExpr: 'winking', aAnim: '', dAnim: 'm-flap' },
      { who: 'aero', text: "Unanimous consensus. Ship the build! 🚀", aExpr: 'happy', dExpr: 'happy', aAnim: 'm-spin', dAnim: 'm-spin' },
    ]
  }
];

export default function Mascots() {
  // Free roam state
  const [isRoam, setIsRoam] = useState(true);
  const [minimized, setMinimized] = useState(false);

  // Positions (in % of viewport for responsive roaming)
  const [aeroPos, setAeroPos] = useState({ x: 75, y: 35 });
  const [dashPos, setDashPos] = useState({ x: 82, y: 55 });

  // Current Animations & Expressions
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

  // Dragging states
  const draggingRef = useRef(null); // 'aero' | 'dash' | null

  // Generate random target waypoint across whole viewport
  const getRandomWaypoint = useCallback((current, isDash = false) => {
    // Keep within safe screen boundaries
    const minX = 8, maxX = 84;
    const minY = 10, maxY = 82;

    let newX = minX + Math.random() * (maxX - minX);
    let newY = minY + Math.random() * (maxY - minY);

    // Give Dash faster, larger jumps; Aero gentler floats
    if (!isDash) {
      newX = Math.max(minX, Math.min(maxX, current.x + (Math.random() * 30 - 15)));
      newY = Math.max(minY, Math.min(maxY, current.y + (Math.random() * 30 - 15)));
    }

    return { x: newX, y: newY };
  }, []);

  // Spot commentary evaluator based on mascot altitude/zone
  const triggerSpotCommentary = useCallback((pos, isDash) => {
    if (isBickering.current || Math.random() > 0.45) return;

    let zone = 'services';
    if (pos.y < 25) zone = 'top';
    else if (pos.y < 45) zone = 'principles';
    else if (pos.y < 68) zone = 'work';
    else zone = 'bottom';

    const pool = SPOT_COMMENTARY[zone] || SPOT_COMMENTARY.services;
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
  }, []);

  // Trigger Collision & Argument Skit
  const triggerCollision = useCallback((forced = false) => {
    if (isBickering.current && !forced) return;
    isBickering.current = true;

    // 1. Intercept towards each other
    const midX = (aeroPos.x + dashPos.x) / 2 || 50;
    const midY = (aeroPos.y + dashPos.y) / 2 || 50;

    setAeroPos({ x: midX - 4, y: midY });
    setDashPos({ x: midX + 4, y: midY });

    // 2. Trigger collision impact sound & spark
    const skit = ARGUMENT_SKITS[Math.floor(Math.random() * ARGUMENT_SKITS.length)];
    
    setTimeout(() => {
      setCollisionEffect({ x: midX, y: midY, text: skit.sound });
      
      // Elastic Bounce apart
      setAeroPos({ x: Math.max(10, midX - 14), y: midY - 6 });
      setDashPos({ x: Math.min(85, midX + 14), y: midY + 6 });

      // Play multi-line argument skit
      let lineIndex = 0;
      const playNextLine = () => {
        if (lineIndex >= skit.lines.length) {
          // Finish argument skit
          setTimeout(() => {
            setAeroBubble(null);
            setDashBubble(null);
            setAeroAnim('');
            setDashAnim('');
            setAeroExpr('happy');
            setDashExpr('happy');
            setCollisionEffect(null);
            isBickering.current = false;
          }, 1500);
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

  // Main Autonomous Free-Roam Flight Loop
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches || !isRoam || minimized) return undefined;

    // Flight Step Interval (every 3.8s)
    roamTimer.current = setInterval(() => {
      if (isBickering.current) return;

      // Aero flies smoothly
      setAeroPos((prev) => {
        const next = getRandomWaypoint(prev, false);
        triggerSpotCommentary(next, false);
        return next;
      });

      // Dash darts quickly
      setTimeout(() => {
        if (isBickering.current) return;
        setDashPos((prev) => {
          const next = getRandomWaypoint(prev, true);
          triggerSpotCommentary(next, true);
          return next;
        });
      }, 700);

    }, 4200);

    // Random Collision Interval (every 14s)
    collisionTimer.current = setInterval(() => {
      if (!isBickering.current && Math.random() > 0.25) {
        triggerCollision();
      }
    }, 14000);

    return () => {
      clearInterval(roamTimer.current);
      clearInterval(collisionTimer.current);
    };
  }, [isRoam, minimized, getRandomWaypoint, triggerSpotCommentary, triggerCollision]);

  // Manual Drag Handling
  const handlePointerDown = (mascot, e) => {
    if (isBickering.current) return;
    draggingRef.current = mascot;

    const handlePointerMove = (moveEvent) => {
      const xPct = Math.max(5, Math.min(90, (moveEvent.clientX / window.innerWidth) * 100));
      const yPct = Math.max(8, Math.min(88, (moveEvent.clientY / window.innerHeight) * 100));

      if (draggingRef.current === 'aero') {
        setAeroPos({ x: xPct, y: yPct });
      } else if (draggingRef.current === 'dash') {
        setDashPos({ x: xPct, y: yPct });
      }
    };

    const handlePointerUp = () => {
      draggingRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Click Mascot Direct Reaction
  const handleAeroClick = () => {
    if (isBickering.current) return;
    setAeroAnim('m-spin');
    setAeroExpr('analyzing');
    setAeroBubble('*Halo spinning! Neural core running at 100% throughput! 🤖*');
    setTimeout(() => {
      setAeroAnim('');
      setAeroBubble(null);
      setAeroExpr('happy');
    }, 2000);
  };

  const handleDashClick = () => {
    if (isBickering.current) return;
    setDashAnim('m-bounce');
    setDashExpr('executing');
    setDashBubble('*Thrusters max power! Ready to ship production code! ⚡*');
    setTimeout(() => {
      setDashAnim('');
      setDashBubble(null);
      setDashExpr('happy');
    }, 2000);
  };

  if (minimized) {
    return (
      <div className="mascots-minimized-launcher" onClick={() => setMinimized(false)} title="Restore Aero & Dash mascots">
        <div className="mini-icon">🤖⚡</div>
        <span className="mini-label">Mascots</span>
      </div>
    );
  }

  return (
    <div className="mascots-roam-universe" aria-label="Aero and Dash interactive mascots">
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

      {/* ================= AERO FREE-FLIGHT RIG ================= */}
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
        title="Aero · AI Assistant (Drag anywhere or click to interact)"
      >
        <AeroMascot
          expression={aeroExpr}
          size={96}
          bubble={aeroBubble}
          isFloating={!isBickering.current}
        />
      </div>

      {/* ================= DASH FREE-FLIGHT RIG ================= */}
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
        title="Dash · System Drone (Drag anywhere or click to interact)"
      >
        <DashMascot
          expression={dashExpr}
          size={92}
          bubble={dashBubble}
          isFloating={!isBickering.current}
        />
      </div>

      {/* ================= CYBER FLIGHT CONTROLLER BAR ================= */}
      <div className="mascot-flight-controller" role="toolbar" aria-label="Mascot flight controls">
        <button
          className={`ctrl-btn ${isRoam ? 'active' : ''}`}
          onClick={() => setIsRoam(!isRoam)}
          title={isRoam ? "Dock mascots to corner" : "Enable full-page free flight"}
        >
          <span>{isRoam ? '🚀 Free-Fly: ON' : '⚓ Docked'}</span>
        </button>

        <button
          className="ctrl-btn mischief-trigger-btn"
          onClick={() => triggerCollision(true)}
          title="Force Aero & Dash to collide and start an argument!"
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
    </div>
  );
}
