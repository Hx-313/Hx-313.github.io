import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/*
  Hero centerpiece — a phone lying flat, tilted diagonally, projecting a
  holographic beam from a portal on its screen. Real shipped-app logos +
  live data cards fan out in an arc, wired to the portal with dotted node
  connectors. Neon teal -> magenta, bloom glow, periodic RGB-split glitch.
  Cursor-parallax + idle float. Fully static under prefers-reduced-motion.
*/

const TEAL = 0x00f2fe;
const MAGENTA = 0xff2fd0;

/* ---- phone screen dashboard ---- */
function makeScreenTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 1024;
  const x = c.getContext('2d');
  const bg = x.createLinearGradient(0, 0, 0, 1024);
  bg.addColorStop(0, '#0a1424'); bg.addColorStop(1, '#060c18');
  x.fillStyle = bg; x.fillRect(0, 0, 512, 1024);
  const round = (px, py, w, h, r) => {
    x.beginPath(); x.moveTo(px + r, py);
    x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r);
    x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath();
  };
  x.fillStyle = 'rgba(255,255,255,0.8)';
  x.font = '600 26px Outfit, sans-serif'; x.fillText('9:41', 40, 62);
  x.textAlign = 'right'; x.fillText('5G', 472, 62); x.textAlign = 'left';
  x.fillStyle = '#f8fafc'; x.font = '800 44px Outfit, sans-serif';
  x.fillText('Dashboard', 40, 150);
  // faint UI rows (top + bottom; center left clear for the portal glow)
  const row = (py) => { round(40, py, 432, 70, 20); x.fillStyle = 'rgba(255,255,255,0.045)'; x.fill();
    x.strokeStyle = 'rgba(0,242,254,0.14)'; x.lineWidth = 2; x.stroke(); };
  row(190); row(276);
  round(40, 840, 210, 130, 24); x.fillStyle = 'rgba(0,242,254,0.06)'; x.fill();
  round(262, 840, 210, 130, 24); x.fillStyle = 'rgba(255,47,208,0.06)'; x.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return tex;
}

/* ---- holographic app-logo card ---- */
function makeCardTexture({ img, name, tag, accent, data }) {
  const W = 420, H = 248, c = document.createElement('canvas');
  c.width = W; c.height = H; const x = c.getContext('2d');
  const r = 26;
  const panel = () => { x.beginPath(); x.moveTo(r + 6, 6);
    x.arcTo(W - 6, 6, W - 6, H - 6, r); x.arcTo(W - 6, H - 6, 6, H - 6, r);
    x.arcTo(6, H - 6, 6, 6, r); x.arcTo(6, 6, W - 6, 6, r); x.closePath(); };
  panel(); x.fillStyle = 'rgba(9,18,33,0.62)'; x.fill();
  x.save(); panel(); x.clip();
  // scanlines
  x.globalAlpha = 0.05; x.fillStyle = '#9becff';
  for (let yy = 0; yy < H; yy += 5) x.fillRect(0, yy, W, 1);
  x.globalAlpha = 1;
  if (img) {
    // app icon, rounded-clipped
    const s = 96, ix = 34, iy = 40, ir = 22;
    x.save(); x.beginPath(); x.moveTo(ix + ir, iy);
    x.arcTo(ix + s, iy, ix + s, iy + s, ir); x.arcTo(ix + s, iy + s, ix, iy + s, ir);
    x.arcTo(ix, iy + s, ix, iy, ir); x.arcTo(ix, iy, ix + s, iy, ir); x.closePath(); x.clip();
    x.drawImage(img, ix, iy, s, s); x.restore();
    x.strokeStyle = 'rgba(255,255,255,0.14)'; x.lineWidth = 2; x.stroke();
  }
  x.restore();
  // text
  const tx = img ? 154 : 34;
  x.fillStyle = '#f8fafc'; x.font = '800 34px Outfit, sans-serif'; x.fillText(name, tx, 88);
  x.fillStyle = accent; x.font = '700 20px Plus Jakarta Sans, sans-serif';
  x.fillText(tag.toUpperCase(), tx, 120);
  // mini data row
  if (data) {
    x.strokeStyle = accent; x.lineWidth = 3; x.beginPath();
    data.forEach((p, i) => { const px = 34 + i * ((W - 68) / (data.length - 1)); const py = 210 - p * 55;
      i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke();
  }
  // HUD corner ticks
  x.strokeStyle = accent; x.lineWidth = 3; const L = 16, m = 14;
  const tick = (cx, cy, dx, dy) => { x.beginPath(); x.moveTo(cx + dx * L, cy); x.lineTo(cx, cy);
    x.lineTo(cx, cy + dy * L); x.stroke(); };
  tick(m, m, 1, 1); tick(W - m, m, -1, 1); tick(m, H - m, 1, -1); tick(W - m, H - m, -1, -1);
  // border
  panel(); x.strokeStyle = accent; x.lineWidth = 2.5; x.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return tex;
}

function loadImg(src) {
  return new Promise((res) => {
    const im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = () => res(im); im.onerror = () => res(null); im.src = src;
  });
}

export default function HeroCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = mount.clientWidth, height = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x05070f, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 7.6);

    const parallax = new THREE.Group(); scene.add(parallax);
    const stage = new THREE.Group(); parallax.add(stage);

    // ---- phone (lying flat, tilted diagonally, lower area) ----
    const phone = new THREE.Group();
    phone.position.set(0, -1.85, 0.4);
    phone.rotation.set(-1.02, -0.32, 0.34);
    phone.scale.setScalar(0.92);
    stage.add(phone);

    const body = new THREE.Mesh(
      new RoundedBoxGeometry(2.05, 4.15, 0.22, 8, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x0b111f, metalness: 0.96, roughness: 0.26 })
    );
    phone.add(body);
    const screenTex = makeScreenTexture();
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.82, 3.9),
      new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
    screen.position.z = 0.125; phone.add(screen);
    const notch = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.28, 4, 8),
      new THREE.MeshBasicMaterial({ color: 0x05070f }));
    notch.rotation.z = Math.PI / 2; notch.position.set(0, 1.72, 0.14); phone.add(notch);

    // ---- emission portal on the screen ----
    const portal = new THREE.Group();
    portal.position.set(0, 0.1, 0.14); phone.add(portal);
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22 + i * 0.14, 0.008, 8, 64),
        new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.8, toneMapped: false }));
      portal.add(ring); rings.push(ring);
    }
    const core = new THREE.Mesh(new THREE.CircleGeometry(0.14, 32),
      new THREE.MeshBasicMaterial({ color: 0xd6fbff, transparent: true, opacity: 0.95, toneMapped: false }));
    portal.add(core);
    // beam rising out of the screen (local +Z) — thin + subtle
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.05, 3.0, 28, 1, true),
      new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.06, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
    );
    beam.rotation.x = -Math.PI / 2; beam.position.z = 1.5; portal.add(beam);

    // ---- central projected wireframe object (the "app"), upper-center ----
    const central = new THREE.Group();
    central.position.set(0.1, 1.75, -0.3); stage.add(central);
    const holo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.52, 1),
      new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.8, toneMapped: false }));
    central.add(holo);
    const holoCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0),
      new THREE.MeshBasicMaterial({ color: MAGENTA, transparent: true, opacity: 0.55, toneMapped: false }));
    central.add(holoCore);
    const holoRing = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.01, 8, 80),
      new THREE.MeshBasicMaterial({ color: MAGENTA, transparent: true, opacity: 0.5, toneMapped: false }));
    holoRing.rotation.x = Math.PI / 2.1; central.add(holoRing);

    // ---- particles ----
    const pCount = 380, pGeo = new THREE.BufferGeometry(), pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 14; pPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: TEAL, size: 0.03,
      transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    parallax.add(particles);

    // ---- soft energy backdrop ----
    const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 256;
    const gx = glowCanvas.getContext('2d');
    const rg = gx.createRadialGradient(128, 128, 0, 128, 128, 128);
    rg.addColorStop(0, 'rgba(0,242,254,0.5)'); rg.addColorStop(0.5, 'rgba(124,58,237,0.2)');
    rg.addColorStop(1, 'rgba(5,7,15,0)'); gx.fillStyle = rg; gx.fillRect(0, 0, 256, 256);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(7, 7),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(glowCanvas), transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.4 }));
    glow.position.set(0.1, 1.4, -2.4); stage.add(glow);

    // ---- lights ----
    scene.add(new THREE.AmbientLight(0x1a2440, 1.2));
    const key = new THREE.DirectionalLight(TEAL, 3.0); key.position.set(-4, 4, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(MAGENTA, 2.4); fill.position.set(5, 0, 3); scene.add(fill);
    const top = new THREE.DirectionalLight(0xffffff, 0.7); top.position.set(0, 6, 3); scene.add(top);

    // ---- post: bloom ----
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.7, 0.16);
    composer.addPass(bloom);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ---- floating cards (app logos + data), built after logos load ----
    const cards = [];
    // arc across the TOP so the lower-left stays clear for the headline
    const CARD_DEFS = [
      { img: '/assets/petcare.webp',     name: 'Pet Care',    tag: 'iOS · Android', accent: '#00f2fe', pos: [-2.7, 1.25, 0.2], scale: 0.9,  data: [.3, .6, .5, .8, .7] },
      { img: '/assets/dietify.png',      name: 'Dietify',     tag: 'Health',        accent: '#7c3aed', pos: [-1.95, 2.4, 0.1], scale: 0.88, data: [.3, .5, .6, .5, .7] },
      { img: '/assets/expenseflow.webp', name: 'ExpenseFlow', tag: 'Finance',       accent: '#4facfe', pos: [-0.1, 2.85, 0.0], scale: 0.92, data: [.4, .5, .7, .6, .9] },
      { img: '/assets/ebill.png',        name: 'eBill',       tag: 'Utilities',     accent: '#00f2fe', pos: [ 1.75, 2.4, 0.1], scale: 0.88, data: [.5, .4, .6, .5, .8] },
      { img: '/assets/speak.png',        name: 'Translate',   tag: 'AI Voice',      accent: '#ff2fd0', pos: [ 2.7, 1.25, 0.2], scale: 0.9,  data: [.2, .5, .4, .7, .6] },
      { img: null, name: '99.9%', tag: 'Uptime',   accent: '#00f2fe', pos: [ 3.0, 0.0, 0.3], scale: 0.78, data: [.6, .7, .65, .8, .78] },
      { img: null, name: '12.4k', tag: 'Installs', accent: '#ff2fd0', pos: [-3.05, 0.0, 0.3], scale: 0.78, data: [.3, .5, .6, .8, .95] },
    ];
    const connectors = new THREE.Group(); stage.add(connectors);
    const portalAnchor = new THREE.Vector3(0, -1.0, 0.7); // near the beam origin, in stage space

    Promise.all(CARD_DEFS.map((d) => d.img ? loadImg(d.img) : Promise.resolve(null))).then((imgs) => {
      if (disposed) return;
      CARD_DEFS.forEach((d, i) => {
        const tex = makeCardTexture({ img: imgs[i], name: d.name, tag: d.tag, accent: d.accent, data: d.data });
        const w = 1.28 * d.scale, h = 0.756 * d.scale;
        const geo = new THREE.PlaneGeometry(w, h);
        const card = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true,
          toneMapped: false, depthWrite: false }));
        card.position.set(...d.pos);
        // RGB-split ghosts for the glitch
        const ghostMat = (col) => new THREE.MeshBasicMaterial({ color: col, map: tex, transparent: true,
          opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
        const gC = new THREE.Mesh(geo, ghostMat(TEAL)); gC.position.x = -0.04;
        const gM = new THREE.Mesh(geo, ghostMat(MAGENTA)); gM.position.x = 0.04;
        card.add(gC); card.add(gM);
        card.userData = { base: d.pos.slice(), phase: i * 1.3, gC, gM, glitchUntil: 0 };
        stage.add(card); cards.push(card);

        // dotted connector + node dots
        const pts = [portalAnchor.clone(), new THREE.Vector3(d.pos[0], d.pos[1], d.pos[2])];
        const lg = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(lg, new THREE.LineDashedMaterial({ color: TEAL, transparent: true,
          opacity: 0.35, dashSize: 0.1, gapSize: 0.09 }));
        line.computeLineDistances(); connectors.add(line);
        const node = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8),
          new THREE.MeshBasicMaterial({ color: d.accent, toneMapped: false }));
        node.position.copy(pts[1]); connectors.add(node);
      });
      if (reduce) composer.render();
    });

    // ---- responsive placement ----
    const applyLayout = () => {
      const wide = width >= 900;
      const offX = wide ? (width >= 1280 ? 0.5 : 0.3) : 0;
      const s = wide ? (width >= 1280 ? 0.86 : 0.78) : 0.66;
      stage.position.x = offX; stage.position.y = wide ? 0.15 : 0.5;
      stage.scale.setScalar(s);
    };
    applyLayout();

    const onResize = () => {
      width = mount.clientWidth; height = mount.clientHeight;
      camera.aspect = width / height; camera.updateProjectionMatrix();
      renderer.setSize(width, height); composer.setSize(width, height); applyLayout();
    };
    const ro = new ResizeObserver(onResize); ro.observe(mount);

    // ---- pointer parallax ----
    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    const onMove = (e) => {
      const r = mount.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    if (!reduce) window.addEventListener('pointermove', onMove);

    // ---- loop ----
    const clock = new THREE.Clock();
    let raf = 0, nextGlitch = 1.5;
    const frame = () => {
      const t = clock.getElapsedTime();
      cur.x += (target.x - cur.x) * 0.05; cur.y += (target.y - cur.y) * 0.05;
      parallax.rotation.y = cur.x * 0.2; parallax.rotation.x = cur.y * 0.14;
      stage.position.y = (width >= 900 ? 0.15 : 0.5) + Math.sin(t * 0.8) * 0.06;

      // portal
      rings.forEach((ring, i) => {
        const k = (t * 0.5 + i / rings.length) % 1;
        ring.scale.setScalar(0.6 + k * 1.6);
        ring.material.opacity = (1 - k) * 0.8;
      });
      core.material.opacity = 0.85 + Math.sin(t * 6) * 0.12;
      beam.material.opacity = 0.1 + Math.sin(t * 3) * 0.03;

      central.rotation.y = t * 0.35; holo.rotation.x = t * 0.2;
      holoCore.rotation.y = -t * 0.6; holoRing.rotation.z = t * 0.4;
      particles.rotation.y = t * 0.02;

      // glitch scheduling
      if (t > nextGlitch && cards.length) {
        const hits = 1 + Math.floor(Math.random() * 2);
        for (let n = 0; n < hits; n++) {
          const card = cards[Math.floor(Math.random() * cards.length)];
          card.userData.glitchUntil = t + 0.09 + Math.random() * 0.08;
        }
        nextGlitch = t + 1.3 + Math.random() * 2.6;
      }
      cards.forEach((card) => {
        const u = card.userData;
        card.position.y = u.base[1] + Math.sin(t * 0.9 + u.phase) * 0.07;
        card.position.z = u.base[2] + Math.cos(t * 0.7 + u.phase) * 0.05;
        if (t < u.glitchUntil) {
          const j = (Math.random() - 0.5);
          card.position.x = u.base[0] + j * 0.07;
          u.gC.position.x = -0.03 - Math.abs(j) * 0.06; u.gM.position.x = 0.03 + Math.abs(j) * 0.06;
          u.gC.material.opacity = 0.5; u.gM.material.opacity = 0.5;
          card.material.opacity = 0.7 + Math.random() * 0.3;
        } else {
          card.position.x = u.base[0];
          u.gC.material.opacity = 0; u.gM.material.opacity = 0; card.material.opacity = 1;
        }
      });

      composer.render();
      raf = requestAnimationFrame(frame);
    };
    if (reduce) composer.render(); else raf = requestAnimationFrame(frame);

    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.transition = 'opacity 0.9s ease';
    requestAnimationFrame(() => { renderer.domElement.style.opacity = '1'; });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      ro.disconnect(); composer.dispose(); renderer.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { const m = Array.isArray(o.material) ? o.material : [o.material];
          m.forEach((mm) => { if (mm.map) mm.map.dispose(); mm.dispose(); }); }
      });
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="hero-canvas" aria-hidden="true" />;
}
