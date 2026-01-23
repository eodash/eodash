/** @group Eodash */
export interface WebComponentProps {
  /**
   * Imports web component file, either using a URL or an import function.
   *
   * @example
   *   importing `eox-itemfilter` web component, after installing `@eox/itemfilter` it can be
   *   referenced:
   *   ```js
   *   link: async() => import("@eox/itemfilter")
   *   ```
   *
   *   ::: warning
   *   import maps are not available in runtime config
   *   :::
   */
  link?: string | (() => Promise<unknown>);
  /**
   * Exported Constructor, needs to be provided if the web component is not
   * registered in by the [link](#link) provided
   */
  constructorProp?: string;
  tagName: `${string}-${string}`;
  /** Object defining all the properties and attributes of the web component */
  properties?: Record<string, unknown>;
  /**
   * Triggered when the web component is mounted in the DOM.
   *
   * @param el - Web component
   * @param store - Return value of the core STAC pinia store in
   *   `/core/client/store/stac.ts`
   */
  onMounted?: (
    el: Element | null,
    store: ReturnType<typeof import("./store/stac.js").useSTAcStore>,
  ) => Promise<void> | void;
  /**
   * Triggered when the web component is unmounted from the DOM.
   *
   * @param el - Web component
   * @param store - Return value of the core STAC pinia store in
   *   `/core/client/store/stac.ts`
   */
  onUnmounted?: (
    el: Element | null,
    store: ReturnType<typeof import("./store/stac.js").useSTAcStore>,
  ) => Promise<void> | void;
}

/** @ignore */
export interface WidgetsContainerProps {
  widgets: Omit<Widget, "layout">[];
}

// eodash types:
/**
 * Properties of EOxLayoutItem used for setting the position and size of panels
 * @group Eodash
 * */
export interface Layout {
  /**
   * Horizontal start position. Integer between 1 and 12 or numbers seperated by "/" for different breakpoints
   * @example "3/2/1"
   */
  x: number | string;
  /**
   *  Vertical start position. Integer between 1 and 12 or numbers seperated by "/" for different breakpoints
   * @example "3/2/1"
   */
  y: number | string;
  /**
   *  Width. Integer between 1 and 12 or numbers seperated by "/" for different breakpoints
   * @example "3/2/1"
   */
  w: number | string;
  /**
   * Height. Integer between 1 and 12 or numbers seperated by "/" for different breakpoints
   * @example "3/2/1"
   */
  h: number | string;
}
/**
 * Widget type: `web-component` API
 *
 * @group Eodash
 */
export interface WebComponentWidget {
  id: number | string | symbol;
  title: string;
  /** Widget position and size. */
  layout: Layout;
  widget: WebComponentProps;
  type: "web-component";
}
// Internal Widget Interfaces
/** @group Widgets */
export interface TEodashMap {
  name: "EodashMap";
  properties?: InstanceType<
    typeof import("^/EodashMap/index.vue").default
  >["$props"];
}

/** @group Widgets */
export interface TEodashDatePicker {
  name: "EodashDatePicker";
  properties?: InstanceType<
    typeof import("^/EodashDatePicker.vue").default
  >["$props"];
}

/** @group Widgets */
export interface TEodashTimeSlider {
  name: "EodashTimeSlider";
  properties?: InstanceType<
    typeof import("^/EodashTimeSlider.vue").default
  >["$props"];
}

/** @group Widgets */
export interface TEodashItemFilter {
  name: "EodashItemFilter";
  properties?: InstanceType<
    typeof import("^/EodashItemFilter.vue").default
  >["$props"];
}

/** @group Widgets */
export interface TEodashLayerControl {
  name: "EodashLayerControl";
  properties?: InstanceType<
    typeof import("^/EodashLayerControl.vue").default
  >["$props"];
}

/** @group Widgets */
export interface TEodashStacInfo {
  name: "EodashStacInfo";
  properties?: InstanceType<
    typeof import("^/EodashStacInfo.vue").default
  >["$props"];
}

/** @group Widgets */
export interface TEodashProcess {
  name: "EodashProcess";
  properties?: InstanceType<
    typeof import("^/EodashProcess/index.vue").default
  >["$props"];
}

/** @group Widgets */
export interface TEodashChart {
  name: "EodashChart";
  properties?: InstanceType<
    typeof import("^/EodashChart.vue").default
  >["$props"];
}

/** @group Widgets */
export interface TEodashMapBtns {
  name: "EodashMapBtns";
  properties?: InstanceType<
    typeof import("^/EodashMapBtns.vue").default
  >["$props"];
}

/** @group Widgets */
export interface TEodashTools {
  name: "EodashTools";
  properties?: InstanceType<
    typeof import("^/EodashTools.vue").default
  >["$props"];
}

/** @group Widgets */
export interface TEodashLayoutSwitcher {
  name: "EodashLayoutSwitcher";
  properties?: InstanceType<
    typeof import("^/EodashLayoutSwitcher.vue").default
  >["$props"];
}
export interface TEodashItemCatalog {
  name: "EodashItemCatalog";
  properties?: InstanceType<
    typeof import("^/EodashItemCatalog/index.vue").default
  >["$props"];
}

/** @group Widgets */
export interface TExportState {
  name: "ExportState";
  properties?: InstanceType<
    typeof import("^/ExportState.vue").default
  >["$props"];
}

/** @group Widgets */
export interface TPopUp {
  name: "PopUp";
  properties?: InstanceType<typeof import("^/PopUp.vue").default>["$props"];
}
/** @group Widgets */
export interface TWidgetsContainer {
  name: "WidgetsContainer";
  properties?: InstanceType<
    typeof import("^/WidgetsContainer.vue").default
  >["$props"];
}
/**
 * Internal Vue Components inside the
 * [widgets](https://github.com/eodash/eodash/tree/main/widgets) folder.
 * Referenced using their name without the .vue extention
 * @group Widgets
 */
export type ComponentWidget =
  | TEodashMap
  | TEodashDatePicker
  | TEodashItemFilter
  | TEodashLayerControl
  | TEodashStacInfo
  | TEodashProcess
  | TEodashChart
  | TEodashMapBtns
  | TEodashTools
  | TEodashLayoutSwitcher
  | TEodashItemCatalog
  | TExportState
  | TPopUp
  | TWidgetsContainer
  | TEodashTimeSlider;
/**
 * Widget type: `internal` API. Internal widgets are Vue components provided by
 * eodash.
 *
 * @group Eodash
 */
export interface InternalComponentWidget {
  id: number | string | symbol;
  title: string;
  /** Widget position and size. */
  layout: Layout;
  widget: ComponentWidget;
  type: "internal";
}

/** Widget type: `iframe` API Renders an external HTML file as a widget. */
/** @group Eodash */
export interface IFrameWidget {
  id: number | string | symbol;
  title: string;
  /** Widget position and size. */
  layout: Layout;
  widget: {
    /** The URL of the page to embed */
    src: string;
  };
  type: "iframe";
}
/** @group Eodash */
export interface FunctionalWidget {
  /**
   * Provides a functional definition of widgets, gets triggered whenever a STAC
   * object is selected, and only renders the returned configuration if the `id`
   * doesn't match the currently rendered `id`
   *
   * @param selectedSTAC - Currently selected STAC object
   */
  defineWidget: (
    selectedSTAC: import("stac-ts").StacCollection | null,
    selectedCompareSTAC?: import("stac-ts").StacCollection | null,
  ) => StaticWidget | undefined | null | false;
}
/**
 * There are 3 types of Widgets:
 *
 * @group Eodash
 */
export type StaticWidget =
  | WebComponentWidget
  | InternalComponentWidget
  | IFrameWidget;
/**
 * Widgets can be defined in 2 forms:
 *
 * 1. {@link StaticWidget} : This is defined as an object once, and is considered
 *    the default form.
 * 2. {@link FunctionalWidget} : a special form which contains the
 *    {@link FunctionalWidget.defineWidget `defineWidget`} function that runs
 *    when {@link EodashStore.stac `loadSelectedSTAC`} function is triggered, and
 *    returns a value of a Static Widget or null or undefined.
 *
 * @group Eodash
 */
export type Widget = StaticWidget | FunctionalWidget;

/** @group Eodash */
export type BackgroundWidget =
  | Omit<WebComponentWidget, "layout" | "title" | "slidable">
  | Omit<InternalComponentWidget, "layout" | "title" | "slidable">
  | Omit<IFrameWidget, "layout" | "title" | "slidable">
  | Omit<FunctionalWidget, "layout" | "slidable">;
/**
 * Dashboard rendered widgets specification. 3 types of widgets are supported:
 * `"iframe"`, `"internal"`, and `"web-component"`. A specific object should be
 * provided based on the type of the widget.
 *
 * @group Eodash
 */
export interface Template {
  /** Gap between widgets */
  gap?: number;
  /** Loading widget */
  loading?: BackgroundWidget;
  /**
   * Widget rendered as the dashboard background. Has the same specifications of
   * {@link Widget} without the `title` and `layout` properties
   */
  background?: BackgroundWidget;
  /** Array of widgets that will be rendered as dashboard panels. */
  widgets: Widget[];
}
/** @group Eodash */
export type MultiTemplates = Record<string, Template>;

/** @ignore */
export type StacEndpoint =
  | string
  | {
      endpoint: string;
      api?: boolean;
      rasterEndpoint?: string;
      vectorEndpoint?: string;
      mosaicEndpoint?: string;
    };

/** @group Eodash */
export interface EodashFont {
  /**
   * Link to stylesheet that defines font-face. Could be either a relative
   * or absolute URL.
   */
  link?: string;
  /** Font family name. */
  family: string;
}
/**
 * Eodash instance API
 *
 * @group Eodash
 */
export type Eodash = {
  /** Instance ID. */
  id?: string;
  /** Object containing potential special configuration options */
  options?: {
    useSubCode?: boolean;
  };
  /** Root STAC catalog endpoint */
  stacEndpoint: StacEndpoint;
  /** Brand specifications. */
  brand: {
    /** Removes the dashboard layout */
    noLayout?: boolean;
    /** Custom error message to alert the users if something crashes */
    errorMessage?: string;
    /** Fetches the specified font family from the specified `link` property. */
    font?:
      | EodashFont
      | {
          body: EodashFont;
          headers: EodashFont;
        };
    /** Title that will be shown in the app header */
    name: string;
    /** Brand logo */
    logo?: string;
    /**
     * Dashboard theme as a custom [vuetifyJs
     * theme](https://vuetifyjs.com/en/features/theme/).
     */
    theme?: import("vuetify").ThemeDefinition & {
      collectionsPalette?: string[];
    };
    /** Text applied to the footer. */
    footerText?: string;
  };
} & (
  | {
      /** Template configuration */
      template: Template;
    }
  | {
      /** Multiple templates configuration */
      templates: MultiTemplates;
    }
);
/////////

/// eodash store types
/** @group EodashStore */
export interface EodashStore {
  /** Stateful Reactive variables */
  states: {
    /** Currently selected STAC endpoint */
    currentUrl: import("vue").Ref<string>;
    /** Currently selected datetime */
    datetime: import("vue").Ref<string>;
    /** Currently selected indicator */
    indicator: import("vue").Ref<string>;

    registeredProjections: `EPSG${number}`[];

    /** available projection to be rendered by the Map */
    availableMapProjection: import("vue").Ref<string>;
  };
  actions: {
    /**
     * returns the layers of the `eox-map`
     * @param [el] - `eox-map` element selector
     */
    getLayers: (el?: string) => object[];

    /**
     * Register EPSG projection in `eox-map` and adds it to  `availableMapProjection`
     * */
    registerProjection: (
      code?: number | string | { name: string; def: string },
    ) => Promise<void>;

    /** Change `eox-map` projection from an EPSG code or a registered projection code */
    changeMapProjection: (
      code?: number | string | { name: string; def: string },
    ) => Promise<void>;
  };

  /** Pinia store definition used to navigate the root STAC catalog. */
  stac: {
    useSTAcStore: typeof import("./store/stac.js").useSTAcStore;
  };
}
///////

/** @group WebComponent */
export type EodashConstructor = import("vue").VueElementConstructor<
  import("vue").ExtractPropTypes<{ config: string }>
>;
/**
 * Eodash Web Component constructor
 *
 * @group WebComponent
 */
export declare const Eodash: EodashConstructor;
/**
 * Registers `eo-dash` as Custom Element in the window
 *
 * @group WebComponent
 */
export declare function register(): void;

/**
 * Eodash store @see EodashStore
 *
 * @group WebComponent
 */
export declare const store: typeof import("@/store").default;

/////

export * from "./main.js";
/**
 * @group Eodash
 */
export type EodashStyleJson = import("ol/style/flat").FlatStyleLike & {
  variables?: Record<string, string | number | boolean | null | undefined>;
  legend?: import("@eox/layercontrol/src/components/layer-config.js").EOxLayerControlLayerConfig["layerConfig"]["legend"];
  jsonform?: import("json-schema").JSONSchema7;
  tooltip?: {
    id: string;
    title?: string;
    appendix?: string;
    decimals?: number;
  }[];
};
export type EodashRasterJSONForm = {
  jsonform: Record<string, any>;
  legend?: import("@eox/layercontrol/src/components/layer-config.js").EOxLayerControlLayerConfig["layerConfig"]["legend"];
};
/** @ignore */
export type LayersEventBusKeys =
  | "layers:updated"
  | "time:updated"
  | "process:updated"
  | "layertime:updated"
  | "compareLayers:updated"
  | "compareTime:updated"
  | "compareProcess:updated"
  | "compareLayertime:updated";

//// STAC API types
/** @ignore */
export interface SearchParams {
  /** Collection IDs to search within */
  collections: string[];
  /** Query parameters */
  query: {
    datetime?: {
      eq?: string;
      in?: string[];
    };
    geometry?: Record<string, any>;
  };
  /** Maximum number of results to return */
  limit?: number;
}
export interface StacItemsAPIResponse {
  type: "FeatureCollection";
  features: import("stac-ts").StacItem[];
}
/** @ignore */
export interface Render {
  /** REQUIRED. Array of asset keys referencing the assets that are used to make the rendering */
  assets: string[];
  /** Optional title of the rendering */
  title?: string;
  /** 2 dimensions array of delimited Min,Max range per band. If not provided, the data will not be rescaled. */
  rescale?: number[][];
  /** Nodata value to use for the referenced assets. */
  nodata?: number | string;
  /** Color map identifier that must be applied for a raster band */
  colormap_name?: string;
  /** Color map JSON definition that must be applied for a raster band */
  colormap?: Record<string, unknown>;
  /** Color formula that must be applied for a raster band */
  color_formula?: string;
  /** Resampling algorithm to apply to the referenced assets. See GDAL resampling algorithm for some examples. */
  resampling?: string;
  /** Band arithmetic formula to apply to the referenced assets. */
  expression?: string;
  /** Zoom levels range applicable for the visualization */
  minmax_zoom?: number[];
}
/** @ignore */
export interface TitilerSTACParameters {
  /** STAC Item URL. Required */
  url: string;
  /** asset names. */
  assets?: string[];
  /** rio-tiler's math expression with asset names (e.g Asset1_b1/Asset2_b1). */
  expression?: string;
  /** tell rio-tiler that each asset is a 1 band dataset, so expression Asset1/Asset2 can be passed. */
  asset_as_band?: boolean;
  /** Per asset band math expression (e.g Asset1|1,2,3). */
  asset_bidx?: string[];
  /** Overwrite internal Nodata value. */
  nodata?: string | number;
  /** Apply dataset internal Scale/Offset. */
  unscale?: boolean;
  /** RasterIO resampling algorithm. Defaults to nearest. */
  resampling?: string;
  /** WarpKernel resampling algorithm (only used when doing re-projection). Defaults to nearest. */
  reproject?: string;
  /** Comma (',') delimited Min,Max range (e.g rescale=0,1000, rescale=0,1000&rescale=0,3000&rescale=0,2000). */
  rescale?: string[];
  /** rio-color formula. */
  color_formula?: string;
  /** JSON encoded custom Colormap. */
  colormap?: string;
  /** rio-tiler color map name. */
  colormap_name?: string;
  /** Add mask to the output data. Default is True. */
  return_mask?: boolean;
  /** Buffer on each side of the given tile. It must be a multiple of 0.5. Output tilesize will be expanded to tilesize + 2 * buffer (e.g 0.5 = 257x257, 1.0 = 258x258). */
  buffer?: number;
  /** Padding to apply to each tile edge. Helps reduce resampling artefacts along edges. Defaults to 0. */
  padding?: number;
  /** Custom algorithm name (e.g hillshade). */
  algorithm?: string;
  /** JSON encoded algorithm parameters. */
  algorithm_params?: string;
}
/**
 * Generic GeoJSON Feature interface that can hold additional properties.
 * @ignore
 */
export interface GeoJsonFeature<T = Record<string, any>, G = GeoJSON.Geometry> {
  type: "Feature";
  geometry: G;
  properties: T & Record<string, any>;
  id?: string | number;
}

/**
 * Generic GeoJSON FeatureCollection interface that can hold additional properties.
 * @ignore
 */
export interface GeoJsonFeatureCollection<
  T = Record<string, any>,
  G = GeoJSON.Geometry,
> {
  type: "FeatureCollection";
  features: Array<GeoJsonFeature<T, G>>;
  properties?: T & Record<string, any>;
}
/**
 * Partial STAC Authentication Extension v1.1.0
 * Generated from https://stac-extensions.github.io/authentication/v1.1.0/schema.json
 */

export interface AuthScheme {
  /** Scheme keyword, e.g. http, s3, signedUrl, oauth2, apiKey, openIdConnect */
  type:
    | "http"
    | "s3"
    | "signedUrl"
    | "oauth2"
    | "apiKey"
    | "openIdConnect"
    | string;

  description?: string;

  name?: string;
  in?: string;

  scheme?: string;

  flows?: Record<string, OAuth2Flow | SignedUrlFlow>;

  openIdConnectUrl?: string;
}

export interface OAuth2Flow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

/** Signed URL flow configuration */
export interface SignedUrlFlow {
  authorizationApi: string;
  method: string;
  responseField?: string;
  parameters?: Record<
    string,
    {
      in: "query" | "header" | "body" | string;
      required: boolean;
      description?: string;
      schema?: object;
    }
  >;
}

export interface ApiKeyAuthScheme extends AuthScheme {
  type: "apiKey";
  name: string;
  in: string;
}

import { StacItem, StacLink, StacAsset } from "stac-ts";
export interface StacAuthItem extends StacItem {
  "auth:schemes": {
    [key: string]: AuthScheme;
  };
}
export interface StacAuthLink extends StacLink {
  "auth:refs": [string];
}
export interface StacAuthAsset extends StacAsset {
  "auth:refs": [string];
}
