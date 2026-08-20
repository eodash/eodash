/**
 * Public type surface of `@eodash/stac`.
 *
 * eodash STAC: the `stac-ts` baseline plus the fields eodash reads.
 */

import type { StacAsset, StacCollection, StacItem, StacLink } from "stac-ts";

/** Known values, without rejecting the ones we have not met yet. */
type LiteralUnion<T extends string> = T | (string & {});

/**
 * Drops the index signature so `Omit` keeps the declared keys. stac-ts pins
 * `stac_version` to `1.0.0`; catalogs are on 1.1.0.
 */
type Declared<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : K]: T[K];
};

export interface EodashItem extends Omit<
  Declared<StacItem>,
  "stac_version" | "links" | "assets"
> {
  stac_version: string;
  links: EodashLink[];
  assets: Record<string, EodashAsset>;
  /** The schemes this item's links and assets reference by `auth:refs`. */
  "auth:schemes"?: Record<string, AuthScheme>;
  "proj:code"?: string;
  /** @deprecated superseded by `proj:code` in projection extension v1.2. */
  "proj:epsg"?: number;
  "eodash:proj4_def"?: Projection;
  renders?: Record<string, Render>;
  "eodash:rasterform"?: string | RasterForm;
  "eodash:merge_assets"?: boolean;
  "eodash:mapProjection"?: Projection;
}

export interface EodashCollection extends Omit<
  Declared<StacCollection>,
  "stac_version" | "links" | "assets"
> {
  stac_version: string;
  links: EodashLink[];
  assets?: Record<string, EodashAsset>;
  renders?: Record<string, Render>;
  /** Point locations are carried by `child` links rather than `item` links. */
  locations?: boolean;
  geoDBID?: string;
  themes?: string[];
  subcode?: string;
  endpointtype?: LiteralUnion<"GeoDB">;
  "eodash:rasterform"?: string | RasterForm;
  "eodash:merge_assets"?: boolean;
  "eodash:mapProjection"?: Projection;
  "eodash:layerExclusive"?: boolean;
  "eodash:jsonform"?: string;
  "eodash:vegadefinition"?: string;
  "eox:colorlegend"?: ColorLegend;
}

/** A STAC API item search as a GET query. */
export interface SearchParams {
  collections?: string;
  /** Comma separated: the repeated form a GET would send is ignored. */
  bbox?: string;
  /** An instant, or an interval as `../end`, `start/..` or `start/end`. */
  datetime?: string;
  limit?: number;
  /** A property name, prefixed `-` to sort descending. */
  sortby?: string;
  /** The properties to return, prefixed `-` to leave one out. */
  fields?: string;
  /** A CQL2-text expression. */
  filter?: string;
  "filter-lang"?: "cql2-text";
}

/** STAC API item search response. */
export interface ItemCollection {
  type: "FeatureCollection";
  features: EodashItem[];
  links?: EodashLink[];
  numberMatched?: number;
  numberReturned?: number;
}

/** A legend whose domain and range are named layer properties. */
export type BoundLegend =
  import("@eox/layercontrol/src/components/layer-config.js").EOxLayerControlLayerConfig["layerConfig"]["legend"];
/** A legend whose domain and range are stated literally. */
type ColorLegend =
  import("@eox/layercontrol/src/components/layer-legend.js").EOxLayerControlLayerLegend["layerLegend"];

/** Document behind `eodash:rasterform`: the controls a raster layer exposes. */
export interface RasterForm {
  jsonform: Record<string, unknown>;
  legend?: BoundLegend;
}

/** A projection code, or a definition to register with proj4. */
export type Projection =
  | string
  | number
  | { name: string; def: string; extent?: number[] };

/** A scheme carrying the key in the request itself. */
export interface ApiKeyAuthScheme {
  type: "apiKey";
  description?: string;
  /** The parameter the key is sent as. */
  name: string;
  in: "query" | "header" | "cookie";
}

export interface OtherAuthScheme {
  type: "http" | "s3" | "signedUrl" | "oauth2" | "openIdConnect";
  description?: string;
}

export type AuthScheme = ApiKeyAuthScheme | OtherAuthScheme;

/** STAC Authentication Extension, link and asset side. */
export interface AuthRefs {
  /** Names of `auth:schemes` entries on the owning item. */
  "auth:refs"?: string[];
}

/** A link reached through one of the owning item's `auth:schemes`. */
export interface AuthLink extends StacLink, AuthRefs {}

/** A link to a raster or vector service, whatever protocol serves it. */
export interface WebMapLink extends StacLink, AuthRefs {
  roles?: string[];
  attribution?: string;
  "proj:code"?: string;
  /** @deprecated superseded by `proj:code` in projection extension v1.2. */
  "proj:epsg"?: number;
  "eodash:proj4_def"?: Projection;
  "eodash:rasterform"?: string | RasterForm;
  "eox:colorlegend"?: ColorLegend;
}

export interface XYZLink extends WebMapLink {
  rel: "xyz";
}

export interface WMSLink extends WebMapLink {
  rel: "wms";
  "wms:layers": string;
  "wms:version"?: string;
  "wms:styles"?: string;
  "wms:dimensions"?: Record<string, string | number>;
  "wms:tilesize"?: number;
}

export interface WMTSLink extends WebMapLink {
  rel: "wmts";
  "wmts:layer": string;
  "wmts:dimensions"?: { style?: string; matrixSet?: string } & Record<
    string,
    unknown
  >;
}

export interface TileJSONLink extends WebMapLink {
  rel: "tilejson";
}

export interface VectorTileLink extends WebMapLink {
  rel: "vector-tile";
  /** Selects which of the item's styles applies to this link. */
  key?: string;
  idProperty?: string;
  layers?: string[];
}

export interface MapboxStyleDocumentLink extends WebMapLink {
  rel: "mapbox-style-document";
  applyOptions?: Record<string, unknown>;
}

/** Points at a style JSON, matched to a link `key` or to asset keys. */
export interface StyleLink extends StacLink {
  rel: `${string}style${string}`;
  "links:keys"?: string[];
  "asset:keys"?: string[];
}

/** Resolves to a collection. */
export interface ChildLink extends StacLink {
  rel: "child";
  id?: string;
  datetime?: string;
  start_datetime?: string;
  end_datetime?: string;
  /** `"lat,lon"`, on collections rendered as observation points. */
  latlng?: string;
}

/** Resolves to a STAC item. */
export interface ItemLink extends StacLink {
  rel: "item";
  id?: string;
  datetime?: string;
  start_datetime?: string;
  end_datetime?: string;
  /** `"lat,lon"`, on collections rendered as observation points. */
  latlng?: string;
}

/** A url to a style JSON, or several keyed by id. */
export type FlatStyle = string | { id: string; url: string }[];

/** An endpoint driving a process. */
export interface ServiceLink extends StacLink {
  rel: "service";
  id?: string;
  endpoint?: LiteralUnion<
    "veda" | "veda_stac" | "eoxhub_workspaces" | "sentinelhub" | "STAC"
  >;
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
  "eox:flatstyle"?: FlatStyle;
}

/** Precomputed aggregates for a collection. */
export interface PreAggregationLink extends StacLink {
  rel: "pre-aggregation";
  "aggregation:interval"?: LiteralUnion<"daily">;
}

/** How many items fall in one interval. */
export interface AggregationBucket {
  /** The datetime the interval starts at. */
  key: string;
  value: number;
}

export interface Aggregation {
  key?: LiteralUnion<"datetime_daily">;
  interval?: LiteralUnion<"daily">;
  buckets?: AggregationBucket[];
}

/** The document behind a `pre-aggregation` link. */
export interface AggregationCollection {
  type: "AggregationCollection";
  aggregations: Aggregation[];
}

export type EodashLink =
  | XYZLink
  | WMSLink
  | WMTSLink
  | TileJSONLink
  | VectorTileLink
  | MapboxStyleDocumentLink
  | StyleLink
  | ChildLink
  | ItemLink
  | ServiceLink
  | PreAggregationLink
  | StacLink;

/**
 * STAC Render extension v2.0.0, carried by a `renders` entry or by the asset it
 * names. `projection` and `tilesize` are eodash additions.
 */
export interface Render {
  assets?: string[];
  title?: string;
  expression?: string;
  projection?: Projection;
  nodata?: number | string;
  resampling?: string;
  rescale?: number[][];
  color_formula?: string;
  colormap?: Record<string, unknown>;
  colormap_name?: string;
  minmax_zoom?: number[];
  bidx?: number[];
  tilesize?: number;
}

interface BaseEodashAsset extends StacAsset, AuthRefs {
  attribution?: string;
  /** Projection extension: the code, e.g. `EPSG:3035`. */
  "proj:code"?: string;
  /**
   * Projection extension: the EPSG code, null where the projection has none.
   * @deprecated superseded by `proj:code` in v1.2.
   */
  "proj:epsg"?: number | null;
  "eodash:proj4_def"?: Projection;
  "eox:flatstyle"?: FlatStyle;
}

export interface GeoJSONAsset extends BaseEodashAsset {
  type: `${string}application/geo+json${string}`;
}

export interface FlatGeobufAsset extends BaseEodashAsset {
  type: `${string}application/vnd.flatgeobuf${string}`;
}

/** A zarr store holding a multiscale pyramid; without the profile it is a single array. */
export interface GeoZarrAsset extends BaseEodashAsset {
  type: "application/vnd.zarr; version=3; profile=multiscales";
}

export interface GeoTIFFAsset extends BaseEodashAsset {
  type: `${string}image/tiff${string}`;
}

export interface GeoDBAsset extends BaseEodashAsset {
  type: `${string}application/geodb+json${string}`;
}

/** An asset eodash renders as a layer. */
export type EodashAsset =
  | GeoJSONAsset
  | FlatGeobufAsset
  | GeoZarrAsset
  | GeoTIFFAsset
  | GeoDBAsset
  /** Anything else eodash carries but does not render itself. */
  | BaseEodashAsset;

export interface TileJSON {
  tiles: string[];
  attribution?: string;
  minzoom?: number;
  maxzoom?: number;
  vector_layers?: unknown[];
  scheme?: "xyz" | "tms";
}
