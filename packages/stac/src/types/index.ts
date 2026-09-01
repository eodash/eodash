/**
 * The package's own types. STAC input types live in `./stac`, the baseline they
 * extend in `./stac-base`.
 *
 * @module @eodash/stac
 */

export * from "./stac";
export * from "./stac-base";

export {
  createEodashCollection,
  getTooltipProperties,
  getIndicatorLayers,
  getObservationPointsLayer,
} from "../index.js";

import type { BoundLegend, STACItem, Projection } from "./stac";

/** A style document, extended by what the layer config editor reads off it. */
export type EodashStyleJson = import("ol/style/flat").FlatStyleLike & {
  variables?: Record<string, string | number>;
  legend?: BoundLegend;
  jsonform?: Record<string, any>;
  tooltip?: {
    id: string;
    title?: string;
    appendix?: string;
    decimals?: number;
  }[];
};

/**
 * The layer config helpers bound to one collection's form values. Each reader
 * owns one, so the values survive a datetime change and reset when the
 * collection changes.
 */
export type LayerConfigHelpers = ReturnType<
  typeof import("../helpers/layer-config.js").createLayerConfigHelpers
>;

/** Attached to a built layer, for eox-layercontrol to render the config editor. */
export type EodashLayerConfig = {
  schema: Record<string, any>;
  type: "style" | "tileUrl";
  legend?: BoundLegend;
};

/** A point in time, however the caller happens to hold it. */
export type Datetime = string | Date;

/** The period a collection covers. */
export interface TemporalExtent {
  start: Date;
  end: Date;
}

/** Marker styling per theme, keyed by theme name. */
export type ObservationPointsThemes = Record<
  string,
  { color: string; icon: string }
>;

/** What the caller supplies for a build; see `layers/index.js`. */
export type BuildContext = import("../layers/index.js").BuildContext;

/** Base methods and properties shared across all collection readers. */
export type CollectionBase = ReturnType<
  typeof import("../collections/base.js").createCollectionBase
>;

/** Collection reader backed by a STAC API endpoint. */
export type APICollection = ReturnType<
  typeof import("../collections/api.js").createAPICollection
>;

/** Collection reader backed by a GeoParquet mirror. */
export type ParquetCollection = ReturnType<
  typeof import("../collections/parquet.js").createParquetCollection
>;

/** Collection reader backed by static STAC links. */
export type StaticCollection = ReturnType<
  typeof import("../collections/static.js").createStaticCollection
>;

/** Any collection reader. Narrow it with `reader.kind` where the three differ. */
export type Reader = APICollection | ParquetCollection | StaticCollection;

/** The built layers with the projections they reference. */
export interface BuiltLayers {
  layers: import("@eox/map").EoxLayer[];
  /** For the caller to register before assigning the layers. */
  projections: Projection[];
  /** The item the layers were built from. */
  item?: STACItem;
}
