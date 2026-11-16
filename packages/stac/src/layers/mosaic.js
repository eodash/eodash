import {
  createLayerConfigHelpers,
  fetchRasterForm,
} from "../helpers/layer-config.js";
import { LAYER_ID_SEPARATOR } from "../helpers/layers.js";
import {
  getProjectionCode,
  resolveTmsByProjection,
  tmsToTileGridOptions,
} from "../helpers/projection.js";
import {
  normalizeNodata,
  normalizeRescale,
  resolveRenders,
} from "../helpers/renders.js";
import { encodeURLObject } from "../helpers/url.js";
import { createHTTPInstance } from "../http.js";

/**
 * Creates the mosaic layer of a collection from its first render preset,
 * through the raster endpoint's collection TileJSON.
 *
 * @param {string} rasterURL
 * @param {import("../types").STACCollection} collection
 * @param {Record<string, string> | null} [query] - TileJSON query, e.g. `datetime` or a cql2 `filter`
 * @param {object} [options]
 * @param {Record<string, Record<string, import("../types").Render>>} [options.renders]
 * @param {Record<string, any> | null} [options.tileMatrixSets]
 * @param {import("../http.js").HttpClient} [options.http]
 * @param {import("../types").LayerConfigHelpers} [options.layerConfigHelpers]
 * @returns {Promise<{ layer?: import("@eox/map/src/layers").EOxLayerType<"Tile", "XYZ">, projection?: import("../types").Projection }>}
 */
export const createLayerFromMosaic = async (
  rasterURL,
  collection,
  query,
  options = {},
) => {
  const {
    renders: configRenders,
    tileMatrixSets = null,
    http = createHTTPInstance(),
    layerConfigHelpers = createLayerConfigHelpers(),
  } = options;
  const { extractLayerConfig, applyRasterFormValue } = layerConfigHelpers;

  const renders = resolveRenders(collection, configRenders);
  const preset = renders ? Object.values(renders)[0] : undefined;
  if (!preset) {
    console.warn(
      "[eodash] No render preset (collection `renders` nor `options.renders`) for the mosaic layer.",
    );
    return { layer: undefined, projection: undefined };
  }

  const projection = preset.projection ?? "EPSG:3857";
  const projectionCode = getProjectionCode(projection);

  const tms = resolveTmsByProjection(projectionCode, tileMatrixSets);
  const tmsId = tms?.id || "WebMercatorQuad";

  const renderParamsStr = encodeURLObject({
    // TiTiler treats assets and expression as mutually exclusive band selection
    assets: preset.expression ? undefined : preset.assets,
    expression: preset.expression,
    nodata: normalizeNodata(preset.nodata),
    resampling: preset.resampling,
    color_formula: preset.color_formula,
    colormap: preset.colormap,
    colormap_name: preset.colormap_name,
    rescale: normalizeRescale(preset.rescale),
  });

  const tileParams = new URLSearchParams({
    tilesize: `${preset.tilesize ?? "512"}`,
    ...query,
  });
  const tileJsonUrl = `${rasterURL}/collections/${collection.id}/${tmsId}/tilejson.json?${renderParamsStr}${tileParams.toString()}`;

  const tileJSON = await http.get(tileJsonUrl).catch((err) => {
    console.error("Failed to fetch mosaic TileJSON", err);
    return null;
  });
  if (!tileJSON?.tiles?.[0]) {
    console.warn("[eodash] No tile URL found in mosaic TileJSON response.");
    return { layer: undefined, projection: undefined };
  }

  const rasterForm = await fetchRasterForm(
    collection["eodash:rasterform"],
    http,
  );
  const { layerConfig } = extractLayerConfig({}, rasterForm);

  const layer = {
    /** @type {"Tile"} */
    type: "Tile",
    properties: {
      id: `${collection.id}${LAYER_ID_SEPARATOR}mosaic`,
      title: "Mosaic Layer",
      ...(layerConfig && { layerConfig }),
    },
    source: {
      /** @type {"XYZ"} */
      type: "XYZ",
      url: tileJSON.tiles[0],
      projection: projectionCode,
    },
  };
  const tileSize = preset.tilesize || 512;
  // @ts-expect-error tileGrid is added here and supported in eox-map layer definition
  layer.source.tileGrid = {
    tileSize,
  };
  if (tms) {
    const tmsOptions = tmsToTileGridOptions(tms, [tileSize, tileSize]);
    // @ts-expect-error tileGrid supported in eox-map
    layer.source.tileGrid = { ...layer.source.tileGrid, ...tmsOptions };
  }
  applyRasterFormValue(layer);
  return { layer, projection };
};
