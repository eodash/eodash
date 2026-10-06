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
  createEodashIndicator,
  buildIndicatorDataLayers,
  normalizeBaseLayers,
  getTooltipProperties,
  getIndicatorLayers,
  getObservationPointsLayer,
} from "../index.js";

import type { BoundLegend, STACItem, Projection } from "./stac";
import type { BBox } from "./stac-base";

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

/** Composite indicator reader managing multiple collection readers. */
export interface IndicatorReader {
  id: string;
  stac: import("./stac").STACCollection;
  projection: string;
  readers: Reader[];
  getDates: (datetime?: Datetime, bbox?: BBox) => Promise<Date[]>;
  getLayers: (
    datetime?: Datetime,
    context?: BuildContext,
  ) => Promise<
    BuiltLayers & { items: import("./stac").STACItem[]; datetime?: string }
  >;
  buildLayers: (
    item: import("./stac").STACItem,
    context?: BuildContext,
  ) => Promise<
    BuiltLayers & { items: import("./stac").STACItem[]; datetime?: string }
  >;
  getMapConfig: (options?: {
    datetime?: Datetime;
    item?: import("./stac").STACItem;
    bbox?: BBox;
    context?: BuildContext;
  }) => Promise<MapConfig>;
}

/** Map configuration payload for EOxMap initialization. */
export interface MapConfig {
  layers: import("@eox/map").EoxLayer[];
  center: number[];
  zoom: number;
  projection: string;
  projections: Projection[];
  datetime?: string;
  item?: STACItem;
  timeControl?: {
    availableDates: string[];
    minDate?: string;
    maxDate?: string;
  };
  legends?: Array<BoundLegend | Record<string, any>>;
  indicator?: {
    id?: string;
    title?: string;
    href?: string;
  };
}

/** The built layers with the projections they reference. */
export interface BuiltLayers {
  layers: import("@eox/map").EoxLayer[];
  /** For the caller to register before assigning the layers. */
  projections: Projection[];
  /** The item the layers were built from. */
  item?: STACItem;
  /** All items if built across multiple collections. */
  items?: STACItem[];
  /** Resolved datetime string. */
  datetime?: string;
}
