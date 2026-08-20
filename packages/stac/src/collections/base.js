import { createLayerConfigHelpers } from "../helpers/layer-config.js";
import { buildLayers } from "../layers/index.js";

/**
 * What every collection kind shares. The parts that differ per kind are passed
 * in rather than overridden.
 *
 * @param {object} parts
 * @param {import("../types").EodashCollection} parts.stac
 * @param {import("../http.js").HttpClient} parts.http what the reader reads through, which a build reads through too
 * @param {(datetime?: import("../types").Datetime, bbox?: import("../types").BBox) => Promise<Date[]>} parts.getDates
 * @param {(datetime?: import("../types").Datetime, bbox?: import("../types").BBox) => Promise<import("../types").EodashItem | undefined>} parts.getItem
 */
export const createCollectionBase = ({ stac, http, getDates, getItem }) => {
  // the reader outlives a datetime rebuild but not a collection switch, which is
  // exactly how long the config editors' values should survive
  const layerConfigHelpers = createLayerConfigHelpers();

  return {
    id: stac.id,
    stac,

    /**
     * Remembers what a layer config editor now holds, so the next build restores
     * it. Call from the `layerConfig:change` handler.
     */
    persistLayerConfig: layerConfigHelpers.persistLayerConfig,

    /**
     * The layer config for an item the caller already holds, so nothing about the
     * item is refetched. The projections it settled on come back alongside, for
     * the caller to register before assigning the layers.
     *
     * Observation-point collections are the app's to render: their layers read
     * live map state and app theming, which this package has no access to.
     *
     * @param {import("../types").EodashItem} item
     * @param {import("../layers/index.js").BuildContext} [context]
     */
    buildLayers: (item, context = {}) =>
      buildLayers(item, {
        ...context,
        http: context.http ?? http,
        layerConfigHelpers: context.layerConfigHelpers ?? layerConfigHelpers,
        stac,
        getDates: (datetime) => getDates(datetime, context.bbox),
      }),

    /**
     * The layer config for the item nearest `datetime`, fetching that item first.
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
      return buildLayers(item, {
        ...context,
        http: context.http ?? http,
        layerConfigHelpers: context.layerConfigHelpers ?? layerConfigHelpers,
        stac,
        getDates: (datetime) => getDates(datetime, context.bbox),
      });
    },

    /**
     * The collection's overall period, which the spec puts in the first
     * interval. An open side is filled from the items.
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
