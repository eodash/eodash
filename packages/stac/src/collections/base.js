import { createLayerConfigHelpers } from "../helpers/layer-config.js";
import {
  findLayer,
  findLayersByLayerPrefix,
  replaceLayer,
} from "../helpers/layers.js";
import { buildLayers } from "../layers/index.js";

/**
 * Creates the base collection reader implementing standard layer and item handling.
 *
 * @param {object} parts
 * @param {import("../types").STACCollection} parts.stac
 * @param {import("../http.js").HttpClient} parts.http
 * @param {(datetime?: import("../types").Datetime, bbox?: import("../types").BBox) => Promise<Date[]>} parts.getDates
 * @param {(datetime?: import("../types").Datetime, bbox?: import("../types").BBox) => Promise<import("../types").STACItem | undefined>} parts.getItem
 * @param {string} [parts.color]
 * @param {string} [parts.viewProjection]
 * @param {import("../types").BuildContext} [parts.rasterOptions] - Default raster configuration applied to layer builds
 */
export const createCollectionBase = ({
  stac,
  http,
  getDates,
  getItem,
  color,
  viewProjection,
  rasterOptions,
}) => {
  const layerConfigHelpers = createLayerConfigHelpers();

  /** @type {import("../types").STACItem | undefined} */
  let builtItem;

  /**
   * Merges reader defaults with call-specific build options.
   *
   * @param {import("../layers/index.js").BuildContext} buildCtx
   * @returns {Parameters<typeof buildLayers>[1]}
   */
  const getBuildContext = (buildCtx) => ({
    ...rasterOptions,
    ...buildCtx,
    color: buildCtx.color ?? color,
    viewProjection: buildCtx.viewProjection ?? viewProjection,
    http: buildCtx.http ?? http,
    layerConfigHelpers: buildCtx.layerConfigHelpers ?? layerConfigHelpers,
    stac,
    getDates: (datetime) => getDates(datetime, buildCtx.bbox),
  });

  return {
    id: stac.id,
    stac,
    color,

    /**
     * The STAC item this collection's layers were last built from.
     */
    get item() {
      return builtItem;
    },
    /**
     * Allows clearing the item only
     */
    set item(item) {
      if (item !== undefined) {
        console.warn(
          "[eodash/stac] a collection's item follows its build, only `undefined` can be assigned",
        );
        return;
      }
      builtItem = undefined;
    },

    /**
     * The STAC item this collection's layers were last built from.
     */
    get item() {
      return builtItem;
    },
    /**
     * Allows clearing the item only
     */
    set item(item) {
      if (item !== undefined) {
        console.warn(
          "[eodash/stac] a collection's item follows its build, only `undefined` can be assigned",
        );
        return;
      }
      builtItem = undefined;
    },

    /**
     * Persists the current layer configuration editor state.
     */
    persistLayerConfig: layerConfigHelpers.persistLayerConfig,

    /**
     * Builds map layers from a specified STAC item.
     *
     * @param {import("../types").STACItem} item
     * @param {import("../layers/index.js").BuildContext} [context]
     * @returns {Promise<import("../types").BuiltLayers>}
     */
    buildLayers: async (item, context = {}) => {
      const built = await buildLayers(item, getBuildContext(context));
      if (context.stateful !== false) {
        builtItem = item;
      }
      return { ...built, item };
    },

    /**
     * Retrieves the item nearest to the specified datetime and builds its layers.
     *
     * @param {import("../types").Datetime} [datetime]
     * @param {import("../layers/index.js").BuildContext} [context]
     * @returns {Promise<import("../types").BuiltLayers>}
     */
    getLayers: async (datetime, context = {}) => {
      const item = await getItem(datetime, context.bbox);
      if (context.stateful !== false) {
        builtItem = item;
      }
      if (!item) {
        console.warn(
          "[eodash] the collection has no item to build layers from",
        );
        return { layers: [], projections: [], item: undefined };
      }
      return { ...(await buildLayers(item, getBuildContext(context))), item };
    },

    /**
     * Replaces layers belonging to this collection in an existing layer tree.
     *
     * @param {import("../types").Datetime} datetime
     * @param {string} layerId - Target layer ID to update
     * @param {import("@eox/map").EoxLayer[]} currentLayers - Current map layer hierarchy
     * @param {import("../layers/index.js").BuildContext} [context]
     * @returns {Promise<import("../types").BuiltLayers>} Updated layer hierarchy and projections
     */
    updateLayers: async (datetime, layerId, currentLayers, context = {}) => {
      const item = await getItem(datetime, context.bbox);
      if (!item) {
        console.warn("[eodash] the collection has no item at", datetime);
        return { layers: [], projections: [] };
      }

      const oldLayer = findLayer(currentLayers, layerId);
      const toBeReplaced = findLayersByLayerPrefix(currentLayers, oldLayer);
      if (!toBeReplaced.length) {
        console.warn("[eodash] no layer of this collection to update", layerId);
        return { layers: [], projections: [] };
      }

      const { layers, projections } = await buildLayers(
        item,
        getBuildContext(context),
      );

      if (context.stateful !== false) {
        builtItem = item;
      }
      return {
        layers: replaceLayer(
          currentLayers,
          toBeReplaced.map((layer) => layer.properties?.id ?? ""),
          layers,
        ),
        projections,
        item,
      };
    },

    /**
     * Resolves the temporal extent of the collection.
     * Uses collection-level metadata if available; otherwise extrapolates from items.
     *
     * @returns {Promise<import("../types").TemporalExtent | undefined>}
     */
    getTemporalExtent: async () => {
      const [start, end] = stac.extent?.temporal?.interval?.[0] ?? [];
      if (start && end) {
        return { start: new Date(start), end: new Date(end) };
      }
      const dates = await getDates();
      const from = start ? new Date(start) : dates.at(0);
      const to = end ? new Date(end) : dates.at(-1);
      return from && to ? { start: from, end: to } : undefined;
    },
  };
};
