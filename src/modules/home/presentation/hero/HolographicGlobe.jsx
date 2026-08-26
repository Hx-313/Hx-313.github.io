import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Procedural soft glow starlight sprite
function createPointTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.18, 'rgba(110, 231, 183, 0.95)');
  gradient.addColorStop(0.42, 'rgba(16, 185, 129, 0.6)');
  gradient.addColorStop(0.72, 'rgba(0, 242, 254, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function HolographicGlobe() {
  const containerRef = useRef(null);
  const canvasContainerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvasContainer = canvasContainerRef.current;
    if (!container || !canvasContainer) return undefined;

    let disposed = false;
    let animId = null;

    // Accessibility check
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = mediaQuery.matches;
    const onMotionChange = (e) => { prefersReducedMotion = e.matches; };
    mediaQuery.addEventListener('change', onMotionChange);

    // Setup WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    let width = canvasContainer.clientWidth || 480;
    let height = canvasContainer.clientHeight || 480;
    renderer.setSize(width, height);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.cursor = 'grab';
    canvasContainer.appendChild(renderer.domElement);

    // Camera & Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 7.8);
    camera.lookAt(0, 0, 0);

    // Universe / Parallax Groups
    const universe = new THREE.Group();
    scene.add(universe);

    const globeRoot = new THREE.Group();
    globeRoot.rotation.x = 0.26;
    globeRoot.rotation.y = -0.15;
    universe.add(globeRoot);

    const pointTex = createPointTexture();

    // -------------------------------------------------------------
    // 1. BACKGROUND NEW ELEMENT: 3D HOLOGRAPHIC RADAR & CELESTIAL GRID
    // -------------------------------------------------------------
    const backdropGroup = new THREE.Group();
    backdropGroup.position.z = -1.2;
    universe.add(backdropGroup);

    // Outer Range Radar Ring 1
    const radarRing1 = new THREE.Mesh(
      new THREE.RingGeometry(2.7, 2.715, 96),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
    );
    backdropGroup.add(radarRing1);

    // Outer Range Radar Ring 2
    const radarRing2 = new THREE.Mesh(
      new THREE.RingGeometry(3.3, 3.312, 128),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.14, side: THREE.DoubleSide })
    );
    backdropGroup.add(radarRing2);

    // Subtle Radial Radar Crosshairs
    const crosshairMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.12 });
    const crosshairGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-3.5, 0, 0),
      new THREE.Vector3(3.5, 0, 0),
      new THREE.Vector3(0, -3.5, 0),
      new THREE.Vector3(0, 3.5, 0),
    ]);
    const crosshairs = new THREE.LineSegments(crosshairGeo, crosshairMat);
    backdropGroup.add(crosshairs);

    // Ambient Floating Deep-Space Stardust (360 particles in background)
    const dustCount = 360;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i += 1) {
      dustPos[i * 3] = (Math.random() - 0.5) * 12;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.035,
      map: pointTex,
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    backdropGroup.add(dustParticles);

    // -------------------------------------------------------------
    // 2. THE ENHANCED HOLOGRAPHIC GLOBE SPHERE (Fibonacci Lattice)
    // -------------------------------------------------------------
    const sphereRadius = 1.75;
    const numPoints = 1200;
    const spherePoints = [];
    const positions = new Float32Array(numPoints * 3);
    const colors = new Float32Array(numPoints * 3);

    const colorA = new THREE.Color('#10b981'); // Emerald
    const colorB = new THREE.Color('#00f2fe'); // Electric cyan
    const colorC = new THREE.Color('#a7f3d0'); // Bright mint
    const colorD = new THREE.Color('#f8fafc'); // Pure starlight

    // Generate Golden Spiral / Fibonacci Sphere distribution
    for (let i = 0; i < numPoints; i += 1) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / numPoints);
      const theta = Math.PI * (1 + 5 ** 0.5) * i;

      const x = Math.sin(phi) * Math.cos(theta) * sphereRadius;
      const y = Math.cos(phi) * sphereRadius;
      const z = Math.sin(phi) * Math.sin(theta) * sphereRadius;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      spherePoints.push(new THREE.Vector3(x, y, z));

      // Color variation: poles are cyan/mint, equator is vibrant emerald
      const latRatio = Math.abs(y / sphereRadius);
      let col;
      if (latRatio > 0.75) {
        col = Math.random() > 0.5 ? colorB : colorD;
      } else if (latRatio > 0.35) {
        col = Math.random() > 0.4 ? colorA : colorC;
      } else {
        col = Math.random() > 0.6 ? colorB : colorA;
      }

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.085,
      vertexColors: true,
      map: pointTex,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const globePointsMesh = new THREE.Points(pGeo, pMat);
    globeRoot.add(globePointsMesh);

    // -------------------------------------------------------------
    // 3. 3D GEODESIC CONSTELLATION MESH (Connecting Nearest Nodes)
    // -------------------------------------------------------------
    const lineIndices = [];
    const maxDist = 0.42;
    for (let i = 0; i < numPoints; i += 1) {
      const p1 = spherePoints[i];
      let connections = 0;
      for (let j = i + 1; j < numPoints && connections < 3; j += 1) {
        const p2 = spherePoints[j];
        if (p1.distanceTo(p2) < maxDist) {
          lineIndices.push(p1.x, p1.y, p1.z);
          lineIndices.push(p2.x, p2.y, p2.z);
          connections += 1;
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineIndices, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    const globeLinesMesh = new THREE.LineSegments(lineGeo, lineMat);
    globeRoot.add(globeLinesMesh);

    // -------------------------------------------------------------
    // 4. INNER VOLUMETRIC QUANTUM PLASMA CORE (Atmospheric Fresnel)
    // -------------------------------------------------------------
    const coreGeo = new THREE.SphereGeometry(sphereRadius * 0.92, 36, 36);
    const coreMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#052e16') },
        color2: { value: new THREE.Color('#064e3b') },
        color3: { value: new THREE.Color('#00f2fe') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float viewDot = dot(vNormal, vec3(0.0, 0.0, 1.0));
          float rim = 1.0 - max(0.0, abs(viewDot));
          rim = pow(rim, 2.2);

          float pulse = 0.85 + 0.15 * sin(time * 2.0 + vPosition.y * 3.0);
          vec3 col = mix(color1, color2, sin(time * 0.8 + vPosition.x * 2.0) * 0.5 + 0.5);
          col = mix(col, color3, rim * 0.5);

          gl_FragColor = vec4(col * 1.4, rim * pulse * 0.55);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeRoot.add(coreMesh);

    // Great Circle Longitude & Latitude Wireframe Rings
    const latRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(sphereRadius * 1.01, 0.006, 12, 128),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending })
    );
    latRing1.rotation.x = Math.PI / 2;
    globeRoot.add(latRing1);

    const longRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(sphereRadius * 1.01, 0.005, 12, 128),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending })
    );
    globeRoot.add(longRing1);

    // -------------------------------------------------------------
    // 5. GYROSCOPIC HOLOGRAPHIC GIMBAL RINGS & TELEMETRY NODES
    // -------------------------------------------------------------
    const gimbalGroup = new THREE.Group();
    globeRoot.add(gimbalGroup);

    // Outer Gyro Ring (Inclined 45°)
    const gyroRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(sphereRadius * 1.28, 0.007, 12, 128),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending })
    );
    gyroRing1.rotation.x = Math.PI / 4;
    gimbalGroup.add(gyroRing1);

    // Outer Gyro Ring (Inclined -60°)
    const gyroRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(sphereRadius * 1.42, 0.006, 12, 128),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending })
    );
    gyroRing2.rotation.y = Math.PI / 3;
    gyroRing2.rotation.x = -Math.PI / 6;
    gimbalGroup.add(gyroRing2);

    // Satellite Data Nodes
    const satellite1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x34d399, blending: THREE.AdditiveBlending })
    );
    gimbalGroup.add(satellite1);

    const satellite2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.038, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe, blending: THREE.AdditiveBlending })
    );
    gimbalGroup.add(satellite2);

    // -------------------------------------------------------------
    // 6. INTERACTION: 3D DRAG INERTIA & CURSOR GRAVITY PARALLAX
    // -------------------------------------------------------------
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let rotVelX = 0;
    let rotVelY = 0.0028;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerSmoothX = 0;
    let pointerSmoothY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      prevPointerX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      prevPointerY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

      const rect = canvasContainer.getBoundingClientRect();
      pointerTargetX = ((clientX - rect.left) / rect.width - 0.5) * 2;
      pointerTargetY = ((clientY - rect.top) / rect.height - 0.5) * 2;

      if (!isDragging) return;

      const dx = clientX - prevPointerX;
      const dy = clientY - prevPointerY;

      rotVelY = dx * 0.006;
      rotVelX = dy * 0.006;

      globeRoot.rotation.y += rotVelY;
      globeRoot.rotation.x += rotVelX;

      prevPointerX = clientX;
      prevPointerY = clientY;
    };

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    domEl.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Resize Handler
    const handleResize = () => {
      if (!canvasContainer) return;
      width = canvasContainer.clientWidth || 480;
      height = canvasContainer.clientHeight || 480;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(canvasContainer);

    // -------------------------------------------------------------
    // 7. RENDER ANIMATION LOOP
    // -------------------------------------------------------------
    const clock = new THREE.Clock();

    const render = () => {
      if (disposed) return;
      const elapsedTime = clock.getElapsedTime();

      // Smooth pointer parallax
      pointerSmoothX += (pointerTargetX - pointerSmoothX) * 0.05;
      pointerSmoothY += (pointerTargetY - pointerSmoothY) * 0.05;

      universe.rotation.y = pointerSmoothX * 0.22;
      universe.rotation.x = -pointerSmoothY * 0.16;

      // Natural drag inertia damping
      if (!isDragging) {
        if (!prefersReducedMotion) {
          globeRoot.rotation.y += rotVelY;
          globeRoot.rotation.x += rotVelX;
          rotVelY = THREE.MathUtils.lerp(rotVelY, 0.0028, 0.028);
          rotVelX = THREE.MathUtils.lerp(rotVelX, 0, 0.028);
        }
      }

      coreMat.uniforms.time.value = elapsedTime;

      // Background Radar & Gimbal Motion
      if (!prefersReducedMotion) {
        radarRing1.rotation.z = -elapsedTime * 0.08;
        radarRing2.rotation.z = elapsedTime * 0.05;
        crosshairs.rotation.z = -elapsedTime * 0.03;
        dustParticles.rotation.y = elapsedTime * 0.015;

        gyroRing1.rotation.z = elapsedTime * 0.3;
        gyroRing2.rotation.z = -elapsedTime * 0.22;

        const sat1Angle = elapsedTime * 0.7;
        satellite1.position.set(
          Math.cos(sat1Angle) * sphereRadius * 1.28 * Math.cos(Math.PI / 4),
          Math.sin(sat1Angle) * sphereRadius * 1.28,
          Math.cos(sat1Angle) * sphereRadius * 1.28 * Math.sin(Math.PI / 4)
        );

        const sat2Angle = -elapsedTime * 0.9;
        satellite2.position.set(
          Math.cos(sat2Angle) * sphereRadius * 1.42,
          Math.sin(sat2Angle) * sphereRadius * 1.42 * Math.cos(Math.PI / 3),
          Math.sin(sat2Angle) * sphereRadius * 1.42 * Math.sin(Math.PI / 3)
        );
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      disposed = true;
      if (animId) cancelAnimationFrame(animId);
      ro.disconnect();
      mediaQuery.removeEventListener('change', onMotionChange);

      domEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);

      domEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      renderer.dispose();
      pointTex?.dispose();
      pGeo.dispose();
      pMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      latRing1.geometry.dispose();
      latRing1.material.dispose();
      longRing1.geometry.dispose();
      longRing1.material.dispose();
      gyroRing1.geometry.dispose();
      gyroRing1.material.dispose();
      gyroRing2.geometry.dispose();
      gyroRing2.material.dispose();
      satellite1.geometry.dispose();
      satellite1.material.dispose();
      satellite2.geometry.dispose();
      satellite2.material.dispose();
      radarRing1.geometry.dispose();
      radarRing1.material.dispose();
      radarRing2.geometry.dispose();
      radarRing2.material.dispose();
      crosshairGeo.dispose();
      crosshairMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();

      if (domEl.parentNode) {
        domEl.parentNode.removeChild(domEl);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="holographic-stage-wrapper" aria-label="3D Holographic Kinetic Sphere System Core">
      {/* 3D WebGL Canvas */}
      <div ref={canvasContainerRef} className="holographic-globe-canvas-mount" />

      {/* Futuristic Background Atmospheric & Radar Grid Rings */}
      <div className="stage-backdrop-grid" aria-hidden="true">
        <div className="radar-glow-aura" />
        <div className="radar-sweep-beam" />
        <div className="radar-axis-x" />
        <div className="radar-axis-y" />
        <div className="radar-corner-brackets">
          <span className="bracket bracket-tl">SYS.CORE // 313</span>
          <span className="bracket bracket-tr">NODE.MESH // 1200</span>
          <span className="bracket bracket-bl">LAT.ORBIT // ACTIVE</span>
          <span className="bracket bracket-br">COORD // 31.5204° N</span>
        </div>
      </div>
    </div>
  );
}
