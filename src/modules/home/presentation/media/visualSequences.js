const orbFrameModules = import.meta.glob('../../../../../assets/animation/*.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
});

const globeFrameModules = import.meta.glob('../../../../../assets/main_backgrund/*.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
});

function sortFrameEntries(frameModules) {
  return Object.entries(frameModules)
    .sort(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath, undefined, { numeric: true }))
    .map(([, frameUrl]) => frameUrl);
}

export const ORB_FRAMES = Object.freeze(sortFrameEntries(orbFrameModules));

const globeFrameUrls = sortFrameEntries(globeFrameModules);

// Keep the hero visually complete while the optional globe export is being
// added. The dedicated background sequence takes precedence as soon as it exists.
export const GLOBE_FRAMES = Object.freeze(
  globeFrameUrls.length > 0 ? globeFrameUrls : ORB_FRAMES.slice(-24),
);
