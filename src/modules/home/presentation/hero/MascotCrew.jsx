import { useEffect, useState } from 'react';
import AeroMascot from '../../../../components/mascots/AeroMascot.jsx';
import DashMascot from '../../../../components/mascots/DashMascot.jsx';

export default function MascotCrew() {
  const [aeroBubble, setAeroBubble] = useState(null);
  const [dashBubble, setDashBubble] = useState(null);
  const [aeroAnim, setAeroAnim] = useState('');
  const [dashAnim, setDashAnim] = useState('');
  const [aeroExpr, setAeroExpr] = useState('happy');
  const [dashExpr, setDashExpr] = useState('happy');
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Cursor eye-tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = Math.max(-4, Math.min(4, ((e.clientX / window.innerWidth) - 0.5) * 8));
      const y = Math.max(-3, Math.min(3, ((e.clientY / window.innerHeight) - 0.5) * 6));
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Autonomous Mischief Bickering & System Skits Loop
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return undefined;

    const interval = setInterval(() => {
      // 1. Dash swoops over and nudges Aero
      setDashAnim('poke-dash-action');
      setDashExpr('winking');
      setDashBubble('*Hey Aero! Ready to deploy? ⚡*');

      setTimeout(() => {
        // 2. Aero gets startled & switches to analyzing/shock
        setDashAnim('');
        setDashBubble(null);
        setAeroAnim('aero-shock-action');
        setAeroExpr('surprised');
        setAeroBubble('*Analyzing system metrics... 🤖*');

        setTimeout(() => {
          setAeroAnim('');
          setAeroExpr('thinking');

          // 3. Dash does a victory spin in executing mode
          setDashAnim('dash-loop-action');
          setDashExpr('executing');
          setDashBubble('*I move, monitor & execute! 🚀*');

          setTimeout(() => {
            setDashAnim('');
            setDashBubble(null);
            setAeroBubble(null);
            setAeroExpr('happy');
            setDashExpr('happy');
          }, 1200);

        }, 900);
      }, 700);
    }, 8500);

    return () => clearInterval(interval);
  }, []);

  const triggerAero = () => {
    setAeroAnim('aero-shock-action');
    setAeroExpr('analyzing');
    setAeroBubble('*I think, analyze & assist! 🤖*');
    setTimeout(() => {
      setAeroAnim('');
      setAeroBubble(null);
      setAeroExpr('happy');
    }, 1600);
  };

  const triggerDash = () => {
    setDashAnim('dash-loop-action');
    setDashExpr('executing');
    setDashBubble('*I move, monitor & execute! ⚡*');
    setTimeout(() => {
      setDashAnim('');
      setDashBubble(null);
      setDashExpr('happy');
    }, 1600);
  };

  return (
    <div className="mascots-playfield" aria-label="Aero and Dash system mascots">
      {/* AERO: AI Assistant · Features: Floating Green Halo Ring, Glass Sphere Body, Ear Pods */}
      <div
        className={`mascot-unit mascot-aero ${aeroAnim}`}
        title="Aero · AI Assistant (Click to interact)"
        data-feature="aero-halo-sphere"
        onClick={triggerAero}
        role="button"
        tabIndex={0}
        aria-label="Aero mascot with thinking halo indicator"
      >
        <AeroMascot
          expression={aeroExpr}
          size={110}
          bubble={aeroBubble}
          onClick={triggerAero}
          eyeOffset={mouseOffset}
          isFloating={false}
        />
      </div>

      {/* DASH: System Drone · Features: Cyber Antennae Receivers, Plasma Jet Thrusters, HX313 Chassis */}
      <div
        className={`mascot-unit mascot-dash ${dashAnim}`}
        title="Dash · System Drone (Click to interact)"
        data-feature="dash-antennae-thrusters"
        onClick={triggerDash}
        role="button"
        tabIndex={0}
        aria-label="Dash mascot with flight thruster wings and antennae"
      >
        <DashMascot
          expression={dashExpr}
          size={105}
          bubble={dashBubble}
          onClick={triggerDash}
          eyeOffset={mouseOffset}
          isFloating={false}
        />
      </div>
    </div>
  );
}
