import { useEffect, useRef, useState, useCallback } from 'react';
import AeroMascot from './mascots/AeroMascot.jsx';
import DashMascot from './mascots/DashMascot.jsx';

/**
 * PAGE-BOUND ACTIVE MASCOTS SYSTEM & CONVERSATION DIALOGUES — AERO & DASH
 * - Active speech conversation bubbles pop up on mascots with interactive greetings & role introductions.
 * - Visitors can click quick-reply action chips inside speech bubbles to interact.
 * - Clicking Aero or Dash triggers interactive companion dialogues.
 * - Mascots orbit the visual cosmic arena (Holographic globe & telemetry) without overlapping hero typography.
 * - Autonomous zero-g flight and real-time cursor tracking.
 */

const PAGE_ZONES = {
  page1: [
    { x: 38, y: 48, label: 'Globe Left Equator' },
    { x: 68, y: 48, label: 'Globe Right Equator' },
    { x: 40, y: 26, label: 'Globe North-West Sky' },
    { x: 66, y: 26, label: 'Globe North-East Sky' },
    { x: 38, y: 64, label: 'Globe South-West Sky' },
    { x: 68, y: 64, label: 'Globe South-East Sky' },
  ],
  page2: [
    { x: 22, y: 30, label: 'Active Build' },
    { x: 50, y: 22, label: 'System Core' },
    { x: 78, y: 36, label: 'Project Constellation' },
    { x: 48, y: 66, label: 'Command Telemetry' },
    { x: 18, y: 58, label: 'Ecosystem Controls' },
    { x: 84, y: 65, label: 'Performance Metrics' },
  ],
};

export const HERO_GREETINGS = {
  page1: [
    {
      who: 'dash',
      text: "⚡ Greetings! Welcome to **Hafiz Ali Abdullah's** station! I'm **Dash** — lead system drone & Flutter specialist!",
      expr: 'excited',
      anim: 'm-bounce',
      delay: 600,
      duration: 5000,
      chips: [
        { label: '📱 Shipped Apps', action: 'apps' },
        { label: '🚀 What do you build?', action: 'build' },
      ],
    },
    {
      who: 'aero',
      text: "🤖 And I'm **Aero** — your AI architecture & systems guide! We build high-speed apps, scalable SaaS & real-time telemetry.",
      expr: 'happy',
      anim: 'm-dance',
      delay: 6000,
      duration: 5000,
      chips: [
        { label: '💡 Who is Abdullah?', action: 'who' },
        { label: '📊 System Architecture', action: 'stack' },
      ],
    },
    {
      who: 'dash',
      text: "✨ Feel free to explore our 3D globe & command center, click either of us to chat, or drag us around in zero-g!",
      expr: 'winking',
      anim: 'm-spin',
      delay: 11400,
      duration: 5200,
      chips: [
        { label: '🎯 Command Center', action: 'command_center' },
        { label: '⚡ Do a Flip!', action: 'flip' },
      ],
    },
  ],
  page2: [
    {
      who: 'aero',
      text: "🌐 Welcome to the **Command Center**! System telemetry online and all microservices operational.",
      expr: 'analyzing',
      anim: 'm-dance',
      delay: 500,
      duration: 4500,
      chips: [
        { label: '📊 System Metrics', action: 'metrics' },
        { label: '🔍 Inspect Builds', action: 'apps' },
      ],
    },
    {
      who: 'dash',
      text: "⚡ Tap any active build card below to inspect live Flutter code, architectural diagrams & metrics!",
      expr: 'winking',
      anim: 'm-spin',
      delay: 5300,
      duration: 4800,
      chips: [
        { label: '📱 WOS Flagship', action: 'wos' },
        { label: '⚡ Zero-G Flip!', action: 'flip' },
      ],
    },
    {
      who: 'aero',
      text: "Distributed architecture & live SaaS ecosystems ready for deep-dive inspection! ✅",
      expr: 'happy',
      anim: '',
      delay: 10400,
      duration: 4200,
      chips: [
        { label: '💡 Tech Stack', action: 'stack' },
        { label: '📬 Contact', action: 'contact' },
      ],
    },
  ],
};

export default function Mascots({ stage = 'page1', showController = true, active = true }) {
  const containerRef = useRef(null);
  const [isRoam, setIsRoam] = useState(true);
  const activePage = stage;

  // Stationed in right visual stage framing globe & telemetry (away from left hero typography)
  const defaultAero = stage === 'page1' ? { x: 38, y: 48 } : { x: 22, y: 28 };
  const defaultDash = stage === 'page1' ? { x: 68, y: 48 } : { x: 78, y: 42 };

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

  // Speech conversation bubbles: { text, chips, isBottom, onChipClick, onClose }
  const [aeroBubble, setAeroBubble] = useState(null);
  const [dashBubble, setDashBubble] = useState(null);

  const isGreetingRef = useRef(false);
  const greetingTimersRef = useRef([]);
  const customTimerRef = useRef(null);
  const roamTimer = useRef(null);
  const draggingRef = useRef(null);
  const mousePosRef = useRef({ x: 500, y: 300 });

  const clearAllSpeechTimers = () => {
    greetingTimersRef.current.forEach((t) => clearTimeout(t));
    greetingTimersRef.current = [];
    if (customTimerRef.current) {
      clearTimeout(customTimerRef.current);
      customTimerRef.current = null;
    }
  };

  // 1. ACTION CHIP CLICK HANDLER
  const handleChipAction = useCallback((action, speaker = 'aero') => {
    clearAllSpeechTimers();
    isGreetingRef.current = false;

    if (action === 'who') {
      setAeroAnim('m-jump-back');
      setAeroExpr('excited');
      setAeroBubble({
        text: "**Hafiz Ali Abdullah** is a Full-Stack Software Engineer specializing in production Flutter apps, distributed SaaS architecture, and high-performance cloud backends! 👨‍💻🚀",
        chips: [
          { label: '📱 Shipped Apps', action: 'apps' },
          { label: '📬 Contact Abdullah', action: 'contact' },
        ],
        onChipClick: (chip) => handleChipAction(chip.action, 'aero'),
        onClose: () => setAeroBubble(null),
      });
      setDashBubble(null);
      customTimerRef.current = setTimeout(() => {
        setAeroBubble(null);
        setAeroAnim('');
      }, 7000);
    } else if (action === 'build') {
      setDashAnim('m-bounce');
      setDashExpr('excited');
      setDashBubble({
        text: "We build enterprise POS platforms, multi-tenant SaaS, cross-platform mobile apps, and real-time telemetry systems with 60 FPS polish! ⚡📱",
        chips: [
          { label: '📱 Shipped Apps', action: 'apps' },
          { label: '🎯 Command Center', action: 'command_center' },
        ],
        onChipClick: (chip) => handleChipAction(chip.action, 'dash'),
        onClose: () => setDashBubble(null),
      });
      setAeroBubble(null);
      customTimerRef.current = setTimeout(() => {
        setDashBubble(null);
        setDashAnim('');
      }, 7000);
    } else if (action === 'apps') {
      setDashAnim('m-bounce');
      setDashExpr('happy');
      setDashBubble({
        text: "Over **5+ production apps** shipped on App Store & Google Play — WOS POS, ReadMate, Dietify, Noor-ul-Quran & more! 📱✨",
        chips: [
          { label: '🎯 Go to Command Center', action: 'command_center' },
          { label: '⚡ Do a Flip!', action: 'flip' },
        ],
        onChipClick: (chip) => handleChipAction(chip.action, 'dash'),
        onClose: () => setDashBubble(null),
      });
      setAeroBubble(null);
      customTimerRef.current = setTimeout(() => {
        setDashBubble(null);
        setDashAnim('');
      }, 7000);
    } else if (action === 'flip') {
      setDashAnim('m-spin');
      setDashExpr('winking');
      setDashBubble({
        text: "*WHOOSH!* 🔄 Plasma thrusters at 100%! Zero-g acrobatic maneuver complete!",
        chips: [
          { label: '💡 Who is Abdullah?', action: 'who' },
          { label: '🎯 Command Center', action: 'command_center' },
        ],
        onChipClick: (chip) => handleChipAction(chip.action, 'dash'),
        onClose: () => setDashBubble(null),
      });
      setAeroBubble(null);
      customTimerRef.current = setTimeout(() => {
        setDashBubble(null);
        setDashAnim('');
      }, 6000);
    } else if (action === 'command_center') {
      setAeroAnim('m-jump-back');
      setAeroExpr('happy');
      setAeroBubble({
        text: "Engaging warp drive to **Command Center**! Inspecting live telemetry & builds! 🌐🚀",
        chips: [
          { label: '📊 System Metrics', action: 'metrics' },
          { label: '⚡ Do a Flip!', action: 'flip' },
        ],
        onChipClick: (chip) => handleChipAction(chip.action, 'aero'),
        onClose: () => setAeroBubble(null),
      });
      setDashBubble(null);
      const target = document.getElementById('command-center');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      customTimerRef.current = setTimeout(() => {
        setAeroBubble(null);
        setAeroAnim('');
      }, 6000);
    } else if (action === 'hello') {
      setAeroAnim('m-dance');
      setAeroExpr('happy');
      setAeroBubble({
        text: "Hello there! 👋 Glad to have you on board! Click or drag either of us anytime while you explore.",
        chips: [
          { label: '💡 Who is Abdullah?', action: 'who' },
          { label: '📱 Shipped Apps', action: 'apps' },
        ],
        onChipClick: (chip) => handleChipAction(chip.action, 'aero'),
        onClose: () => setAeroBubble(null),
      });
      setDashBubble(null);
      customTimerRef.current = setTimeout(() => {
        setAeroBubble(null);
        setAeroAnim('');
      }, 6000);
    } else if (action === 'stack') {
      setAeroAnim('m-jump-back');
      setAeroExpr('analyzing');
      setAeroBubble({
        text: "Stack: **Flutter & Dart** (Mobile/POS), **React & TypeScript** (Web/SaaS), **Node.js & Python** (APIs), **PostgreSQL & Redis** (Data)! 🛠️",
        chips: [
          { label: '📱 Shipped Apps', action: 'apps' },
          { label: '📬 Let\'s Connect', action: 'contact' },
        ],
        onChipClick: (chip) => handleChipAction(chip.action, 'aero'),
        onClose: () => setAeroBubble(null),
      });
      setDashBubble(null);
      customTimerRef.current = setTimeout(() => {
        setAeroBubble(null);
        setAeroAnim('');
      }, 7000);
    } else if (action === 'metrics') {
      setAeroAnim('m-dance');
      setAeroExpr('happy');
      setAeroBubble({
        text: "Telemetry: **99.98% Uptime**, **42ms latency**, **08 active cluster nodes**, and **100% test coverage**! 📊✅",
        chips: [
          { label: '📱 Shipped Apps', action: 'apps' },
          { label: '⚡ Ask Dash', action: 'flip' },
        ],
        onChipClick: (chip) => handleChipAction(chip.action, 'aero'),
        onClose: () => setAeroBubble(null),
      });
      setDashBubble(null);
      customTimerRef.current = setTimeout(() => {
        setAeroBubble(null);
        setAeroAnim('');
      }, 7000);
    } else if (action === 'wos') {
      setDashAnim('m-bounce');
      setDashExpr('excited');
      setDashBubble({
        text: "**WOS (Waiter Order System)** is our flagship multi-platform restaurant suite with EPOS desktop, mobile waiter terminal & customer ordering! 🍔📱",
        chips: [
          { label: '🎯 Go to Command Center', action: 'command_center' },
          { label: '⚡ Do a Flip!', action: 'flip' },
        ],
        onChipClick: (chip) => handleChipAction(chip.action, 'dash'),
        onClose: () => setDashBubble(null),
      });
      setAeroBubble(null);
      customTimerRef.current = setTimeout(() => {
        setDashBubble(null);
        setDashAnim('');
      }, 7000);
    } else if (action === 'contact') {
      setAeroAnim('m-dance');
      setAeroExpr('happy');
      setAeroBubble({
        text: "Abdullah is always open to discussing ambitious products, mobile apps, and engineering leadership! 🤝✉️",
        chips: [
          { label: '💡 Who is Abdullah?', action: 'who' },
          { label: '🎯 Command Center', action: 'command_center' },
        ],
        onChipClick: (chip) => handleChipAction(chip.action, 'aero'),
        onClose: () => setAeroBubble(null),
      });
      setDashBubble(null);
      const footer = document.querySelector('.site-footer');
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
      }
      customTimerRef.current = setTimeout(() => {
        setAeroBubble(null);
        setAeroAnim('');
      }, 6000);
    }
  }, []);

  // 2. INITIAL GREETINGS & INTRODUCTIONS CONVERSATION ON REVEAL
  useEffect(() => {
    if (!active) return undefined;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return undefined;

    isGreetingRef.current = true;
    clearAllSpeechTimers();

    const script = HERO_GREETINGS[activePage] || HERO_GREETINGS.page1;

    script.forEach((step) => {
      const showTimer = setTimeout(() => {
        const payload = {
          text: step.text,
          chips: step.chips,
          onChipClick: (chip) => handleChipAction(chip.action, step.who),
          onClose: () => {
            if (step.who === 'aero') setAeroBubble(null);
            else setDashBubble(null);
          },
        };

        if (step.who === 'aero') {
          setAeroBubble(payload);
          setAeroExpr(step.expr || 'happy');
          if (step.anim) {
            setAeroAnim(step.anim);
            setTimeout(() => setAeroAnim(''), 1200);
          }
          setDashBubble(null);
        } else {
          setDashBubble(payload);
          setDashExpr(step.expr || 'winking');
          if (step.anim) {
            setDashAnim(step.anim);
            setTimeout(() => setDashAnim(''), 1200);
          }
          setAeroBubble(null);
        }

        const hideTimer = setTimeout(() => {
          if (step.who === 'aero') setAeroBubble(null);
          else setDashBubble(null);
        }, step.duration);
        greetingTimersRef.current.push(hideTimer);
      }, step.delay);

      greetingTimersRef.current.push(showTimer);
    });

    const lastStep = script[script.length - 1];
    const totalTime = lastStep.delay + lastStep.duration + 500;
    const finishTimer = setTimeout(() => {
      isGreetingRef.current = false;
      setAeroBubble(null);
      setDashBubble(null);
      setAeroExpr('happy');
      setDashExpr('happy');
    }, totalTime);
    greetingTimersRef.current.push(finishTimer);

    return () => {
      clearAllSpeechTimers();
    };
  }, [active, activePage, handleChipAction]);

  // 3. REAL-TIME CURSOR EYE-TRACKING
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      const aeroPixelX = (aeroPos.x / 100) * rect.width;
      const aeroPixelY = (aeroPos.y / 100) * rect.height;
      const dashPixelX = (dashPos.x / 100) * rect.width;
      const dashPixelY = (dashPos.y / 100) * rect.height;

      const aeroAngle = Math.atan2((e.clientY - rect.top) - aeroPixelY, (e.clientX - rect.left) - aeroPixelX);
      const dashAngle = Math.atan2((e.clientY - rect.top) - dashPixelY, (e.clientX - rect.left) - dashPixelX);

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

  // 4. GENERATE WAYPOINTS CONFINED TO ACTIVE PAGE (VISUAL STAGE ZONES)
  const getRandomWaypoint = useCallback(() => {
    const currentZones = PAGE_ZONES[activePage] || PAGE_ZONES.page1;
    const targetZone = currentZones[Math.floor(Math.random() * currentZones.length)];
    const jitterX = Math.random() * 6 - 3;
    const jitterY = Math.random() * 6 - 3;

    return {
      x: Math.max(stage === 'page1' ? 36 : 12, Math.min(stage === 'page1' ? 70 : 88, targetZone.x + jitterX)),
      y: Math.max(stage === 'page1' ? 22 : 12, Math.min(stage === 'page1' ? 70 : 78, targetZone.y + jitterY)),
    };
  }, [activePage, stage]);

  // 5. CALM AUTONOMOUS FLIGHT LOOP
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches || !isRoam) return undefined;

    roamTimer.current = setInterval(() => {
      if (isGreetingRef.current) return;
      setAeroPos((prev) => getRandomWaypoint());

      setTimeout(() => {
        if (isGreetingRef.current) return;
        setDashPos((prev) => getRandomWaypoint());
      }, 1500);
    }, 7000);

    return () => {
      clearInterval(roamTimer.current);
    };
  }, [isRoam, getRandomWaypoint]);

  // 6. POINTER DRAGGING PHYSICS
  const handlePointerDown = (mascot, e) => {
    draggingRef.current = mascot;
    let dragDist = 0;
    let lastX = e.clientX;
    let lastY = e.clientY;
    let isDizzyTriggered = false;

    const handlePointerMove = (moveEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const xPct = Math.max(4, Math.min(92, ((moveEvent.clientX - rect.left) / rect.width) * 100));
      const yPct = Math.max(8, Math.min(82, ((moveEvent.clientY - rect.top) / rect.height) * 100));

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
          setAeroBubble({
            text: "*Whoa... sensory sensors overload! @_@*",
            onClose: () => setAeroBubble(null),
          });
        }
      } else if (draggingRef.current === 'dash') {
        setDashPos({ x: xPct, y: yPct });
        if (dragDist > 320 && !isDizzyTriggered) {
          isDizzyTriggered = true;
          setDashExpr('dizzy');
          setDashAnim('m-wobble');
          setDashBubble({
            text: "*Thrusters disoriented! Plasma spin! @~@*",
            onClose: () => setDashBubble(null),
          });
        }
      }
    };

    const handlePointerUp = () => {
      draggingRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      if (isDizzyTriggered) {
        setTimeout(() => {
          setAeroExpr('happy');
          setDashExpr('happy');
          setAeroAnim('');
          setDashAnim('');
          setAeroBubble(null);
          setDashBubble(null);
        }, 2200);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // 7. DIRECT MASCOT CLICKS -> POPS RICH INTERACTIVE SPEECH BUBBLE
  const handleAeroClick = (e) => {
    e?.stopPropagation?.();
    clearAllSpeechTimers();
    isGreetingRef.current = false;

    const aeroResponses = [
      {
        text: "I'm **Aero**! I analyze architecture, optimize pipelines & maintain 99.8% code coverage! 🤖✨",
        chips: [
          { label: '💡 Who is Abdullah?', action: 'who' },
          { label: '📊 System Metrics', action: 'metrics' },
        ],
      },
      {
        text: "System telemetry nominal! Clean hexagonal domain architecture & zero regressions detected. 📊✅",
        chips: [
          { label: '🎯 Command Center', action: 'command_center' },
          { label: '📱 Shipped Apps', action: 'apps' },
        ],
      },
      {
        text: "Abdullah builds production systems with **Flutter**, **React**, **TypeScript**, **Node.js** & **Python**! 🛠️✨",
        chips: [
          { label: '📱 Shipped Apps', action: 'apps' },
          { label: '📬 Let\'s Connect', action: 'contact' },
        ],
      },
      {
        text: "*BEEP BOOP!* Microservices online and running at 100% efficiency. Drag me anywhere to reposition our sensor array! 🌐🛰️",
        chips: [
          { label: '⚡ Ask Dash', action: 'flip' },
          { label: '💬 Say Hello', action: 'hello' },
        ],
      },
    ];

    const pick = aeroResponses[Math.floor(Math.random() * aeroResponses.length)];
    setAeroAnim('m-jump-back');
    setAeroExpr('happy');
    setAeroBubble({
      text: pick.text,
      chips: pick.chips,
      onChipClick: (chip) => handleChipAction(chip.action, 'aero'),
      onClose: () => setAeroBubble(null),
    });
    setDashBubble(null);
    customTimerRef.current = setTimeout(() => {
      setAeroAnim('');
      setAeroBubble(null);
    }, 6500);
  };

  const handleDashClick = (e) => {
    e?.stopPropagation?.();
    clearAllSpeechTimers();
    isGreetingRef.current = false;

    const dashResponses = [
      {
        text: "I'm **Dash**! I build high-speed Flutter UI, real-time widgets & deploy live apps! ⚡🚀",
        chips: [
          { label: '📱 Shipped Apps', action: 'apps' },
          { label: '⚡ Do a Flip!', action: 'flip' },
        ],
      },
      {
        text: "**5+ live apps** shipped on App Store & Google Play with smooth 60 FPS performance! 📱✨",
        chips: [
          { label: '🎯 Command Center', action: 'command_center' },
          { label: '⚡ Zero-G Flip!', action: 'flip' },
        ],
      },
      {
        text: "*ZOOM!* Plasma thrusters calibrated for max velocity! Ready to launch your next product! 🚀💨",
        chips: [
          { label: '⚡ Do a Flip!', action: 'flip' },
          { label: '💡 Who is Abdullah?', action: 'who' },
        ],
      },
      {
        text: "Did you know? Our POS order terminals handle live restaurant queues with zero latency! ⚡🍔",
        chips: [
          { label: '📱 WOS Flagship', action: 'wos' },
          { label: '🤖 Ask Aero', action: 'who' },
        ],
      },
    ];

    const pick = dashResponses[Math.floor(Math.random() * dashResponses.length)];
    setDashAnim('m-bounce');
    setDashExpr('excited');
    setDashBubble({
      text: pick.text,
      chips: pick.chips,
      onChipClick: (chip) => handleChipAction(chip.action, 'dash'),
      onClose: () => setDashBubble(null),
    });
    setAeroBubble(null);
    customTimerRef.current = setTimeout(() => {
      setDashAnim('');
      setDashBubble(null);
    }, 6500);
  };

  // Orientation: flip bubble below mascot if mascot is near top (y < 28%)
  const isAeroBottom = aeroPos.y < 28;
  const isDashBottom = dashPos.y < 28;

  const aeroBubblePayload = aeroBubble
    ? {
        ...aeroBubble,
        isBottom: isAeroBottom,
      }
    : null;

  const dashBubblePayload = dashBubble
    ? {
        ...dashBubble,
        isBottom: isDashBottom,
      }
    : null;

  return (
    <div ref={containerRef} className="mascots-roam-universe" aria-label={`Aero and Dash interactive companions on ${activePage}`}>
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
        title="Aero · AI Assistant (Click to talk or drag anywhere)"
      >
        <AeroMascot
          expression={aeroExpr}
          size={110}
          bubble={aeroBubblePayload}
          eyeOffset={eyeOffsetAero}
          isFloating={true}
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
        title="Dash · System Drone (Click to talk or drag anywhere)"
      >
        <DashMascot
          expression={dashExpr}
          size={105}
          bubble={dashBubblePayload}
          eyeOffset={eyeOffsetDash}
          isFloating={true}
        />
      </div>
    </div>
  );
}
