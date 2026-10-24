/**
 * Calculates the center coordinates and zoom level for an EPSG:4326 bounding box.
 *
 * @param {number[]} bbox - `[minX, minY, maxX, maxY]` in EPSG:4326
 * @param {number[]} [size] - Viewport dimensions `[width, height]` in pixels
 * @returns {{ center: number[]; zoom: number }}
 */
export const bboxToCenterZoom = (
  [minX, minY, maxX, maxY],
  size = [800, 600],
) => {
  const WORLD = 256;
  /** @param {number} lat */
  const latRad = (lat) => {
    const sin = Math.sin((lat * Math.PI) / 180);
    const rad = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(rad, Math.PI), -Math.PI) / 2;
  };
  const latFraction = Math.max((latRad(maxY) - latRad(minY)) / Math.PI, 1e-9);
  const lngDiff = maxX - minX;
  // a bbox crossing the antimeridian has maxX < minX, so both the width and the
  // center have to be resolved the long way round
  const width = lngDiff < 0 ? lngDiff + 360 : lngDiff;
  const lngFraction = Math.max(width / 360, 1e-9);
  const zoom = Math.min(
    Math.log2(size[1] / WORLD / latFraction),
    Math.log2(size[0] / WORLD / lngFraction),
    20,
  );
  return {
    center: [((minX + width / 2 + 180) % 360) - 180, (minY + maxY) / 2],
    zoom: Math.max(0, Math.floor(zoom)),
  };
};

/**
 * Reprojects a lon/lat bbox into the view projection. A bbox crossing the
 * antimeridian has no single extent.
 *
 * @param {number[] | undefined} bbox - 2D or 3D, in EPSG:4326
 * @param {string | undefined} viewProjection
 * @param {import("../types").TransformExtent | undefined} transformExtent
 * @returns {number[] | undefined}
 */
export const bboxToViewExtent = (bbox, viewProjection, transformExtent) => {
  if (!transformExtent || !bbox) return undefined;
  const [west, south, east, north] =
    bbox.length === 6 ? [bbox[0], bbox[1], bbox[3], bbox[4]] : bbox;
  if (west > east) return undefined;
  return transformExtent(
    [west, south, east, north],
    "EPSG:4326",
    viewProjection || "EPSG:3857",
  );
};

/**
 * Normalizes bounding box coordinates within standard longitude (-180 to 180) and latitude (-90 to 90) limits.
 *
 * @param {number[]} bbox
 * @returns {number[]}
 */
export const sanitizeBbox = (bbox) => {
  if (!bbox || !bbox.length || bbox.length !== 4) {
    return [0, 0, 0, 0];
  }
  let [minX, minY, maxX, maxY] = bbox;
  minX = Math.max(((minX + 180) % 360) - 180, -180);
  maxX = Math.min(((maxX - 180) % 360) + 180, 180);
  minY = Math.max(((minY + 90) % 180) - 90, -90);
  maxY = Math.min(((maxY - 90) % 180) + 90, 90);

  return [minX, minY, maxX, maxY];
};
