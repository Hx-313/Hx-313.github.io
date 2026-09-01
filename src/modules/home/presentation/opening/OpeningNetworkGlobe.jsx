import HolographicGlobe from '../hero/HolographicGlobe.jsx';

const ROUTES = [
  'M212 287 Q350 120 520 246',
  'M241 331 Q410 205 590 315',
  'M284 252 Q436 365 606 251',
  'M250 408 Q410 292 566 438',
  'M324 480 Q452 326 616 404',
  'M222 350 Q340 482 518 484',
];

const NODES = [
  [212,287],[241,331],[284,252],[250,408],[324,480],[520,246],[590,315],[606,251],[566,438],[616,404],[518,484],[405,352],[455,289],[362,420]
];

export default function OpeningNetworkGlobe() {
  return (
    <div className="opening-network-globe" data-opening-globe aria-hidden="true">
      {/* 3D Kinetic Holographic Globe (WebGL active from frame 0) */}
      <div className="opening-3d-globe-layer">
        <HolographicGlobe className="holographic-stage-wrapper--opening" />
      </div>

      <svg viewBox="0 0 800 800" role="img" aria-label="Connected global software network" className="opening-svg-overlay">
        <defs>
          <radialGradient id="earthOcean" cx="42%" cy="35%" r="65%">
            <stop offset="0" stopColor="#0d3540" />
            <stop offset=".58" stopColor="#04191d" />
            <stop offset="1" stopColor="#01090c" />
          </radialGradient>
          <radialGradient id="earthAtmosphere">
            <stop offset=".72" stopColor="#0fd9bd" stopOpacity="0" />
            <stop offset=".92" stopColor="#6dece4" stopOpacity=".18" />
            <stop offset="1" stopColor="#b8fff6" stopOpacity=".55" />
          </radialGradient>
          <pattern id="cityLights" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="3" r="1" fill="#e7c77d" opacity=".85" />
            <circle cx="8" cy="7" r=".65" fill="#fff0bd" opacity=".55" />
          </pattern>
          <clipPath id="earthClip"><circle cx="400" cy="380" r="316" /></clipPath>
          <filter id="nodeGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="earthGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g className="opening-orbit-field" data-globe-orbits>
          <ellipse cx="400" cy="380" rx="390" ry="206" transform="rotate(-18 400 380)" />
          <ellipse cx="400" cy="380" rx="395" ry="180" transform="rotate(38 400 380)" />
          <ellipse cx="400" cy="380" rx="374" ry="232" transform="rotate(78 400 380)" />
        </g>

        <g className="opening-globe-rotor" data-globe-rotation>
          <circle className="opening-earth-halo" cx="400" cy="380" r="324" filter="url(#earthGlow)" />
          <circle cx="400" cy="380" r="316" fill="url(#earthOcean)" stroke="#6dece4" strokeOpacity=".58" strokeWidth="2" opacity="0.12" />

          <g clipPath="url(#earthClip)" className="opening-earth-grid" data-globe-grid transform="translate(400 380) scale(1.18) translate(-400 -380)" opacity="0.45">
            <ellipse cx="400" cy="380" rx="260" ry="58" />
            <ellipse cx="400" cy="380" rx="265" ry="124" />
            <ellipse cx="400" cy="380" rx="268" ry="198" />
            <path d="M400 112 C290 190 290 570 400 648 C510 570 510 190 400 112Z" />
            <path d="M400 112 C205 210 205 550 400 648 C595 550 595 210 400 112Z" />
            <path d="M132 380 H668 M400 112 V648" />
          </g>

          <g clipPath="url(#earthClip)" className="opening-continents" data-globe-continents transform="translate(400 380) scale(1.18) translate(-400 -380)" opacity="0.35">
            <path d="M172 236 L208 190 278 170 334 205 320 238 286 255 271 299 235 314 210 291 184 280Z" />
            <path d="M276 322 L320 348 335 405 310 470 286 528 262 493 269 432 250 378Z" />
            <path d="M389 208 L426 186 468 198 476 226 442 241 410 234Z" />
            <path d="M405 247 L466 242 503 276 493 327 468 342 452 407 420 474 390 437 381 376 355 320 366 274Z" />
            <path d="M470 187 L553 171 626 208 649 254 613 280 566 266 534 298 492 279 475 239Z" />
            <path d="M571 411 L627 430 640 473 605 497 558 475Z" />
          </g>
          <g clipPath="url(#earthClip)" className="opening-network-routes" data-globe-network transform="translate(400 380) scale(1.18) translate(-400 -380)">
            {ROUTES.map((route) => <path key={route} d={route} />)}
            {NODES.map(([x,y], index) => <circle key={`${x}-${y}`} cx={x} cy={y} r={index % 4 === 0 ? 5 : 3} filter="url(#nodeGlow)" />)}
            <circle className="opening-network-core" data-globe-core cx="405" cy="352" r="34" />
            <circle className="opening-network-core opening-network-core--inner" cx="405" cy="352" r="18" />
          </g>
          <circle cx="400" cy="380" r="316" fill="url(#earthAtmosphere)" opacity="0.4" />
        </g>

        <g className="opening-orbit-nodes" filter="url(#nodeGlow)">
          <circle cx="92" cy="295" r="5" /><circle cx="683" cy="237" r="5" /><circle cx="718" cy="442" r="4" />
          <circle cx="278" cy="91" r="4" /><circle cx="562" cy="89" r="5" /><circle cx="195" cy="598" r="4" />
        </g>
      </svg>
    </div>
  );
}
