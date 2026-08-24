import { createLayerConfigHelpers } from "../helpers/layer-config.js";
import {
  findLayer,
  findLayersByLayerPrefix,
  replaceLayer,
} from "../helpers/layers.js";
import { buildLayers } from "../layers/index.js";

/**
 * Common functionality shared across all STAC collection types.
 * Collection-specific behavior is injected via parameters.
 *
 * @param {object} parts
 * @param {import("../types").STACCollection} parts.stac
 * @param {import("../http.js").HttpClient} parts.http
 * @param {(datetime?: import("../types").Datetime, bbox?: import("../types").BBox) => Promise<Date[]>} parts.getDates
 * @param {(datetime?: import("../types").Datetime, bbox?: import("../types").BBox) => Promise<import("../types").STACItem | undefined>} parts.getItem
 * @param {string} [parts.color]
 * @param {import("../types").BuildContext} [parts.rasterOptions] - Raster serving config every build starts from, until a caller overrides a field per call
 */
export const createCollectionBase = ({
  stac,
  http,
  getDates,
  getItem,
  color,
  rasterOptions,
}) => {
  // the reader outlives a datetime rebuild but not a collection switch, which is
  // exactly how long the config editors' values should survive
  const layerConfigHelpers = createLayerConfigHelpers();

  /**
   * Prepares the build context combining explicit options with reader defaults.
   *
   * @param {import("../layers/index.js").BuildContext} buildCtx
   * @returns {Parameters<typeof buildLayers>[1]}
   */
  const getBuildContext = (buildCtx) => ({
    ...rasterOptions,
    ...buildCtx,
    http: buildCtx.http ?? http,
    layerConfigHelpers: buildCtx.layerConfigHelpers ?? layerConfigHelpers,
    color: buildCtx.color ?? color,
    stac,
    getDates: (datetime) => getDates(datetime, buildCtx.bbox),
  });

  return {
    id: stac.id,
    stac,
    color,

    /**
     * Persists the current layer configuration editor state.
     * Use this in the `layerConfig:change` handler to restore config across layer rebuilds.
     */
    persistLayerConfig: layerConfigHelpers.persistLayerConfig,

    /**
     * Builds layers from an existing STAC item without fetching data.
     * Includes any needed map projections alongside the layers.
     * Observation-point collections are excluded from this build process.
     *
     * @param {import("../types").STACItem} item
     * @param {import("../layers/index.js").BuildContext} [context]
     */
    buildLayers: (item, context = {}) =>
      buildLayers(item, getBuildContext(context)),

    /**
     * Builds layers for the item nearest to the specified datetime.
     *
     * @param {import("../types").Datetime} [datetime]
     * @param {import("../layers/index.js").BuildContext} [context]
     */
    getLayers: async (datetime, context = {}) => {
      const item = await getItem(datetime, context.bbox);
      if (!item) {
        console.warn(
          "[eodash] the collection has no item to build layers from",
        );
        return { layers: [], projections: [] };
      }
      return { ...(await buildLayers(item, getBuildContext(context))), item };
    },

    /**
     * Updates an existing layer tree by replacing the specified layer
     * with one built from the item nearest to the specified datetime.
     * Retains unchanged layers by reference to prevent unnecessary re-rendering.
     *
     * @param {import("../types").Datetime} datetime
     * @param {string} layerId - any layer this collection built
     * @param {import("../types").EoxLayer[]} currentLayers - the tree as it stands
     * @param {import("../layers/index.js").BuildContext} [context]
     * @returns {Promise<import("../types").BuiltLayers | undefined>}
     */
    updateLayers: async (datetime, layerId, currentLayers, context = {}) => {
      const item = await getItem(datetime, context.bbox);
      if (!item) {
        console.warn("[eodash] the collection has no item at", datetime);
        return undefined;
      }

      const oldLayer = findLayer(currentLayers, layerId);
      const toBeReplaced = findLayersByLayerPrefix(currentLayers, oldLayer);
      if (!toBeReplaced.length) {
        console.warn("[eodash] no layer of this collection to update", layerId);
        return undefined;
      }

      const { layers, projections } = await buildLayers(
        item,
        getBuildContext(context),
      );
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
