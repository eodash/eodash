import { useSTAcStore } from "./store/stac"
import type { Router } from "vue-router";
import type { StacCatalog, StacCollection, StacItem } from "stac-ts";
import type { Ref } from "vue"
import type { ThemeDefinition } from "vuetify/lib/index.mjs";
import type { Map } from "openlayers";
/**
 * Web Component configuration
 */
export interface WebComponentProps<T extends ExecutionTime = "compiletime"> {
  /** Web component definition file URL*/
  link: T extends 'runtime' ? string : (string | (() => Promise<unknown>));
  /** Exported Constructor, needs to be provided if the web component is not registered by the `link` provided */
  constructorProp?: string
  /** Custom tag name */
  tagName: `${string}-${string}`
  /** Object defining all the properties and attributes of the web component */
  properties?: Record<string, any>
  /**
   * Function that is triggered when the web component is mounted in the DOM.
   * @param el - web component
   * @param store - return value of the core STAC pinia store in `/core/store/stac.ts`
   */
  onMounted?: (el: Element | null, store: ReturnType<typeof useSTAcStore>, router: Router) => (Promise<void> | void)
  /**
   * Function that is triggered when the web component is unmounted from the DOM.
   * @param el - web component
   * @param store - return value of the core STAC pinia store in `/core/store/stac.ts`
   */
  onUnmounted?: (el: Element | null, store: ReturnType<typeof useSTAcStore>, router: Router) => (Promise<void> | void)
}


/** @ignore */
export interface WidgetsContainerProps {
  widgets: Omit<Widget, 'layout'>[]
}

// eodash types:
/**
 * Widget type: `web-component` specification. The web component definition is imported using the `widget.link` property either from
 * an external endpoint, or an installed node_module.
 * Installed node_module web components import should be mapped in `/core/modulesMap.ts`,
 * then setting `widget.link`:`(import-map-key)` and `node_module`:`true`
 */
export interface WebComponentWidget<T extends ExecutionTime = "compiletime"> {
  /**
 * Unique Identifier, triggers rerender when using `defineWidget`
 **/
  id: number | string | symbol
  /**
   * Widget title
   */
  title: string
  /**
   * Widget position and size.
   */
  layout: {
    /**
     *  Horizontal start position. Integer (1 - 12)
     */
    x: number
    /**
     *  Vertical start position. Integer (1 - 12)
     */
    y: number
    /**
     *  Width. Integer (1 - 12)
     */
    w: number
    /**
     *  Height. Integer (1 - 12)
     */
    h: number
  }
  widget: WebComponentProps<T>
  /**
   * Widget type
   */
  type: 'web-component'
}

/**
 * Widget type: `internal` specification.
 * Internal widgets are Vue components inside the `/widgets` directory.
 */
export interface InternalComponentWidget {
  /**
  * Unique Identifier, triggers rerender when using `defineWidget`
  **/
  id: number | string | symbol
  /**
   * Widget title
   */
  title: string
  /**
  * Widget position and size.
  */
  layout: {
    /**
     *  Horizontal start position. Integer (1 - 12)
     */
    x: number
    /**
     *  Vertical start position. Integer (1 - 12)
     */
    y: number
    /**
     *  Width. Integer (1 - 12)
     */
    w: number
    /**
     *  Height. Integer (1 - 12)
     */
    h: number
  }
  widget: {
    /**
     * Internal Vue Component file name without the extention .vue
     */
    name: string;
    /**
     * Specified Vue component props
     */
    props?: Record<string, unknown>
  }
  /**
  * Widget type.
  */
  type: 'internal'
}

/**
 * Widget type: `iframe` specification.
 * Renders an external HTML file as a widget.
 */
export interface IFrameWidget {
  /**
   * Unique Identifier, triggers rerender when using `defineWidget`
   **/
  id: number | string | symbol
  /**
  * Widget title
  */
  title: string
  /**
  * Widget position and size.
  */
  layout: {
    /**
     *  Horizontal start position. Integer (1 - 12)
     */
    x: number
    /**
     *  Vertical start position. Integer (1 - 12)
     */
    y: number
    /**
     *  Width. Integer (1 - 12)
     */
    w: number
    /**
     *  Height. Integer (1 - 12)
     */
    h: number
  }
  widget: {
    /**
     * The URL of the page to embed
     */
    src: string
  }
  /**
  * Widget type
  */
  type: 'iframe'
}
export interface FunctionalWidget<T extends ExecutionTime = "compiletime"> {
  /**
   * Provides a functional definition of the widget,
   * gets triggered whenever a stac object is selected.
   * @param selectedSTAC - currently selected stac object
   */
  defineWidget: (selectedSTAC: StacCatalog | StacCollection | StacItem | null) => Omit<StaticWidget<T>, 'layout'>
  layout: {
    /**
     *  Horizontal start position. Integer (1 - 12)
     */
    x: number
    /**
     *  Vertical start position. Integer (1 - 12)
     */
    y: number
    /**
     *  Width. Integer (1 - 12)
     */
    w: number
    /**
     *  Height. Integer (1 - 12)
     */
    h: number
  }
}
export type StaticWidget<T extends ExecutionTime = "compiletime"> = WebComponentWidget<T> | InternalComponentWidget | IFrameWidget
export type Widget<T extends ExecutionTime = "compiletime"> = StaticWidget<T> | FunctionalWidget<T>


export type BackgroundWidget<T extends ExecutionTime = "compiletime"> = Omit<WebComponentWidget<T>, 'layout' | 'title'> | Omit<InternalComponentWidget, 'layout' | 'title'> | Omit<IFrameWidget, 'layout' | 'title'> | Omit<FunctionalWidget, 'layout'>
/**
 * Dashboard rendered widgets  specification.
 * 3 types of widgets are supported: `"iframe"`, `"internal"`, and `"web-component"`.
 * A specific object should be provided based on the type of the widget.
 */
export interface Template<T extends ExecutionTime = "compiletime"> {
  /**
   * Gap between widgets
   */
  gap?: number;
  /**
   * Widget rendered as the dashboard background.
   * Has the same specifications of [Widget](../readme#widget) without the `title` and  `layout` properties
   */
  background?: BackgroundWidget<T>
  /**
   * Array of widgets that will be rendered as dashboard panels.
   */
  widgets: Widget<T>[]
}

export type ExternalURL = `${'https://' | 'http://'}${string}`;
export type InternalRoute = `/${string}`
export type StacEndpoint = `${'https://' | 'http://'}${string}/catalog.json`

export type ExecutionTime = "runtime" | "compiletime";

/**
 * Eodash instance specification.
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
    /**
     * button title
     **/
    title: string,
    /**
     * external URL or inner path to navigate to.
     **/
    to: ExternalURL | InternalRoute
  }>
  /**
   * Brand specifications.
   */
  brand: {
    /**
     * Automatically fetches the specified font family from google fonts. if the `link` property is specified
     * the font family will be fetched from the provided source instead.
     */
    font?: {
      /**
       * Link to stylesheet that defines font-face.
       */
      link?: string;
      /**
       * Font family. Use FVD notation to include families https://github.com/typekit/fvd
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
  }
  /**
   * Template configuration
   */
  template: Template<T>
}
/////////

/// eodash store types
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
  }
  // consider removing the actions ?
  actions: {
    loadFont: (family?: string, link?: string) => Promise<string>;
  };
  /**
   *  Pinia store definition used to navigate the root STAC catalog.
   */
  stac: {
    useSTAcStore: typeof useSTAcStore
  }
}
///////
export interface EodashConfig {
  dev?: {
    port?: string | number
    host?: string | boolean
    open?: boolean
  }
  preview?: {
    port?: string | number
    host?: string | boolean
    open?: boolean
  }
  base?: string;
  outDir?: string;
  publicDir?: string | false;
  cacheDir?: string
  entryPoint?: string
  runtime?: string
  widgets?: string
}

export declare const createEodash: (configCallback: (store: EodashStore) => Eodash | Promise<Eodash>) => Eodash
