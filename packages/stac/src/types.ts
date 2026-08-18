/**
 * The package's own types. STAC input types live in `./stac`.
 */

export * from "./stac";

import type { EodashCollection, EodashItem } from "./stac";

export type EoxLayer = import("@eox/map").EoxLayer;

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
export interface StacSource {
  readonly collection: EodashCollection;
  /** Every datetime the collection offers, oldest first. */
  getDates(): Promise<Date[]>;
  getTemporalExtent(): Promise<TemporalExtent | undefined>;
  getItems(): Promise<EodashItem[]>;
  /** The item nearest `datetime`, or the latest one when omitted. */
  getItem(datetime?: Datetime): Promise<EodashItem | undefined>;
  /** For an item the caller already holds, so nothing is refetched. */
  buildLayers(item: EodashItem): Promise<EoxLayer[]>;
  getLayers(datetime?: Datetime): Promise<EoxLayer[]>;
}
