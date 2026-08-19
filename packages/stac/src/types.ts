/**
 * The package's own types. STAC input types live in `./stac`.
 */

export * from "./stac";

import type { SpatialExtent as BBox } from "stac-ts";
import type {
  BoundLegend,
  EodashCollection,
  EodashItem,
  ItemLink,
  Projection,
} from "./stac";

export type { SpatialExtent as BBox } from "stac-ts";

export type EoxLayer = import("@eox/map").EoxLayer;

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

/** Document behind `eodash:rasterform`, once fetched. */
export type EodashRasterJSONForm = {
  jsonform: Record<string, any>;
  legend?: BoundLegend;
};

/** Attached to a built layer, for eox-layercontrol to render the config editor. */
export type EodashLayerConfig = {
  schema: Record<string, any>;
  type: "style" | "tileUrl";
  legend?: BoundLegend;
};

/** A point in time, however the caller happens to hold it. */
export type Datetime = string | Date;

/** The period a collection covers, with an open end resolved to its latest item. */
export interface TemporalExtent {
  start: Date;
  end: Date;
}

/** Marker styling per theme, keyed by theme name. */
export type ObservationPointsThemes = Record<
  string,
  { color: string; icon: string }
>;

/**
 * What the entry point returns. Static, api and parquet collections differ only
 * in how they resolve items, so they share this surface.
 */
export interface CollectionReader {
  readonly id: string;
  /** The collection document. */
  readonly stac: EodashCollection;
  /**
   * Every datetime the collection has an item for, oldest first. `bbox` narrows
   * an api search; a catalog has no geometry to narrow by and ignores it.
   */
  getDates(bbox?: BBox): Promise<Date[]>;
  getTemporalExtent(): Promise<TemporalExtent | undefined>;
  /** The collection's items, oldest first: links for a catalog, items for an api. */
  getItems(bbox?: BBox): Promise<ItemLink[] | EodashItem[]>;
  /** The item closest to `datetime`, or the most recent one when it is missing. */
  getItem(datetime?: Datetime, bbox?: BBox): Promise<EodashItem | undefined>;
  /** For an item the caller already holds, so nothing is refetched. */
  buildLayers(item: EodashItem, context?: BuildContext): Promise<BuiltLayers>;
  getLayers(datetime?: Datetime, context?: BuildContext): Promise<BuiltLayers>;
}

/** What the app supplies for a build; see `layers/index.js`. */
export type BuildContext = import("./layers/index.js").BuildContext;

/**
 * The layer config, with the projections it referenced. The caller registers
 * those before assigning the layers, since a cached build would not re-register.
 */
export interface BuiltLayers {
  layers: EoxLayer[];
  projections: Projection[];
}
