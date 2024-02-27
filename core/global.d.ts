import { useSTAcStore } from "@/store/stac"
import type { Router } from "vue-router";
import type { StacCatalog, StacCollection, StacItem } from "stac-ts";

declare global {
  /**
   * Specification of web components imported from an external URL
   */
  interface ExternalWebComponentProps {
    /** Web component definition file URL*/
    link: string
    /** Indicates if the widget is a node module */
    // node_module?: false
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
    onMounted?: (el: Element, store: ReturnType<typeof useSTAcStore>, router: Router) => (Promise<void> | void)
    /**
     * Function that is triggered when the web component is unmounted from the DOM.
     * @param el - web component
     * @param store - return value of the core STAC pinia store in `/core/store/stac.ts`
     */
    onUnmounted?: (el: Element, store: ReturnType<typeof useSTAcStore>, router: Router) => (Promise<void> | void)
  }

  // /**
  //  * Specification of web components imported as a node_module.
  //  */
  // export interface NodeModuleWebComponentProps {
  //   /** Type of `modulesMap` key. Defined in `/core/modulesMap.ts`*/
  //   link: keyof typeof modulesMap;
  //   /** Indicates if the widget is a node module */
  //   node_module: true;
  //   /** Exported Constructor, needs to be provided if the web component is not registered */
  //   constructorProp?: string
  //   /** Custom tag name */
  //   tagName: `${string}-${string}`
  //   /** Object defining all the properties and attributes of the web component */
  //   properties?: Record<string, any>
  //   /**
  //    * Function that is triggered when the web component is mounted in the DOM.
  //    * @param el - web component
  //    * @param store - return value of the core STAC pinia store in `/core/store/stac.ts`
  //    */
  //   onMounted?: (el: Element, store: ReturnType<typeof useSTAcStore>, router: Router) => (Promise<void> | void)
  //   /**
  //    * Function that is triggered when the web component is unmounted from the DOM.
  //    * @param el - web component
  //    * @param store - return value of the core STAC pinia store in `/core/store/stac.ts`
  //    */
  //   onUnmounted?: (el: Element, store: ReturnType<typeof useSTAcStore>, router: Router) => (Promise<void> | void)
  // }
  /** @ignore */
  type DynamicWebComponentProps = ExternalWebComponentProps // ExternalWebComponentProps | NodeModuleWebComponentProps

  /** @ignore */
  interface WidgetsContainerProps {
    widgets: Omit<WidgetConfig, 'layout'>[]
  }

  // eodash config types:
  /**
   * Widget type: `web-component` specification. The web component definition is imported using the `widget.link` property either from
   * an external endpoint, or an installed node_module.
   * Installed node_module web components import should be mapped in `/core/modulesMap.ts`,
   * then setting `widget.link`:`(import-map-key)` and `node_module`:`true`
   */
  interface WebComponentConfig {
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
    widget: ExternalWebComponentProps // | NodeModuleWebComponentProps
    /**
     * Widget type
     */
    type: 'web-component'
  }

  /**
   * Widget type: `internal` specification.
   * Internal widgets are Vue components inside the `/widgets` directory.
   */
  interface InternalComponentConfig {
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
  interface IFrameConfig {
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
  interface FunctionalWidget {
    /**
     * Provides a functional definition of the widget,
     * gets triggered whenever a stac object is selected.
     * @param selectedSTAC - currently selected stac object
     */
    defineWidget: (selectedSTAC: StacCatalog | StacCollection | StacItem | null) => Omit<StaticWidget, 'layout'>
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
  type StaticWidget = WebComponentConfig | InternalComponentConfig | IFrameConfig
  type WidgetConfig = StaticWidget | FunctionalWidget


  type BackgroundWidgetConfig = Omit<WebComponentConfig, 'layout' | 'title'> | Omit<InternalComponentConfig, 'layout' | 'title'> | Omit<IFrameConfig, 'layout' | 'title'> | Omit<FunctionalWidget, 'layout'>
  /**
   * Dashboard rendered widgets configuration specification.
   * 3 types of widgets are supported: `"iframe"`, `"internal"`, and `"web-component"`.
   * A specific configuration should be provided based on the type of the widget.
   */
  interface TemplateConfig {
    /**
     * Gap between widgets
     */
    gap?: number;
    /**
     * Widget rendered as the dashboard background.
     * Has the same specifications of [WidgetConfig](../readme#widgetconfig) without the `title` and  `layout` properties
     */
    background?: BackgroundWidgetConfig
    /**
     * Array of widgets that will be rendered as dashboard panels.
     */
    widgets: WidgetConfig[]
  }

  type ExternalURL = `${'https://' | 'http://'}${string}`;
  type InternalRoute = `/${string}`
  type StacEndpoint = `${'https://' | 'http://'}${string}/catalog.json`



  /**
   * Eodash configuration specification.
   */
  interface EodashConfig {
    /**
     * Configuration ID that defines the route of the dashboard.
     * Rendered dashboard can be accessed on route `/dashboard/config-id`
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
     * Rendered widgets configuration
     */
    template: TemplateConfig
  }
  /////////

  /// eodash store types
  interface EodashStore {
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
}
