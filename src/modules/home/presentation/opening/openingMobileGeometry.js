export const MOBILE_PROJECTION_WIDTH_RATIO = 0.9;
export const MOBILE_PROJECTION_INSET = 16;
export const MOBILE_PROJECTION_HEIGHT = 142;

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), Math.max(minimum, maximum));

/**
 * Resolve the external mobile projection's panel bounds in viewport coordinates.
 * The stage uses these values so the 90vw panel never inherits a mascot transform.
 */
export function getMobileProjectionBounds(viewportWidth, viewportHeight, panelHeight = MOBILE_PROJECTION_HEIGHT) {
  const width = Math.min(
    viewportWidth * MOBILE_PROJECTION_WIDTH_RATIO,
    Math.max(0, viewportWidth - (MOBILE_PROJECTION_INSET * 2)),
  );
  const left = clamp((viewportWidth - width) / 2, 0, viewportWidth - width);
  const top = clamp(
    viewportHeight * 0.66,
    MOBILE_PROJECTION_INSET,
    viewportHeight - panelHeight - MOBILE_PROJECTION_INSET,
  );

  return {
    left,
    top,
    width,
    right: left + width,
    bottom: top + panelHeight,
  };
}
