/**
 * The package's own types. STAC input types live in `./stac`.
 */

export * from "./stac";

/**
 * Reads a collection and returns the reader that resolves its items.
 */
export { createEodashCollection } from "./index.js";
export type { ApiReader, CollectionReader } from "./index.js";

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

/**
 * The layer config helpers bound to one collection's form values. A reader owns
 * one, so changing the datetime keeps what the user set while switching
 * collection starts empty.
 */
export type LayerConfigHelpers = ReturnType<
  typeof import("./helpers/layer-config.js").createLayerConfigHelpers
>;

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

/** What the app supplies for a build; see `layers/index.js`. */
export type BuildContext = import("./layers/index.js").BuildContext;

/**
 * The layer config, with the projections it referenced. The caller registers
 * those before assigning the layers, since a cached build would not re-register.
 */
export interface BuiltLayers {
  layers: EoxLayer[];
  projections: Projection[];
  /** The item the layers were built from */
  item?: EodashItem;
}
