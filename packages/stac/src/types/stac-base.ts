/**
 * The STAC baseline, copied and modified from `stac-ts`. Each entity takes the
 * extensions it carries as a generic, so a caller can describe its own.
 */

/** A bounding box as `[west, south, east, north]`, with optional elevations. */
export type BBox = number[];

/** A relationship with another entity. */
export interface BaseLink {
  href: string;
  rel: string;
  type?: string;
  title?: string;
  [k: string]: unknown;
}

/** Something downloadable, keyed by a unique name on its owner. */
export type BaseAsset<Extensions = unknown> = {
  href: string;
  title?: string;
  description?: string;
  type?: string;
  roles?: string[];
  [k: string]: unknown;
} & CommonMetadata &
  Extensions;

/** An entry in a STAC catalog. */
export type BaseItem<
  Extensions = unknown,
  Link extends BaseLink = BaseLink,
  Asset extends BaseAsset = BaseAsset,
> = GeoJSONFeature &
  Extensions & {
    stac_version: string;
    stac_extensions?: string[];
    id: string;
    /** Set only where the item's links carry a `collection` rel. */
    collection?: string;
    links: Link[];
    assets: Record<string, Asset>;
    properties: CommonMetadata & Record<string, unknown>;
    [k: string]: unknown;
  };

/** A catalog whose items share a description, licence and extent. */
export type BaseCollection<
  Extensions = unknown,
  Link extends BaseLink = BaseLink,
  Asset extends BaseAsset = BaseAsset,
> = Extensions & {
  stac_version: string;
  stac_extensions?: string[];
  type: "Collection";
  id: string;
  title?: string;
  description: string;
  keywords?: string[];
  /** An SPDX identifier, `various` where several apply, or `proprietary`. */
  license: string;
  providers?: BaseProvider[];
  extent: Extents;
  assets?: Record<string, Asset>;
  links: Link[];
  /** Per-property value sets, ranges or JSON Schemas. */
  summaries?: Record<string, unknown>;
  [k: string]: unknown;
};

/** A grouping of catalogs, collections and items. */
export type BaseCatalog<
  Extensions = unknown,
  Link extends BaseLink = BaseLink,
> = Extensions & {
  stac_version: string;
  stac_extensions?: string[];
  type: "Catalog";
  id: string;
  title?: string;
  description: string;
  links: Link[];
  [k: string]: unknown;
};

/** Who captured, processed or hosts the data. */
export interface BaseProvider {
  name: string;
  description?: string;
  roles?: ("producer" | "licensor" | "processor" | "host")[];
  url?: string;
  [k: string]: unknown;
}

/** The metadata fields any STAC entity may carry. */
export interface CommonMetadata {
  title?: string;
  description?: string;
  /** In UTC, formatted per RFC 3339. */
  datetime?: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
  created?: string | null;
  updated?: string | null;
  platform?: string;
  instruments?: string[];
  constellation?: string;
  mission?: string;
  gsd?: number;
  license?: string;
  providers?: BaseProvider[];
  [k: string]: unknown;
}

interface Extents {
  spatial: { bbox: [BBox, ...BBox[]]; [k: string]: unknown };
  temporal: {
    interval: [TemporalInterval, ...TemporalInterval[]];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

/** `[start, end]`, either end open as `null`. */
type TemporalInterval = [string | null, string | null];

export interface GeoJSONFeature {
  type: "Feature";
  id?: number | string;
  properties: null | Record<string, unknown>;
  geometry: null | GeoJSONGeometry;
  bbox?: number[];
  [k: string]: unknown;
}

export type GeoJSONGeometry =
  | GeoJSONPoint
  | GeoJSONLineString
  | GeoJSONPolygon
  | GeoJSONMultiPoint
  | GeoJSONMultiLineString
  | GeoJSONMultiPolygon
  | GeoJSONGeometryCollection;

export interface GeoJSONPoint {
  type: "Point";
  coordinates: number[];
  bbox?: number[];
  [k: string]: unknown;
}

export interface GeoJSONLineString {
  type: "LineString";
  coordinates: number[][];
  bbox?: number[];
  [k: string]: unknown;
}

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][];
  bbox?: number[];
  [k: string]: unknown;
}

export interface GeoJSONMultiPoint {
  type: "MultiPoint";
  coordinates: number[][];
  bbox?: number[];
  [k: string]: unknown;
}

export interface GeoJSONMultiLineString {
  type: "MultiLineString";
  coordinates: number[][][];
  bbox?: number[];
  [k: string]: unknown;
}

export interface GeoJSONMultiPolygon {
  type: "MultiPolygon";
  coordinates: number[][][][];
  bbox?: number[];
  [k: string]: unknown;
}

export interface GeoJSONGeometryCollection {
  type: "GeometryCollection";
  geometries: Exclude<GeoJSONGeometry, GeoJSONGeometryCollection>[];
  bbox?: number[];
  [k: string]: unknown;
}
