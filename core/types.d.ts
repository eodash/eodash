import { useSTAcStore } from "./store/stac"
import type { Router } from "vue-router";
import type { StacCatalog, StacCollection, StacItem } from "stac-ts";
import type { Ref } from "vue"
import type { ThemeDefinition } from "vuetify/lib/index.mjs";
import type { Map } from "openlayers";

/**
 * @group Eodash
 */
export interface WebComponentProps<T extends ExecutionTime = "compiletime"> {
  /**
   * Imports web component file, either using a URL or an import function.
   * @example
   * importing `eox-itemfilter` web component, after installing `@eox/itemfilter` it can be
   * referenced:
   * ```js
   * link: async() => import("@eox/itemfilter")
   * ```
   *
   * ::: warning
   * import maps are not available in runtime config
   * :::
   **/
  link: T extends 'runtime' ? string : (string | (() => Promise<unknown>));
  /**
   *  Exported Constructor, needs to be provided if the web component is not registered in by the
   * [link](#link) provided
   **/
  constructorProp?: string
  tagName: `${string}-${string}`
  /** Object defining all the properties and attributes of the web component */
  properties?: Record<string, any>
  /**
   * Triggered when the web component is mounted in the DOM.
   * @param el - web component
   * @param store - return value of the core STAC pinia store in `/core/store/stac.ts`
   */
  onMounted?: (el: Element | null, store: ReturnType<typeof useSTAcStore>, router: Router) => (Promise<void> | void)
  /**
   * Triggered when the web component is unmounted from the DOM.
   * @param el - web component
   * @param store - return value of the core STAC pinia store in `/core/store/stac.ts`
   */
  onUnmounted?: (el: Element | null, store: ReturnType<typeof useSTAcStore>, router: Router) => (Promise<void> | void)
}


/** @ignore */
export interface WidgetsContainerProps {
  widgets: Omit<Widget, 'layout' | 'slidable'>[]
}

// eodash types:
/**
 * Widget type: `web-component` API
 * @group Eodash
 */
export interface WebComponentWidget<T extends ExecutionTime = "compiletime"> {
  id: number | string | symbol
  title: string
  /**
   * Widget position and size.
   */
  layout: {
    /**
     *  Horizontal start position. Integer between 1 and 12
     */
    x: number
    /**
     *  Vertical start position. Integer between 1 and 12
     */
    y: number
    /**
     *  Width. Integer between 1 and 12
     */
    w: number
    /**
     *  Height. Integer between 1 and 12
     */
    h: number
  },
  /**
 * Enable/Disable widget sliding.
 */
  slidable?: boolean
  widget: WebComponentProps<T>
  type: 'web-component'
}

/**
 * Widget type: `internal` API.
 * Internal widgets are Vue components provided by eodash.
 * @group Eodash
 */
export interface InternalComponentWidget {
  id: number | string | symbol
  title: string
  /**
  * Widget position and size.
  */
  layout: {
    /**
     *  Horizontal start position. Integer between 1 and 12
     */
    x: number
    /**
     *  Vertical start position. Integer between 1 and 12
     */
    y: number
    /**
     *  Width. Integer between 1 and 12
     */
    w: number
    /**
     *  Height. Integer between 1 and 12
     */
    h: number
  }
  /**
   * Enable/Disable widget sliding.
   */
  slidable?: boolean
  widget: {
    /**
     * Internal Vue Components inside the [widgets](https://github.com/eodash/eodash/tree/main/widgets) folder can be referenced
     * using their name without the extention .vue
     */
    name: string;
    /**
     * Specified Vue component props
     */
    properties?: Record<string, unknown>
  }
  type: 'internal'
}

/**
 * Widget type: `iframe` API
 * Renders an external HTML file as a widget.
 */
/**
 * @group Eodash
 */
export interface IFrameWidget {
  id: number | string | symbol
  title: string
  /**
  * Widget position and size.
  */
  layout: {
    /**
     *  Horizontal start position. Integer between 1 and 12
     */
    x: number
    /**
     *  Vertical start position. Integer between 1 and 12
     */
    y: number
    /**
     *  Width. Integer between 1 and 12
     */
    w: number
    /**
     *  Height. Integer between 1 and 12
     */
    h: number
  }
  /**
  * Enable/Disable widget sliding.
  */
  slidable?: boolean;
  widget: {
    /**
     * The URL of the page to embed
     */
    src: string
  }
  type: 'iframe'
}
/**
 * @group Eodash
 */
export interface FunctionalWidget<T extends ExecutionTime = "compiletime"> {
  /**
   * Provides a functional definition of the widget,
   * gets triggered whenever a stac object is selected.
   * @param selectedSTAC - currently selected stac object
   */
  defineWidget: (selectedSTAC: StacCatalog | StacCollection | StacItem | null) => Omit<StaticWidget<T>, 'layout' | 'slidable'>
  layout: {
    /**
     *  Horizontal start position. Integer between 1 and 12
     */
    x: number
    /**
     *  Vertical start position. Integer between 1 and 12
     */
    y: number
    /**
     *  Width. Integer between 1 and 12
     */
    w: number
    /**
     *  Height. Integer between 1 and 12
     */
    h: number
  }
  /**
  * Enable/Disable widget sliding.
  */
  slidable?: boolean
}
/**
 * @group Eodash
 */
export type StaticWidget<T extends ExecutionTime = "compiletime"> = WebComponentWidget<T> | InternalComponentWidget | IFrameWidget
/**
 * @group Eodash
 */
export type Widget<T extends ExecutionTime = "compiletime"> = StaticWidget<T> | FunctionalWidget<T>


/**
 * @group Eodash
 */
export type BackgroundWidget<T extends ExecutionTime = "compiletime"> = Omit<WebComponentWidget<T>, 'layout' | 'title' | 'slidable'> | Omit<InternalComponentWidget, 'layout' | 'title' | 'slidable'> | Omit<IFrameWidget, 'layout' | 'title' | 'slidable'> | Omit<FunctionalWidget<T>, 'layout' | 'slidable'>
/**
 * Dashboard rendered widgets  specification.
 * 3 types of widgets are supported: `"iframe"`, `"internal"`, and `"web-component"`.
 * A specific object should be provided based on the type of the widget.
 * @group Eodash
 */
export interface Template<T extends ExecutionTime = "compiletime"> {
  /**
   * Gap between widgets
   */
  gap?: number;
  /**
   * Widget rendered as the dashboard background.
   * Has the same specifications of Widget without the `title` and  `layout` properties
   */
  background?: BackgroundWidget<T>
  /**
   * Array of widgets that will be rendered as dashboard panels.
   */
  widgets: Widget<T>[]
}
/** @ignore */
export type ExternalURL = `${'https://' | 'http://'}${string}`;
/** @ignore */
export type InternalRoute = `/${string}`
/** @ignore */
export type StacEndpoint = `${'https://' | 'http://'}${string}/catalog.json`

/**
 * @group Eodash
 */
export type ExecutionTime = "runtime" | "compiletime";

/**
 * Eodash instance API
 * @group Eodash
 */
export interface Eodash<T extends ExecutionTime = "compiletime"> {
  /**
   * Instance ID.
   */
  id: string;
  /**
   * Root STAC catalog endpoint
   **/
  stacEndpoint: StacEndpoint
  /**
  * Renderes to navigation buttons on the app header.
  **/
  routes?: Array<{
    title: string,
    to: ExternalURL | InternalRoute
  }>
  /**
   * Brand specifications.
   */
  brand: {
    /**
     * Automatically fetches the specified font family from google fonts. if the [link](#font-link) property is specified
     * the font family will be fetched from the provided source instead.
     */
    font?: {
      /**
       * Link to stylesheet that defines font-face.
       */
      link?: string;
      /**
       * Font family. Use FVD notation to include families. see https://github.com/typekit/fvd
       */
      family: string
    }
    /**
     *  Title that will be shown in the app header
     */
    name: string;
    /**
     * Alias that will be shown in the app footer if specified.
     */
    shortName?: string
    /**
     * brand logo
     */
    logo?: string;
    /**
     * Dashboard theme as a custom vuetifyJs theme.
     */
    theme?: ThemeDefinition
    /**
     * meta tags configuration, using unhead's [useSeoMeta](https://unhead.unjs.io/usage/composables/use-seo-meta)
     */
    meta?: import("@unhead/vue").UseSeoMetaInput;
    /**
     * Text applied to the footer.
     */
    footerText?: string;
  }
  /**
   * Template configuration
   */
  template: Template<T>
}
/////////

/// eodash store types
/**
 * @group EodashStore
 */
export interface EodashStore {
  /**
   * Stateful Reactive variables
   */
  states: {
    /**
     * Currently selected STAC endpoint
     */
    currentUrl: Ref<string>
    /**
    * OpenLayers map instance
    */
    mapInstance: Ref<Map | null>
    /**
    * currently selected datetime
    */
    datetime: Ref<string>
    /**
     * Currently selected indicator
     */
    indicator: Ref<string>
  }
  actions: {};
  /**
   *  Pinia store definition used to navigate the root STAC catalog.
   */
  stac: {
    useSTAcStore: typeof useSTAcStore
  }
}
///////
/**
 * Eodash server, build and setup configuration
 * @group EodashConfig
 */
export interface EodashConfig {
  dev?: {
    /** serving  port */
    port?: string | number
    host?: string | boolean
    /** open default browser when the server starts */
    open?: boolean
  }
  preview?: {
    /** serving  port */
    port?: string | number
    host?: string | boolean
    /** open default browser when the server starts */
    open?: boolean
  }
  /**
   * base public path
   */
  base?: string;
  /**
   * build target folder path
   */
  outDir?: string;
  /** path to statically served assets folder, can be set to `false`
   *  to disable serving assets statically
   **/
  publicDir?: string | false;
  /**
   * cache folder
   */
  cacheDir?: string
  /** specifies main entry file, exporting `createEodash`*/
  entryPoint?: string
  /**
   * file exporting eodash client runtime config
   */
  runtime?: string
  widgets?: string
}
/**
 * project entry point should export this function as a default
 * to instantiate eodash
 *
 * @param  configCallback
 */
export declare const createEodash: (configCallback: (store: EodashStore) => Eodash | Promise<Eodash>) => Promise<Eodash>
export declare const store: EodashStore
