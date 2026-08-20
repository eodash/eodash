import {
  applyRasterFormValue,
  extractLayerConfig,
  fetchRasterForm,
} from "../helpers/layer-config.js";
import { createLayerID } from "../helpers/layers.js";
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
 * Implementation of a function that creates a layer from the render extention.
 * The projections it settled on come back with the layers, for the caller to
 * register before the layers are assigned.
 *
 * @param {string} rasterURL
 * @param {import("../types").EodashCollection | undefined | null} collection
 * @param {import("../types").EodashItem | undefined | null} item
 * @param {Record<string, any>} [extraProperties]
 * @param {string} [map] - which map the layers are built for
 * @param {object} [options]
 * @param {Record<string, Record<string, import("../types").Render>>} [options.renders] - renders the app config states, keyed by collection id, which win over the collection's own
 * @param {Record<string, any> | null} [options.tileMatrixSets] - tile matrix set definitions keyed by id
 * @param {import("../http.js").HttpClient} [options.http] reads every url this needs
 * @returns {Promise<{ layers: import("../types").EoxLayer[], projections: import("../types").Projection[] }>}
 */
export const createLayerFromRender = async (
  rasterURL,
  collection,
  item,
  extraProperties,
  map = "main",
  options = {},
) => {
  const {
    renders: configRenders,
    tileMatrixSets = null,
    http = createHTTPInstance(),
  } = options;
  /** @type {import("../types").Projection[]} */
  const projections = [];

  // config renders > collection STAC renders > item renders
  const renders = resolveRenders(collection, configRenders) ?? item?.renders;
  if (!collection || !item || !renders) {
    return { layers: [], projections };
  }

  // Yield to a raster xyz/tilejson link — createLayersFromLinks renders it.
  const hasMatchingTileLink = item.links?.some(
    (link) =>
      (link.rel === "xyz" || link.rel === "tilejson") &&
      link.href?.includes(rasterURL),
  );
  if (hasMatchingTileLink) {
    return { layers: [], projections };
  }

  const rasterForm = await fetchRasterForm(
    item?.["eodash:rasterform"] || collection?.["eodash:rasterform"],
    http,
    item,
  );
  let { layerConfig } = extractLayerConfig(
    collection.id,
    {},
    rasterForm,
    undefined,
    map,
  );

  /**
   * Resolves the first defined value of a property across a render's assets,
   * checking item assets before falling back to collection assets.
   * @param {import("../types").Render} render
   * @param {string} propertyName
   * @returns {any}
   */
  const getRenderAssetProperty = (render, propertyName) => {
    for (const assetKey of render.assets ?? []) {
      const asset = item?.assets?.[assetKey] ?? collection?.assets?.[assetKey];
      const value = asset?.[propertyName];
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  };

  const layers = [];

  for (const key in renders) {
    const title = renders[key].title;

    const expression =
      renders[key].expression ??
      getRenderAssetProperty(renders[key], "expression");

    const projection =
      renders[key].projection ??
      getRenderAssetProperty(renders[key], "projection") ??
      "EPSG:3857";

    const projectionCode = getProjectionCode(projection);
    projections.push(projection);

    const paramsObject = {
      // TiTiler treats assets and expression as mutually exclusive band selection
      assets: expression ? undefined : renders[key].assets,
      expression,
      nodata: normalizeNodata(
        renders[key].nodata ?? getRenderAssetProperty(renders[key], "nodata"),
      ),
      resampling:
        renders[key].resampling ??
        getRenderAssetProperty(renders[key], "resampling"),
      color_formula:
        renders[key].color_formula ??
        getRenderAssetProperty(renders[key], "color_formula"),
      colormap:
        renders[key].colormap ??
        getRenderAssetProperty(renders[key], "colormap"),
      colormap_name:
        renders[key].colormap_name ??
        getRenderAssetProperty(renders[key], "colormap_name"),
      rescale: normalizeRescale(
        renders[key].rescale ?? getRenderAssetProperty(renders[key], "rescale"),
      ),
      bidx: renders[key].bidx,
      tilesize: renders[key].tilesize,
    };
    const tms = resolveTmsByProjection(projectionCode, tileMatrixSets);
    const tmsId = tms?.id || "WebMercatorQuad";
    const paramsStr = encodeURLObject(paramsObject);
    const url = `${rasterURL}/collections/${collection.id}/items/${item.id}/tiles/${tmsId}/{z}/{x}/{y}?${paramsStr}`;
    const json = {
      /** @type {"Tile"} */
      type: "Tile",
      properties: {
        id: createLayerID(
          collection.id,
          item.id,
          { id: item.id, href: "", title, rel: "" },
          projectionCode,
        ),
        title,
        ...extraProperties,
        layerConfig: {
          ...layerConfig,
        },
      },
      source: {
        /** @type {"XYZ"} */
        type: "XYZ",
        url,
        projection: projectionCode,
      },
    };
    const tilesize = renders[key].tilesize || 512;
    if (tms) {
      const tmsOptions = tmsToTileGridOptions(tms, [tilesize, tilesize]);
      // @ts-expect-error tileGrid supported in eox-map
      json.source.tileGrid = tmsOptions;
    } else if (renders[key].tilesize) {
      // @ts-expect-error tileGrid is added here and supported in eox-map layer definition
      json.source.tileGrid = {
        tileSize: renders[key].tilesize,
      };
    }
    applyRasterFormValue(json, collection.id, map);
    layers.push(json);
  }

  return { layers, projections };
};
