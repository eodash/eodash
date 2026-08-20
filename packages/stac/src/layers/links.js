import log from "loglevel";
import { extractRoles, isBaseLayerOrOverlay } from "../helpers/assets.js";
import { handleAuthenticationOfLink } from "../helpers/auth.js";
import { createHTTPInstance } from "../http.js";
import {
  createLayerConfigHelpers,
  fetchRasterForm,
} from "../helpers/layer-config.js";
import { createLayerID } from "../helpers/layers.js";
import {
  getProjectionCode,
  resolveTmsByProjection,
  tmsToTileGridOptions,
} from "../helpers/projection.js";
import { applyTitilerUpscaling } from "../helpers/renders.js";
import {
  addTooltipInteraction,
  extractEoxLegendLink,
  resolveStyle,
} from "../helpers/style.js";

/**
 * @param {string} collectionId
 * @param {string} title
 * @param {import("../types").EodashItem} item
 * @param {Record<string,any>} [layerDatetime]
 * @param {object | null} [extraProperties]
 * @param {import("../types").EodashCollection} [collection]
 * @param {object} [options]
 * @param {string} [options.viewProjection] - the map view's projection, which the compare map follows
 * @param {Record<string, any> | null} [options.tileMatrixSets] - tile matrix set definitions keyed by id
 * @param {Array<string | { url: string; titilerVersion?: 1 | 2; scaleFactor?: number }>} [options.upscalingEndpoints] - titiler endpoints that serve upscaled tiles
 * @param {import("../http.js").HttpClient} [options.http] reads every url this needs
 * @param {import("../types").LayerConfigHelpers} [options.layerConfigHelpers] restores what the collection's config editors held onto the rebuilt layers
 * @returns {Promise<{ layers: import("../types").EoxLayer[], projections: import("../types").Projection[] }>} the projections come back with the layers, for the caller to register before they are assigned
 */
export const createLayersFromLinks = async (
  collectionId,
  title,
  item,
  layerDatetime,
  extraProperties,
  collection,
  options = {},
) => {
  const {
    viewProjection,
    tileMatrixSets = null,
    upscalingEndpoints = [],
    http = createHTTPInstance(),
    layerConfigHelpers = createLayerConfigHelpers(),
  } = options;
  const { extractLayerConfig, applyRasterFormValue } = layerConfigHelpers;
  log.debug("Creating layers from links");
  /** @type {import("../types").EoxLayer[]} */
  const jsonArray = [];
  /** @type {import("../types").Projection[]} */
  const projections = [];
  const wmsArray = item.links.filter(isWMSLink);
  const wmtsArray = item.links.filter(isWMTSLink);
  const xyzArray = item.links.filter(isXYZLink);
  const vectorTileArray = item.links.filter(isVectorTileLink);
  const mapboxStyleDocumentArray = item.links.filter(isMapboxStyleDocumentLink);
  // An xyz link takes precedence over a tilejson link
  const tilejsonArray = xyzArray.length
    ? []
    : item.links.filter(isTileJSONLink);
  // Taking projection code from main map view, as main view defines
  // projection for comparison map
  const viewProjectionCode = viewProjection || "EPSG:3857";

  /**
   * Forms already read, keyed by whatever stated them.
   *
   * @type {Map<string | import("../types").RasterForm | undefined, Promise<import("../types").EodashRasterJSONForm | undefined>>}
   */
  const rasterForms = new Map();
  /**
   * The form a link's config editor is built from: its own when it states one,
   * else the item's, else the collection's. Links resolving to the same source
   * share one read.
   *
   * @param {import("../types").WebMapLink} link
   */
  const resolveRasterForm = (link) => {
    const source =
      link["eodash:rasterform"] ||
      item?.["eodash:rasterform"] ||
      collection?.["eodash:rasterform"];
    const form = rasterForms.get(source) ?? fetchRasterForm(source, http, item);
    rasterForms.set(source, form);
    return form;
  };

  for (const wmsLink of wmsArray ?? []) {
    // Registering setting sub wms link projection
    const wmsLinkProjection =
      wmsLink?.["proj:epsg"] || wmsLink?.["eodash:proj4_def"];

    if (wmsLinkProjection) {
      projections.push(wmsLinkProjection);
    }

    const linkProjectionCode =
      getProjectionCode(wmsLinkProjection) || "EPSG:4326";
    // Projection code need to be based on map view projection to make sure
    // tiles are reloaded when changing projection
    const linkId = createLayerID(
      collectionId,
      item.id,
      wmsLink,
      viewProjectionCode,
    );
    // base layers and overlays are built without a layerConfig
    const isBaseOrOverlay = isBaseLayerOrOverlay(wmsLink);
    const rasterForm = isBaseOrOverlay
      ? undefined
      : await resolveRasterForm(wmsLink);
    let { layerConfig } = extractLayerConfig({}, rasterForm, "tileUrl");

    log.debug("WMS Layer added", linkId);
    const tileSize = /** @type {number[]} */ (
      "wms:tilesize" in wmsLink
        ? [wmsLink["wms:tilesize"], wmsLink["wms:tilesize"]]
        : [512, 512]
    );
    let json = {
      /** @type {"Tile"} */
      type: "Tile",
      properties: {
        id: linkId,
        title: wmsLink.title || title || item.id,
        ...(!!layerDatetime && { layerDatetime }),
        ...(!!layerConfig && { layerConfig }),
      },
      source: {
        /** @type {"TileWMS"} */
        type: "TileWMS",
        url: wmsLink.href,
        projection: linkProjectionCode,
        tileGrid: {
          tileSize,
        },
        ...(wmsLink.attribution ? { attributions: wmsLink.attribution } : {}),
        params: {
          LAYERS: wmsLink["wms:layers"],
          TILED: true,
        },
      },
    };
    if (isBaseOrOverlay) {
      // @ts-expect-error no type for eox-map
      json.preload = Infinity;
    }
    if ("wms:version" in wmsLink) {
      // @ts-expect-error no type for eox-map
      json.source.params["VERSION"] = wmsLink["wms:version"];
    }
    extractRoles(json.properties, wmsLink);
    if ("wms:dimensions" in wmsLink) {
      // Expand all dimensions into the params attribute
      Object.assign(json.source.params, wmsLink["wms:dimensions"]);
    }
    if ("wms:styles" in wmsLink) {
      // @ts-expect-error no type for eox-map
      json.source.params["STYLES"] = wmsLink["wms:styles"];
    }
    if (extraProperties !== null) {
      json.properties = {
        ...json.properties,
        ...extraProperties,
        ...extractEoxLegendLink(wmsLink),
      };
    }
    applyRasterFormValue(json);
    // @ts-expect-error eox-map converts a plain tileGrid, ol's types want an instance
    jsonArray.push(json);
  }

  for (const wmtsLink of wmtsArray ?? []) {
    // Registering setting sub wmts link projection

    const wmtsLinkProjection =
      wmtsLink?.["proj:epsg"] || wmtsLink?.["eodash:proj4_def"];

    if (wmtsLinkProjection) {
      projections.push(wmtsLinkProjection);
    }

    // base layers and overlays are built without a layerConfig
    const rasterForm = isBaseLayerOrOverlay(wmtsLink)
      ? undefined
      : await resolveRasterForm(wmtsLink);
    const { layerConfig } = extractLayerConfig({}, rasterForm, "tileUrl");
    const linkProjectionCode = getProjectionCode(
      wmtsLinkProjection || "EPSG:3857",
    );
    let json;
    const linkId = createLayerID(
      collectionId,
      item.id,
      wmtsLink,
      viewProjectionCode,
    );
    const dimensions = /** @type { {style:any} & Record<string,any> } */ (
      wmtsLink["wmts:dimensions"] || {}
    );
    let { style, matrixSet, ...dimensionsWithoutStyle } = { ...dimensions };
    let extractedStyle = /** @type { string } */ (style || "default");

    log.debug("WMTS Layer from capabilities added", linkId);

    json = {
      /** @type {"Tile"} */
      type: "Tile",
      properties: {
        id: linkId,
        title: wmtsLink.title || title || item.id,
        layerDatetime,
        ...(layerConfig && { layerConfig }),
      },
      source: {
        /** @type {"WMTSCapabilities"} */
        type: "WMTSCapabilities",
        url: buildCapabilitiesUrl(wmtsLink.href),
        // @ts-expect-error eox-map's WMTSCapabilities source takes `layer`, its published type does not
        layer: wmtsLink["wmts:layer"],
        projection: linkProjectionCode,
        style: extractedStyle,
        ...(matrixSet ? { matrixSet } : {}),
        ...(wmtsLink.attribution ? { attributions: wmtsLink.attribution } : {}),
        dimensions: dimensionsWithoutStyle,
      },
    };
    extractRoles(json.properties, wmtsLink);
    if (extraProperties !== null) {
      json.properties = {
        ...json.properties,
        ...extraProperties,
        ...extractEoxLegendLink(wmtsLink),
      };
    }
    applyRasterFormValue(json);
    jsonArray.push(json);
  }

  for (const xyzLink of xyzArray ?? []) {
    const xyzLinkProjection =
      xyzLink?.["proj:epsg"] || xyzLink?.["eodash:proj4_def"];
    // base layers and overlays are built without a layerConfig
    const isBaseOrOverlay = isBaseLayerOrOverlay(xyzLink);
    const rasterForm = isBaseOrOverlay
      ? undefined
      : await resolveRasterForm(xyzLink);
    let { layerConfig } = extractLayerConfig({}, rasterForm, "tileUrl");
    if (xyzLinkProjection) {
      projections.push(xyzLinkProjection);
    }
    const projectionCode = getProjectionCode(xyzLinkProjection || "EPSG:3857");
    const linkId = createLayerID(
      collectionId,
      item.id,
      xyzLink,
      viewProjectionCode,
    );
    let xyzUrl = xyzLink.href;
    const upscaling = applyTitilerUpscaling(xyzUrl, upscalingEndpoints);
    if (upscaling) {
      xyzUrl = upscaling.url;
    }

    // Add sharding for s2maps automatically
    if (xyzUrl.includes("s2maps-tiles.eu")) {
      xyzUrl = xyzUrl.replace("s2maps-tiles.eu", "{a-e}.s2maps-tiles.eu");
    }

    log.debug("XYZ Layer added", linkId);
    let json = {
      /** @type {"Tile"} */
      type: "Tile",
      properties: {
        id: linkId,
        title: xyzLink.title || title || item.id,
        roles: xyzLink.roles,
        layerDatetime,
        ...(layerConfig && { layerConfig }),
      },
      source: {
        /** @type {"XYZ"} */
        type: "XYZ",
        url: xyzUrl,
        projection: projectionCode,
        ...(xyzLink.attribution ? { attributions: xyzLink.attribution } : {}),
      },
    };

    const tms = resolveTmsByProjection(projectionCode, tileMatrixSets);
    const tileSize = upscaling ? 512 : 256;
    // @ts-expect-error tileGrid supported in eox-map
    json.source.tileGrid = {
      tileSize: [tileSize, tileSize],
    };
    if (tms) {
      const tmsOptions = tmsToTileGridOptions(tms, [tileSize, tileSize]);
      // @ts-expect-error tileGrid supported in eox-map
      json.source.tileGrid = {
        // @ts-expect-error tileGrid supported in eox-map
        ...json.source.tileGrid,
        ...tmsOptions,
      };
    }
    if (isBaseOrOverlay) {
      // @ts-expect-error no type for eox-map
      json.preload = Infinity;
    }

    extractRoles(json.properties, xyzLink);
    if (extraProperties !== null) {
      json.properties = {
        ...json.properties,
        ...extraProperties,
        ...extractEoxLegendLink(xyzLink),
      };
    }
    applyRasterFormValue(json);
    jsonArray.push(json);
  }

  for (const tilejsonLink of tilejsonArray) {
    // The tilejson href is a complete URL with the render params baked in by the
    // STAC producer; fetch it and use its `tiles[0]` template as an XYZ source.
    const tileJSON = await http.get(tilejsonLink.href).catch((err) => {
      console.error("[eodash] Failed to fetch item TileJSON", err);
      return null;
    });
    if (!tileJSON?.tiles?.[0]) {
      console.warn(
        "[eodash] No tile URL in item TileJSON response",
        tilejsonLink.href,
      );
      continue;
    }
    // Only raster XYZ tiles are supported; skip vector & TMS scheme TileJSON
    if (tileJSON.vector_layers || tileJSON.scheme === "tms") {
      console.warn(
        "[eodash] Unsupported TileJSON (only raster XYZ is supported)",
        tilejsonLink.href,
      );
      continue;
    }

    const tilejsonProjection =
      tilejsonLink?.["proj:epsg"] || tilejsonLink?.["eodash:proj4_def"];
    if (tilejsonProjection) {
      projections.push(tilejsonProjection);
    }
    const projectionCode = getProjectionCode(tilejsonProjection || "EPSG:3857");
    // base layers and overlays are built without a layerConfig
    const rasterForm = isBaseLayerOrOverlay(tilejsonLink)
      ? undefined
      : await resolveRasterForm(tilejsonLink);
    const { layerConfig } = extractLayerConfig({}, rasterForm, "tileUrl");
    const linkId = createLayerID(
      collectionId,
      item.id,
      tilejsonLink,
      viewProjectionCode,
    );

    log.debug("TileJSON layer added", linkId);
    /** @type {Record<string, any>} */
    const json = {
      /** @type {"Tile"} */
      type: "Tile",
      properties: {
        id: linkId,
        title: tilejsonLink.title || title || item.id,
        roles: tilejsonLink.roles,
        layerDatetime,
        ...(layerConfig && { layerConfig }),
      },
      source: {
        /** @type {"XYZ"} */
        type: "XYZ",
        ...(tileJSON.tiles.length > 1
          ? { urls: tileJSON.tiles }
          : { url: tileJSON.tiles[0] }),
        projection: projectionCode,
        // Link attribution wins; the TileJSON document's own is the fallback.
        ...(tilejsonLink.attribution || tileJSON.attribution
          ? {
              attributions: tilejsonLink.attribution || tileJSON.attribution,
            }
          : {}),
      },
    };
    if (Number.isFinite(tileJSON.minzoom)) json.minZoom = tileJSON.minzoom;
    if (Number.isFinite(tileJSON.maxzoom)) json.maxZoom = tileJSON.maxzoom;

    extractRoles(json.properties, tilejsonLink);
    if (extraProperties !== null) {
      json.properties = {
        ...json.properties,
        ...extraProperties,
        ...extractEoxLegendLink(tilejsonLink),
      };
    }
    applyRasterFormValue(json);
    // @ts-expect-error json is a Record so minZoom/maxZoom can be assigned onto it
    jsonArray.push(json);
  }

  for (const vectorTileLink of vectorTileArray ?? []) {
    const vectorTileLinkProjection =
      vectorTileLink?.["proj:epsg"] || vectorTileLink?.["eodash:proj4_def"];

    if (vectorTileLinkProjection) {
      projections.push(vectorTileLinkProjection);
    }
    const projectionCode = getProjectionCode(
      vectorTileLinkProjection || "EPSG:3857",
    );
    const linkId = createLayerID(
      collectionId,
      item.id,
      vectorTileLink,
      viewProjectionCode,
    );
    log.debug("Vector Tile Layer added", linkId);
    const key =
      /** @type {string | undefined} */ (vectorTileLink["key"]) || undefined;
    // fetch styles and separate them by their mapping between links and assets
    const styles = await resolveStyle(item, collection, http, key);
    // get the correct style which is not attached to a link
    let { layerConfig, style } = extractLayerConfig(styles);

    let href = vectorTileLink.href;
    if ("auth:schemes" in item && "auth:refs" in vectorTileLink) {
      const { url } = handleAuthenticationOfLink(
        item,
        vectorTileLink,
        undefined,
      );
      href = url;
    }
    const json = {
      /** @type {"VectorTile"} */
      type: "VectorTile",
      declutter: true,
      properties: {
        id: linkId,
        title: vectorTileLink.title || title || item.id,
        roles: vectorTileLink.roles,
        layerDatetime,
        ...(layerConfig &&
          !isBaseLayerOrOverlay(vectorTileLink) && {
            layerConfig: {
              ...layerConfig,
              style,
            },
          }),
      },
      source: {
        /** @type {"VectorTile"} */
        type: "VectorTile",
        format: {
          /** @type {"MVT"} */
          type: "MVT",
          idProperty: vectorTileLink.idProperty,
          layers: vectorTileLink.layers,
        },
        url: href,
        projection: projectionCode,
        ...(vectorTileLink.attribution
          ? { attributions: vectorTileLink.attribution }
          : {}),
      },
      interactions: [],
      ...(!style?.variables && { style }),
    };
    addTooltipInteraction(json, style);
    extractRoles(json.properties, vectorTileLink);
    if (extraProperties !== null) {
      json.properties = {
        ...json.properties,
        ...extraProperties,
        ...extractEoxLegendLink(vectorTileLink),
      };
    }
    jsonArray.push(json);
  }

  for (const mapboxStyleDocumentLink of mapboxStyleDocumentArray ?? []) {
    const mapboxStyleDocumentLinkProjection =
      mapboxStyleDocumentLink?.["proj:epsg"] ||
      mapboxStyleDocumentLink?.["eodash:proj4_def"];

    if (mapboxStyleDocumentLinkProjection) {
      projections.push(mapboxStyleDocumentLinkProjection);
    }
    const projectionCode = getProjectionCode(
      mapboxStyleDocumentLinkProjection || "EPSG:3857",
    );
    const linkId = createLayerID(
      collectionId,
      item.id,
      mapboxStyleDocumentLink,
      viewProjectionCode,
    );
    log.debug("Mapbox Style Document Layer added", linkId);

    let href = mapboxStyleDocumentLink.href;
    let applyOptions = mapboxStyleDocumentLink?.applyOptions || {};
    if ("auth:schemes" in item && "auth:refs" in mapboxStyleDocumentLink) {
      const { url, optionsObject } = handleAuthenticationOfLink(
        item,
        mapboxStyleDocumentLink,
        applyOptions,
      );
      applyOptions = optionsObject ?? applyOptions;
      href = url;
    }
    const json = {
      /** @type {"MapboxStyle"} */
      type: "MapboxStyle",
      properties: {
        id: linkId,
        title: mapboxStyleDocumentLink.title || title || item.id,
        roles: mapboxStyleDocumentLink.roles,
        layerDatetime,
        mapboxStyle: href,
        projection: projectionCode,
        ...(mapboxStyleDocumentLink.attribution
          ? { attributions: mapboxStyleDocumentLink.attribution }
          : {}),
        applyOptions,
      },
      interactions: [],
    };
    extractRoles(json.properties, mapboxStyleDocumentLink);
    if (extraProperties !== null) {
      json.properties = {
        ...json.properties,
        ...extraProperties,
        ...extractEoxLegendLink(mapboxStyleDocumentLink),
      };
    }
    // @ts-expect-error eox-map's MapboxStyle layer carries applyOptions, its published type does not
    jsonArray.push(json);
  }

  return { layers: jsonArray, projections };
};
/**
 * Build a WMTS GetCapabilities URL from a base endpoint URL.
 * If the URL already points to a capabilities document, return as-is.
 *
 * @param {string} href
 * @returns {string}
 */
function buildCapabilitiesUrl(href) {
  if (href.includes("GetCapabilities") || href.endsWith(".xml")) {
    return href;
  }
  const url = new URL(href);
  url.searchParams.set("service", "WMTS");
  url.searchParams.set("request", "GetCapabilities");
  return url.toString();
}

/**
 * @param {import("../types").EodashLink} link
 * @returns {link is import("../types").WMSLink}
 */
function isWMSLink(link) {
  return link.rel === "wms";
}

/**
 * @param {import("../types").EodashLink} link
 * @returns {link is import("../types").WMTSLink}
 */
function isWMTSLink(link) {
  return link.rel === "wmts";
}

/**
 * @param {import("../types").EodashLink} link
 * @returns {link is import("../types").XYZLink}
 */
function isXYZLink(link) {
  return link.rel === "xyz";
}

/**
 * @param {import("../types").EodashLink} link
 * @returns {link is import("../types").TileJSONLink}
 */
function isTileJSONLink(link) {
  return link.rel === "tilejson";
}

/**
 * @param {import("../types").EodashLink} link
 * @returns {link is import("../types").VectorTileLink}
 */
function isVectorTileLink(link) {
  return link.rel === "vector-tile";
}

/**
 * @param {import("../types").EodashLink} link
 * @returns {link is import("../types").MapboxStyleDocumentLink}
 */
function isMapboxStyleDocumentLink(link) {
  return link.rel === "mapbox-style-document";
}
