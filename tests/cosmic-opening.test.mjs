import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const openingJsxPath = path.resolve('src/modules/home/presentation/opening/OpeningExperience.jsx');
const openingCssPath = path.resolve('src/modules/home/presentation/opening/opening.css');
const openingGlobePath = path.resolve('src/modules/home/presentation/opening/OpeningNetworkGlobe.jsx');
const aeroJsxPath = path.resolve('src/components/mascots/AeroMascot.jsx');
const projectionPath = path.resolve('src/modules/home/presentation/opening/OpeningProjection.jsx');
const sequencePath = path.resolve('src/modules/home/presentation/opening/openingSequence.js');
const dashPath = path.resolve('src/components/mascots/DashMascot.jsx');

test('OpeningExperience contains connected-globe sequence led by Dash with Aero support', () => {
  const jsx = fs.readFileSync(openingJsxPath, 'utf8');
  const globe = fs.readFileSync(openingGlobePath, 'utf8');
  const sequence = fs.readFileSync(sequencePath, 'utf8');

  // 3 Statements Check
  assert.match(sequence, /lead: 'IDEAS NEED', accent: 'STRUCTURE\.'/,'Statement 1 must be present');
  assert.match(sequence, /lead: 'PRODUCTS NEED', accent: 'MOMENTUM\.'/,'Statement 2 must be present');
  assert.match(sequence, /lead: 'MOMENTUM NEEDS', accent: 'CONVICTION\.'/,'Statement 3 must be present');

  // Dash leads the A/B/A dialogue and both concept mascots are present.
  assert.match(sequence, /speaker: 'dash'[\s\S]*speaker: 'aero'[\s\S]*speaker: 'dash'/, 'Opening speaker order must be Dash, Aero, Dash');
  assert.match(jsx, /<DashMascot/, 'Must render Dash as the primary system drone');
  assert.match(jsx, /<AeroMascot/, 'Must render Aero as the supporting AI assistant');

  // Starfield & connected Earth elements
  assert.match(jsx, /space-star-canvas/, 'Must render dynamic starfield canvas');
  assert.match(jsx, /celestial-star/, 'Must render celestial stars');
  assert.match(jsx, /space-skip-btn/, 'Must render skip button');
  assert.match(globe, /opening-continents/, 'Must render recognizable continent silhouettes');
  assert.match(globe, /opening-network-routes/, 'Must render global network routes');
  assert.match(globe, /r="316"/, 'Earth sphere must fill roughly 80% of the square globe frame');
});

test('mobile projection owners live outside transformed mascots and reserve a viewport-safe stage', () => {
  const opening = fs.readFileSync(openingJsxPath, 'utf8');
  const css = fs.readFileSync(openingCssPath, 'utf8');

  assert.match(opening, /className="opening-mobile-projections"[^>]*data-opening-mobile-stage/);
  assert.match(
    opening,
    /<div className="opening-mobile-projections"[\s\S]*?<OpeningProjection\s+mascot="aero"[\s\S]*?<OpeningProjection\s+mascot="dash"[\s\S]*?<\/div>/,
    'mobile owners must be siblings of mascot wrappers, not descendants',
  );
  assert.match(opening, /data-opening-mobile-projection/);
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*?\.opening-mascot \.opening-projector\s*\{[^}]*display:\s*none/s);
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*?\.opening-mobile-projections\s*\{[^}]*display:\s*block/s);
  assert.match(css, /\.opening-mobile-projections \.opening-projector\s*\{[^}]*left:\s*var\(--mobile-projection-left/s);
});

test('opening.css defines space animations and transition constraints', () => {
  const css = fs.readFileSync(openingCssPath, 'utf8');

  assert.match(css, /spaceWarpIn/, 'Must define space warp in keyframe animation');
  assert.match(css, /spaceWarpOut/, 'Must define space warp out keyframe animation');
  assert.match(css, /spaceFloat/, 'Must define space float animation');
  assert.match(css, /transition:\s*opacity\s*280ms/, 'Opening transition duration must be within budget');
  assert.match(css, /width:\s*min\(1200px,\s*100vw,\s*125vh\)/, 'Opening globe must use the 1200px reference frame');
});

test('Aero robot mascot includes high-definition robot design features', () => {
  const jsx = fs.readFileSync(aeroJsxPath, 'utf8');

  assert.match(jsx, /aeroHaloGrad|Halo/, 'Must include glowing halo ring');
  assert.match(jsx, /aeroBodyGrad|Titanium|Obsidian/, 'Must include titanium / obsidian sphere shading');
  assert.match(jsx, /aeroEarGrad|Ear/, 'Must include cybernetic ear pods');
  assert.match(jsx, /aeroVisorGrad|Visor/, 'Must include glass visor face');
  assert.match(jsx, /Hx313/, 'Must include Hx313 insignia');
  assert.match(jsx, /aeroGlow/, 'Must include intense cyber glow filter');
});

test('opening projections are hand-attached and mascot-specific', () => {
  const opening = fs.readFileSync(openingJsxPath, 'utf8');
  const projection = fs.readFileSync(projectionPath, 'utf8');
  const dash = fs.readFileSync(dashPath, 'utf8');
  const aero = fs.readFileSync(aeroJsxPath, 'utf8');

  assert.match(projection, /data-opening-emitter/);
  assert.match(projection, /data-opening-projection/);
  assert.match(projection, /data-opening-frame/);
  assert.match(projection, /data-opening-copy/);
  assert.match(projection, /opening-projection--dash/);
  assert.match(projection, /opening-projection--aero/);
  assert.match(dash, /data-opening-arm="dash"/);
  assert.match(aero, /data-opening-arm="aero"/);
  assert.match(
    opening,
    /data-opening-mascot="aero"[\s\S]*?<AeroMascot[\s\S]*?<OpeningProjection\s+mascot="aero"[\s\S]*?<\/div>[\s\S]*?data-opening-mascot="dash"/,
    'Aero projection must be nested inside the Aero mascot wrapper',
  );
  assert.match(
    opening,
    /data-opening-mascot="dash"[\s\S]*?<DashMascot[\s\S]*?<OpeningProjection\s+mascot="dash"[\s\S]*?<\/div>/,
    'Dash projection must be nested inside the Dash mascot wrapper',
  );
});

test('OpeningExperience uses one anime timeline with lifecycle safeguards', () => {
  const jsx = fs.readFileSync(openingJsxPath, 'utf8');

  assert.match(jsx, /createTimeline/);
  assert.match(jsx, /OPENING_BEATS/);
  assert.match(jsx, /visibilitychange/);
  assert.match(jsx, /prefers-reduced-motion/);
  assert.match(jsx, /timeline\.pause\(\)/);
  assert.match(jsx, /timeline\.resume\(\)/);
  assert.match(jsx, /timeline\.revert\(\)|timeline\.cancel\(\)/);
  assert.doesNotMatch(jsx, /setPhase/);
  assert.doesNotMatch(jsx, /setStatementIndex/);
});

test('anime owns animated globe transforms without competing CSS keyframes', () => {
  const css = fs.readFileSync(openingCssPath, 'utf8');

  assert.match(css, /\.opening-network-globe svg\s*\{[^}]*animation:\s*globeBreath/s);
  assert.doesNotMatch(css, /\.opening-network-globe\s*\{[^}]*animation:\s*globeBreath/s);
  assert.doesNotMatch(css, /\.opening-network-routes \.opening-network-core\s*\{[^}]*animation:\s*corePulse/s);
  assert.match(css, /\.opening-network-routes \.opening-network-core--inner\s*\{[^}]*animation:\s*corePulse/s);
});

test('the globe rotor continuously turns like the dashboard globe', () => {
  const globe = fs.readFileSync(openingGlobePath, 'utf8');
  const css = fs.readFileSync(openingCssPath, 'utf8');

  assert.match(globe, /className="opening-globe-rotor"[^>]*data-globe-rotation/);
  assert.match(css, /\.opening-globe-rotor\s*\{[^}]*animation:\s*openingGlobeSpin\s+38s\s+linear\s+infinite/s);
  assert.match(css, /@keyframes openingGlobeSpin\s*\{[^}]*rotate\(360deg\)/s);
  assert.match(css, /\.opening-globe-rotor[\s\S]*animation:\s*none\s*!important/);
});

test('opening-only mascot wrappers contain focus and reduced motion keeps them in front', () => {
  const jsx = fs.readFileSync(openingJsxPath, 'utf8');
  const css = fs.readFileSync(openingCssPath, 'utf8');

  assert.match(jsx, /data-opening-mascot="aero"[^>]*inert=""/);
  assert.match(jsx, /data-opening-mascot="dash"[^>]*inert=""/);
  assert.match(css, /\.opening\[data-motion='reduced'\] \.opening-mascot\s*\{[^}]*z-index:\s*var\(--layer-mascot\)/s);
});

test('mascots keep a padded left and right lane with softened travel timing', () => {
  const jsx = fs.readFileSync(openingJsxPath, 'utf8');
  const css = fs.readFileSync(openingCssPath, 'utf8');

  assert.match(css, /\.opening-mascot--aero\s*\{\s*left:\s*20%/);
  assert.match(css, /\.opening-mascot--dash\s*\{\s*left:\s*80%/);
  assert.match(jsx, /createTimeline\(\{ defaults: \{ ease: 'outCubic' \} \}\)/);
  assert.match(jsx, /duration: 1_520, delay: stagger\(120\)/);
});

test('mobile projections remain absolute and share a viewport-aligned start edge', () => {
  const css = fs.readFileSync(openingCssPath, 'utf8');

  assert.doesNotMatch(css, /@media \(max-width: 600px\)[\s\S]*?\.opening-projector\s*\{[^}]*position:\s*fixed/);
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*?\.opening-projector\s*\{[^}]*position:\s*absolute[^}]*top:\s*135%[^}]*width:\s*90vw/s);
  assert.match(css, /\.opening-projector--aero\s*\{[^}]*left:\s*calc\(-17vw \+ 50%\)/s);
  assert.match(css, /\.opening-projector--dash\s*\{[^}]*left:\s*calc\(-64vw \+ 50%\)/s);
});
