/**
 * Standardizes a projection input into a string identifier.
 * Supports EPSG numbers, raw strings, or projection objects.
 *
 * @param {string|number|{name: string, def: string}} [projection]
 * @returns {string}
 */
export const getProjectionCode = (projection) => {
  let code = projection;
  switch (typeof projection) {
    case "number":
      code = `EPSG:${projection}`;
      break;
    case "string":
      code = projection;
      break;
    case "object":
      code = projection?.name;
  }
  return /** @type {string} */ (code);
};

/**
 * Extracts the projection code from a STAC item, link, or asset.
 * Checks modern `proj:code` first, falling back to `proj:epsg` or `eodash:proj4_def`.
 *
 * @param {import("../types").STACCollection | import("../types").STACItem | import("../types").STACAsset | import("../types").STACLink | { "proj:code"?: string, "proj:epsg"?: number | null, "eodash:proj4_def"?: import("../types").Projection, "eodash:mapProjection"?: import("../types").Projection } | Record<string, any> | undefined | null} [source]
 * @returns {import("../types").Projection | undefined}
 */
export const getProjection = (source) =>
  source?.["eodash:mapProjection"] ||
  source?.["proj:code"] ||
  source?.["proj:epsg"] ||
  source?.["eodash:proj4_def"] ||
  undefined;

/**
 * Resolves a TileMatrixSet definition by projection code.
 * @param {string} projectionCode - e.g. "EPSG:3857"
 * @param {Record<string, any> | null} customRegistry - registry with tileset to definition mappings
 * @returns {Record<string, any> | undefined}
 */
export function resolveTmsByProjection(projectionCode, customRegistry) {
  if (!projectionCode || !customRegistry) return undefined;
  const code = projectionCode.toUpperCase();

  const tmsEntries = Object.values(customRegistry);

  for (const tms of tmsEntries) {
    const crs = tms.crs || "";
    if (
      crs.includes(code) ||
      (code.startsWith("EPSG:") &&
        (crs.endsWith(`/${code.split(":")[1]}`) ||
          crs.includes(`::${code.split(":")[1]}`)))
    ) {
      return tms;
    }
  }
  return undefined;
}

/**
 * Converts a OGC TileMatrixSet definition to OpenLayers TileGrid options.
 * @param {Record<string, any>} tms - The TileMatrixSet JSON definition
 * @param {[number, number]} [targetTileSize] - Optional target tile size for upscaling
 * @returns {Record<string, any>}
 */
export function tmsToTileGridOptions(tms, targetTileSize = [512, 512]) {
  if (!tms?.tileMatrices?.length) {
    return {};
  }
  const firstMatrix = tms.tileMatrices[0];
  let origin = firstMatrix.pointOfOrigin;
  let resolutions = tms.tileMatrices.map((/** @type {any} */ m) => m.cellSize);
  const matrixIds = tms.tileMatrices.map((/** @type {any} */ m) => m.id);
  const originalTileWidth = firstMatrix.tileWidth;
  const originalTileHeight = firstMatrix.tileHeight;

  const isNE = ["N", "Lat", "Y"].includes(tms.orderedAxes?.[0]);
  if (isNE) {
    // Swap origin to [E, N] for OpenLayers
    origin = [origin[1], origin[0]];
  }

  let tileSize = [originalTileWidth, originalTileHeight];

  if (targetTileSize) {
    const scale = targetTileSize[0] / originalTileWidth;
    resolutions = resolutions.map((/** @type {any} */ r) => r / scale);
    tileSize = targetTileSize;
  }

  const sizeX =
    firstMatrix.matrixWidth * originalTileWidth * firstMatrix.cellSize;
  const sizeY =
    firstMatrix.matrixHeight * originalTileHeight * firstMatrix.cellSize;

  // Assumes topLeft origin and Y increases upwards
  const extent = [origin[0], origin[1] - sizeY, origin[0] + sizeX, origin[1]];

  return {
    origin,
    resolutions,
    matrixIds,
    tileSize,
    extent,
  };
}
