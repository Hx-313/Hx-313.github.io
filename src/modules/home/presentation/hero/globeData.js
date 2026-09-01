/**
 * Globe Telemetry & Geographical Data Constants
 * Clean Architecture Data Layer - Frozen constants and procedural canvas builder
 */

export const GLOBE_HUBS = Object.freeze([
  { id: 'lahore', name: 'SYS.CORE // 313', lat: 31.5204, lng: 74.3587, isCore: true },
  { id: 'san_francisco', name: 'SF.NODE // 01', lat: 37.7749, lng: -122.4194 },
  { id: 'new_york', name: 'NYC.NODE // 02', lat: 40.7128, lng: -74.0060 },
  { id: 'london', name: 'LDN.NODE // 03', lat: 51.5074, lng: -0.1278 },
  { id: 'berlin', name: 'BER.NODE // 04', lat: 52.5200, lng: 13.4050 },
  { id: 'dubai', name: 'DXB.NODE // 05', lat: 25.2048, lng: 55.2708 },
  { id: 'singapore', name: 'SIN.NODE // 06', lat: 1.3521, lng: 103.8198 },
  { id: 'tokyo', name: 'TYO.NODE // 07', lat: 35.6762, lng: 139.6503 },
  { id: 'sydney', name: 'SYD.NODE // 08', lat: -33.8688, lng: 151.2093 },
  { id: 'sao_paulo', name: 'SAO.NODE // 09', lat: -23.5505, lng: -46.6333 },
  { id: 'cairo', name: 'CAI.NODE // 10', lat: 30.0444, lng: 31.2357 },
  { id: 'cape_town', name: 'CPT.NODE // 11', lat: -33.9249, lng: 18.4241 },
]);

export const GLOBE_ROUTES = Object.freeze([
  { from: 'san_francisco', to: 'new_york' },
  { from: 'new_york', to: 'london' },
  { from: 'london', to: 'berlin' },
  { from: 'london', to: 'lahore' },
  { from: 'lahore', to: 'dubai' },
  { from: 'dubai', to: 'cairo' },
  { from: 'cairo', to: 'cape_town' },
  { from: 'lahore', to: 'singapore' },
  { from: 'singapore', to: 'tokyo' },
  { from: 'singapore', to: 'sydney' },
  { from: 'new_york', to: 'sao_paulo' },
]);

// Simplified High-Fidelity Equirectangular Continent Polygons ([lng, lat] pairs in degrees)
export const CONTINENT_POLYGONS = Object.freeze([
  // North America
  [
    [-168, 65], [-160, 71], [-140, 70], [-125, 75], [-95, 76], [-80, 70], [-60, 60],
    [-55, 52], [-65, 44], [-75, 38], [-80, 25], [-81, 25], [-88, 21], [-88, 16],
    [-83, 9], [-77, 8], [-85, 12], [-97, 16], [-105, 20], [-110, 24], [-117, 32],
    [-124, 38], [-124, 48], [-130, 54], [-140, 59], [-152, 58], [-162, 55], [-168, 65],
  ],
  // South America
  [
    [-77, 8], [-72, 11], [-60, 10], [-50, 0], [-35, -5], [-37, -12], [-40, -22],
    [-50, -30], [-58, -34], [-65, -42], [-68, -54], [-75, -50], [-73, -42], [-70, -30],
    [-76, -18], [-81, -5], [-77, 2], [-77, 8],
  ],
  // Europe
  [
    [-10, 36], [0, 43], [10, 44], [15, 38], [25, 36], [28, 41], [30, 46],
    [38, 55], [30, 60], [25, 70], [15, 68], [5, 62], [8, 55], [-4, 48],
    [-9, 43], [-10, 36],
  ],
  // UK & Ireland
  [
    [-10, 51], [-6, 58], [-2, 58], [1, 52], [-5, 50], [-10, 51],
  ],
  // Africa
  [
    [-17, 15], [-17, 21], [-6, 36], [10, 37], [25, 32], [32, 31], [34, 28],
    [43, 12], [51, 10], [42, 0], [40, -10], [35, -20], [32, -28], [28, -34],
    [18, -34], [12, -18], [10, -5], [2, 6], [-10, 6], [-17, 15],
  ],
  // Asia
  [
    [30, 46], [40, 42], [50, 40], [60, 40], [70, 42], [80, 44], [90, 48],
    [110, 42], [120, 38], [122, 30], [118, 22], [108, 14], [100, 5],
    [104, 1], [98, 10], [88, 22], [80, 15], [77, 8], [72, 20], [68, 24],
    [60, 25], [55, 25], [50, 15], [44, 13], [35, 30], [36, 36], [30, 46],
  ],
  // Japan
  [
    [130, 32], [136, 35], [141, 43], [145, 44], [140, 36], [132, 33], [130, 32],
  ],
  // Australia & New Zealand
  [
    [114, -22], [120, -15], [135, -12], [142, -11], [146, -18], [153, -28],
    [150, -37], [138, -35], [130, -32], [115, -34], [113, -25], [114, -22],
  ],
  // Greenland
  [
    [-50, 60], [-40, 65], [-20, 75], [-25, 82], [-55, 82], [-60, 76], [-50, 60],
  ],
]);

/**
 * Converts spherical lat/lng to 3D Cartesian coordinates on a sphere of radius R
 */
export function latLngToVector3(lat, lng, radius, out = { x: 0, y: 0, z: 0 }) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  out.x = -(radius * Math.sin(phi) * Math.cos(theta));
  out.z = radius * Math.sin(phi) * Math.sin(theta);
  out.y = radius * Math.cos(phi);

  return out;
}

/**
 * Creates the high-resolution procedural world map texture for Three.js
 */
export function createWorldMapTexture(width = 2048, height = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 1. Deep Ocean Radial/Base Gradient
  const oceanGrad = ctx.createRadialGradient(
    width * 0.45, height * 0.4, width * 0.1,
    width * 0.5, height * 0.5, width * 0.65
  );
  oceanGrad.addColorStop(0, '#0d3540');
  oceanGrad.addColorStop(0.55, '#04191d');
  oceanGrad.addColorStop(1, '#01090c');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Coordinate Grid (Latitude & Longitude lines)
  ctx.save();
  ctx.strokeStyle = 'rgba(109, 236, 228, 0.14)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 6]);

  // Latitude lines (-60, -30, 0, 30, 60)
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Longitude lines (-150 to 150 every 30)
  for (let lng = -150; lng <= 180; lng += 30) {
    const x = ((lng + 180) / 360) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Dot-Matrix Pattern for Continents ("cityLights" aesthetic from Image 1)
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 12;
  patternCanvas.height = 12;
  const pCtx = patternCanvas.getContext('2d');
  if (pCtx) {
    pCtx.fillStyle = 'rgba(231, 199, 125, 0.85)'; // Amber/Gold dot 1
    pCtx.beginPath();
    pCtx.arc(3, 4, 1.4, 0, Math.PI * 2);
    pCtx.fill();

    pCtx.fillStyle = 'rgba(255, 240, 189, 0.55)'; // Soft starlight dot 2
    pCtx.beginPath();
    pCtx.arc(9, 10, 0.9, 0, Math.PI * 2);
    pCtx.fill();
  }
  const dotPattern = ctx.createPattern(patternCanvas, 'repeat');

  // 4. Render Continents
  ctx.save();
  CONTINENT_POLYGONS.forEach((polygon) => {
    if (polygon.length < 3) return;

    ctx.beginPath();
    polygon.forEach(([lng, lat], i) => {
      const x = ((lng + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    // Fill with dot-matrix pattern
    if (dotPattern) {
      ctx.fillStyle = dotPattern;
      ctx.fill();
    }

    // Outer glow for coastlines
    ctx.strokeStyle = 'rgba(231, 199, 125, 0.88)';
    ctx.lineWidth = 2.4;
    ctx.shadowColor = 'rgba(217, 185, 110, 0.65)';
    ctx.shadowBlur = 8;
    ctx.stroke();

    // Sharp inner line
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 240, 189, 0.95)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  ctx.restore();

  return canvas;
}
