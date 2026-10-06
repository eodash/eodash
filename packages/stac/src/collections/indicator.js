import { createHTTPInstance } from "../http.js";
import { createEodashCollection } from "../index.js";
import {
  getIndicatorLayers,
  getObservationPointsLayer,
} from "../layers/collection.js";
import { extractCollectionUrls } from "../helpers/url.js";
import { getProjection, getProjectionCode } from "../helpers/projection.js";
import { bboxToCenterZoom, sanitizeBbox } from "../helpers/bbox.js";
import { applyVisibilityRoles } from "../helpers/layers.js";

/**
 * Deduplicates projections by name / code.
 * @param {import("../types").Projection[]} projList
 */
export const deduplicateProjections = (projList) => {
  const map = new Map();
  for (const p of projList) {
    const key = typeof p === "object" && p !== null ? p.name : p;
    if (key && !map.has(key)) {
      map.set(key, p);
    }
  }
  return Array.from(map.values());
};

/**
 * Builds data layers, observation points, and projections across multiple collection readers.
 *
 * @param {object} params
 * @param {import("../types").Reader[]} params.readers - STAC readers for layer generation
 * @param {import("../types").STACCollection} [params.stac] - STAC indicator collection
 * @param {string | import("../types").STACItem | Date} [params.timeOrItem] - Datetime or STAC item
 * @param {import("../types").BuildContext} [params.context] - Build context configuration
 * @param {import("../types").ObservationPointsThemes} [params.themes] - Observation points styling
 * @param {import("@eox/map").EoxLayer[]} [params.currentLayers] - Current map layers to preserve interactions
 * @returns {Promise<{ layers: import("@eox/map").EoxLayer[]; projections: import("../types").Projection[]; items: import("../types").STACItem[] }>}
 */
export const buildIndicatorDataLayers = async ({
  readers,
  stac,
  timeOrItem,
  context = {},
  themes,
  currentLayers = [],
}) => {
  const isItem =
    typeof timeOrItem === "object" &&
    timeOrItem !== null &&
    !(timeOrItem instanceof Date);

  const activeReaders = isItem
    ? readers.filter(
        (r) =>
          !(
            /** @type {import("../types").STACItem} */ (timeOrItem).collection
          ) ||
          r.stac?.id ===
            /** @type {import("../types").STACItem} */ (timeOrItem).collection,
      )
    : readers;

  const readerResults = await Promise.all(
    (activeReaders.length ? activeReaders : readers).map((reader) =>
      (isItem
        ? reader.buildLayers(
            /** @type {import("../types").STACItem} */ (timeOrItem),
            context,
          )
        : reader.getLayers(
            /** @type {string | Date | undefined} */ (timeOrItem),
            context,
          )
      ).then((built) => {
        built.layers.forEach((layer) => {
          if (!layer.properties?.layerControlExclusive) {
            // @ts-expect-error properties is optional upstream, always built here
            layer.properties.layerControlExpand = true;
            // @ts-expect-error properties is optional upstream, always built here
            layer.properties.layerControlToolsExpand = true;
          }
        });
        return built;
      }),
    ),
  );

  /** @type {import("@eox/map").EoxLayer[]} */
  const layers = [];
  /** @type {import("../types").Projection[]} */
  const projections = [];
  /** @type {import("../types").STACItem[]} */
  const items = [];

  for (const built of readerResults) {
    layers.push(...built.layers);
    projections.push(...built.projections);
    if (built.item) {
      items.push(built.item);
    }
  }

  applyVisibilityRoles(stac, layers);

  const observationPoints = getObservationPointsLayer(
    readers.map((reader) => reader.stac),
    { themes, currentLayers },
  );
  if (observationPoints) {
    layers.push(observationPoints);
  }

  return { layers, projections: deduplicateProjections(projections), items };
};

/**
 * Default fallback base layer (OpenStreetMap) when no baselayer links are provided by STAC.
 * @type {import("@eox/map").EoxLayer[]}
 */
export const DEFAULT_BASE_LAYERS = [
  {
    type: "Tile",
    properties: {
      id: "osm",
      title: "OpenStreetMap",
      group: "baselayer",
      visible: true,
      layerControlExclusive: true,
    },
    source: {
      type: "OSM",
    },
  },
];
/**
 * Normalizes baselayer visibility and exclusivity on a set of base layers.
 *
 * @param {import("@eox/map").EoxLayer[]} baseLayers
 * @param {import("@eox/map").EoxLayer[]} [fallbackBaseLayers]
 * @returns {import("@eox/map").EoxLayer[]}
 */
export const normalizeBaseLayers = (
  baseLayers,
  fallbackBaseLayers = DEFAULT_BASE_LAYERS,
) => {
  if (baseLayers.length) {
    let counter = 0;
    let lastPos = 0;
    for (let indx = 0; indx < baseLayers.length; indx++) {
      const bl = baseLayers[indx];
      // @ts-expect-error properties is optional upstream, always built here
      if (!("visible" in bl.properties)) {
        // @ts-expect-error properties is optional upstream, always built here
        bl.properties.visible = false;
      }

      // @ts-expect-error properties is optional upstream, always built here
      if (bl.properties.visible) {
        counter++;
        lastPos = indx;
      }
    }

    if (counter === 0) {
      // @ts-expect-error properties is optional upstream, always built here
      baseLayers[0].properties.visible = true;
    }

    if (counter > 0) {
      baseLayers.forEach((bl, indx) => {
        // @ts-expect-error properties is optional upstream, always built here
        bl.properties.visible = indx === lastPos;
      });
    }

    baseLayers.forEach((bl) => {
      // @ts-expect-error properties is optional upstream, always built here
      bl.properties.layerControlExclusive = true;
    });
    return baseLayers;
  }

  return [...fallbackBaseLayers];
};

/**
 * Default color palette assigned across STAC collections (Bank-Wong palette from templates/baseConfig.js).
 * @type {string[]}
 */
export const DEFAULT_COLLECTIONS_PALETTE = [
  "#009E73",
  "#E69F00",
  "#56B4E9",
  "#009E73",
  "#F0E442",
  "#0072B2",
  "#D55E00",
  "#CC79A7",
  "#994F00",
];

/**
 * Creates an indicator reader that coordinates multiple STAC collections,
 * combines base layers, data layers, observation points, and overlays,
 * and can produce complete EOxMap configurations.
 *
 * @param {string} url - Indicator collection URL or STAC API endpoint
 * @param {object} [options]
 * @param {boolean} [options.api] - Whether the collections use STAC API endpoints (autoinferred if omitted)
 * @param {string} [options.viewProjection] - Map view projection (autoinferred from stac if omitted, default "EPSG:3857")
 * @param {string[]} [options.colors] - Colors assigned across child collections
 * @param {import("../http.js").AxiosInstance} [options.client] - Custom HTTP client
 * @param {import("../types").STACCollection} [options.stac] - Pre-fetched STAC collection/indicator document
 * @param {string} [options.rasterEndpoint] - Base URL for raster tile rendering
 * @param {Array<string | { url: string; titilerVersion?: 1 | 2; scaleFactor?: number }>} [options.upscalingEndpoints] - Tile endpoints for high-res rendering
 * @param {Record<string, any> | null} [options.tileMatrixSets] - TileMatrixSet configurations
 * @param {Record<string, Record<string, import("../types").Render>>} [options.renders] - Render configurations
 * @param {import("../types").ObservationPointsThemes} [options.themes] - Marker styling for observation points
 * @returns {Promise<import("../types").IndicatorReader>}
 */
export const createEodashIndicator = async (url, options = {}) => {
  const {
    client,
    colors = DEFAULT_COLLECTIONS_PALETTE,
    rasterEndpoint,
    upscalingEndpoints,
    tileMatrixSets,
    renders,
    themes,
  } = options;

  const http = createHTTPInstance({ client });
  /** @type {import("../types").STACCollection} */
  const stac = options.stac ?? (await http.get(url));

  const viewProjection =
    options.viewProjection ||
    getProjectionCode(getProjection(stac)) ||
    "EPSG:3857";

  const isApi =
    options.api !== undefined
      ? options.api
      : url
        ? !url.split("?")[0].endsWith(".json")
        : false;

  const collectionUrls = extractCollectionUrls(stac, url);

  const palette =
    Array.isArray(colors) && colors.length
      ? colors
      : DEFAULT_COLLECTIONS_PALETTE;

  const readers = await Promise.all(
    collectionUrls.map((cu, idx) =>
      createEodashCollection(cu, {
        api: isApi,
        client,
        color: palette[idx % palette.length],
        viewProjection,
        ...(cu === url && { stac }),
        rasterEndpoint,
        upscalingEndpoints,
        tileMatrixSets,
        renders,
      }),
    ),
  );

  /**
   * Helper to build layers for a given datetime or item
   * @param {import("../types").Datetime | undefined} targetDatetime
   * @param {import("../types").STACItem | undefined} targetItem
   * @param {import("../types").BuildContext} [context]
   */
  const buildLayersInternal = async (
    targetDatetime,
    targetItem,
    context = {},
  ) => {
    let resolvedDate = targetDatetime;
    if (!targetItem && !resolvedDate) {
      const dates = await Promise.all(readers.map((r) => r.getDates()));
      const allDates = dates
        .flat()
        .map((d) => d.getTime())
        .sort((a, b) => a - b);
      if (allDates.length > 0) {
        const lastDate = allDates[allDates.length - 1];
        if (lastDate !== undefined) {
          resolvedDate = new Date(lastDate).toISOString();
        }
      }
    }

    const { layers: indicatorLayers, projections: indicatorProjections } =
      await getIndicatorLayers(stac, {
        client,
        viewProjection,
        tileMatrixSets,
        upscalingEndpoints,
      });

    const baseLayers = normalizeBaseLayers(
      indicatorLayers.filter((l) => l.properties?.group === "baselayer"),
    );
    const overLayers = indicatorLayers.filter(
      (l) => l.properties?.group === "overlay",
    );

    const dataResult = await buildIndicatorDataLayers({
      readers,
      stac,
      timeOrItem: targetItem ?? resolvedDate,
      context: { ...context, viewProjection },
      themes,
    });

    const allLayers = [...baseLayers, ...dataResult.layers, ...overLayers];

    return {
      layers: allLayers,
      projections: deduplicateProjections([
        ...indicatorProjections,
        ...dataResult.projections,
      ]),
      items: targetItem ? [targetItem] : dataResult.items,
      item: targetItem ?? dataResult.items[0],
      datetime: targetItem
        ? (targetItem.properties?.datetime ??
          targetItem.properties?.start_datetime ??
          undefined)
        : typeof resolvedDate === "string"
          ? resolvedDate
          : resolvedDate instanceof Date
            ? resolvedDate.toISOString()
            : undefined,
    };
  };

  return {
    id: stac.id,
    stac,
    projection: viewProjection,
    readers,

    /**
     * Aggregates and sorts all unique dates across all collections.
     *
     * @param {import("../types").Datetime} [datetime]
     * @param {import("../types").BBox} [bbox]
     * @returns {Promise<Date[]>}
     */
    getDates: async (datetime, bbox) => {
      const datesArrays = await Promise.all(
        readers.map((r) => r.getDates(datetime, bbox)),
      );
      const timeMap = new Map();
      for (const dates of datesArrays) {
        for (const d of dates) {
          timeMap.set(d.getTime(), d);
        }
      }
      return Array.from(timeMap.keys())
        .sort((a, b) => a - b)
        .map((t) => timeMap.get(t));
    },

    /**
     * Builds base layers, data layers from each reader, and overlays for the given datetime.
     *
     * @param {import("../types").Datetime} [datetime]
     * @param {import("../types").BuildContext} [context]
     * @returns {Promise<import("../types").BuiltLayers & { items: import("../types").STACItem[] }>}
     */
    getLayers: async (datetime, context = {}) => {
      return buildLayersInternal(datetime, undefined, context);
    },

    /**
     * Builds layers from a specific STAC item.
     *
     * @param {import("../types").STACItem} item
     * @param {import("../types").BuildContext} [context]
     * @returns {Promise<import("../types").BuiltLayers & { items: import("../types").STACItem[] }>}
     */
    buildLayers: async (item, context = {}) => {
      return buildLayersInternal(undefined, item, context);
    },

    /**
     * Builds complete EOxMap configuration including layers, center, zoom, and projections.
     *
     * @param {object} [configOptions]
     * @param {import("../types").Datetime} [configOptions.datetime]
     * @param {import("../types").STACItem} [configOptions.item]
     * @param {import("../types").BBox} [configOptions.bbox]
     * @param {import("../types").BuildContext} [configOptions.context]
     * @returns {Promise<import("../types").MapConfig & { timeControl?: { availableDates: string[], minDate?: string, maxDate?: string } }>}
     */
    getMapConfig: async (configOptions = {}) => {
      const { datetime, item, bbox, context } = configOptions;

      const buildResult = await buildLayersInternal(datetime, item, context);

      // Center and zoom resolution
      /** @type {any} */
      const rawBbox = bbox || item?.bbox || stac?.extent?.spatial?.bbox?.[0];

      const targetBbox = sanitizeBbox(rawBbox);

      const { center, zoom } = targetBbox
        ? bboxToCenterZoom(targetBbox)
        : { center: [0, 0], zoom: 2 };

      const resolvedDatetime =
        ((typeof datetime === "string"
          ? datetime
          : datetime instanceof Date
            ? datetime.toISOString()
            : undefined) ??
          buildResult.datetime ??
          buildResult.item?.properties?.datetime ??
          buildResult.item?.properties?.start_datetime) ||
        undefined;

      /** @type {{ availableDates: string[], minDate?: string, maxDate?: string } | undefined} */
      let timeControl = undefined;
      try {
        const dates = await Promise.all(readers.map((r) => r.getDates()));
        const allTimestamps = dates
          .flat()
          .map((d) => d.getTime())
          .filter((t) => !Number.isNaN(t))
          .sort((a, b) => a - b);

        const uniqueTimestamps = Array.from(new Set(allTimestamps));
        if (uniqueTimestamps.length > 0) {
          const availableDates = uniqueTimestamps.map((t) =>
            new Date(t).toISOString(),
          );
          timeControl = {
            availableDates,
            minDate: availableDates[0],
            maxDate: availableDates[availableDates.length - 1],
          };
        }
      } catch {
        // Fallback: ignore date extraction failure if reader has no items
      }

      return {
        layers: buildResult.layers,
        center,
        zoom,
        projection: viewProjection,
        projections: buildResult.projections,
        datetime: resolvedDatetime,
        item: buildResult.item,
        ...(timeControl ? { timeControl } : {}),
      };
    },
  };
};
