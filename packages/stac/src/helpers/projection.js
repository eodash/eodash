import log from "loglevel";

/**
 * Return projection code which is to be registered in `eox-map`
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
 * The projection an item, link or asset states, however it spells it.
 * `proj:code` is what the projection extension reads since v1.2, where
 * `proj:epsg` was deprecated; v2.0 dropped it.
 *
 * @param {{ "proj:code"?: string, "proj:epsg"?: number | null, "eodash:proj4_def"?: import("../types").Projection } | undefined | null} source
 * @returns {import("../types").Projection | undefined}
 */
export const getProjection = (source) =>
  source?.["proj:code"] ||
  source?.["proj:epsg"] ||
  source?.["eodash:proj4_def"] ||
  undefined;

/**
 * Assigns projection code to the layer ID
 * @param {import("../types").EodashItem} item
 * @param {import("../types").EodashLink | import("../types").EodashAsset} linkOrAsset
 * @param {string} id - {@link createLayerID} & {@link extractRoles}
 * @param {{ properties:{id:string}  & Record<string, any> }& Record<string,any>} layer
 * @returns
 */
export function assignProjID(item, linkOrAsset, id, layer) {
  const indicatorProjection =
    /** @type { string | undefined} */
    (item?.["proj:epsg"]) ||
    /** @type { {name?: string} | undefined} */
    (item?.["eodash:mapProjection"])?.name ||
    "EPSG:3857";

  const idArr = id.split(";:;");

  idArr.pop();
  idArr.push(indicatorProjection);
  const updatedID = idArr.join(";:;");
  layer.properties.id = updatedID;

  log.debug("Updating layer id", updatedID);

  return updatedID;
}

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

  // Find first TMS that matches this projection
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

  // Handle axis order
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

  // Calculate extent based on Level 0 grid dimensions
  const sizeX =
    firstMatrix.matrixWidth * originalTileWidth * firstMatrix.cellSize;
  const sizeY =
    firstMatrix.matrixHeight * originalTileHeight * firstMatrix.cellSize;

  // extent = [minX, minY, maxX, maxY]
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

/**
 *
 * @param {number[]} bbox
 * @returns
 */
export const sanitizeBbox = (bbox) => {
  if (!bbox || !bbox.length || bbox.length !== 4) {
    return [0, 0, 0, 0];
  }
  let [minX, minY, maxX, maxY] = bbox;
  // Normalize longitudes to be within -180 to 180
  minX = Math.max(((minX + 180) % 360) - 180, -180);
  maxX = Math.min(((maxX - 180) % 360) + 180, 180);
  // Normalize latitudes to be within -90 to 90
  minY = Math.max(((minY + 90) % 180) - 90, -90);
  maxY = Math.min(((maxY - 90) % 180) + 90, 90);

  return [minX, minY, maxX, maxY];
};
