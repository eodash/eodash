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
  properties?: Record<string, unknown>
  /**
   * Triggered when the web component is mounted in the DOM.
   * @param el - web component
   * @param store - return value of the core STAC pinia store in `/core/client/store/stac.ts`
   */
  onMounted?: (el: Element | null, store: ReturnType<typeof import("./store/stac").useSTAcStore>) => (Promise<void> | void)
  /**
   * Triggered when the web component is unmounted from the DOM.
   * @param el - web component
   * @param store - return value of the core STAC pinia store in `/core/client/store/stac.ts`
   */
  onUnmounted?: (el: Element | null, store: ReturnType<typeof import("./store/stac").useSTAcStore>) => (Promise<void> | void)
}


/** @ignore */
export interface WidgetsContainerProps {
  widgets: Omit<Widget, 'layout'>[]
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
  widget: {
    /**
     * Internal Vue Components inside the [widgets](https://github.com/eodash/eodash/tree/main/widgets) folder. Referenced
     * using their name without the .vue extention
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
   * Provides a functional definition of widgets,
   * gets triggered whenever a STAC object is selected, and only renders the returned configuration
   * if the `id` doesn't match the currently rendered `id`
   * @param selectedSTAC - Currently selected STAC object
   */
  defineWidget: (selectedSTAC: import("stac-ts").StacCatalog |
    import("stac-ts").StacCollection | import("stac-ts").StacItem | null) => Omit<StaticWidget<T>, 'layout' | 'slidable'> | undefined | null
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
   * loading widget
   */
  loading?: BackgroundWidget<T>
  /**
   * Widget rendered as the dashboard background.
   * Has the same specifications of `Widget` without the `title` and  `layout` properties
   * @see {@link Widget}
   */
  background?: BackgroundWidget<T>
  /**
   * Array of widgets that will be rendered as dashboard panels.
   */
  widgets: Widget<T>[]
}

/** @ignore */
export type StacEndpoint = `${'https://' | 'http://'}${string}/catalog.json`

/**
 * @ignore
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
  id?: string;
  /**
   * Root STAC catalog endpoint
   **/
  stacEndpoint: StacEndpoint
  /**
   * Brand specifications.
   */
  brand: {
    /** Removes the dashboard layout */
    noLayout?: boolean
    /** custom error message to alert the users if something crashes */
    errorMessage?: string
    /**
     * Automatically fetches the specified font family from google fonts. if the [link](#font-link) property is specified
     * the font family will be fetched from the provided source instead.
     */
    font?: {
      /**
       * Link to stylesheet that defines font-face. Could be either a relative or absolute URL.
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
     * Brand logo
     */
    logo?: string;
    /**
     * Dashboard theme as a custom [vuetifyJs theme](https://vuetifyjs.com/en/features/theme/).
     */
    theme?: import("vuetify/lib/index.mjs").ThemeDefinition
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
    currentUrl: import("vue").Ref<string>
    /**
    * currently selected datetime
    */
    datetime: import("vue").Ref<string>
    /**
     * Currently selected indicator
     */
    indicator: import("vue").Ref<string>
  }
  actions: {};
  /**
   *  Pinia store definition used to navigate the root STAC catalog.
   */
  stac: {
    useSTAcStore: typeof import("./store/stac").useSTAcStore
  }
}
///////
/**
 * the project's entry point should export this function as a default
 * to instantiate eodash
 * @group Eodash
 * @param config
 */
export declare const createEodash: (config: ((store: EodashStore) => Eodash | Promise<Eodash>) | Eodash) => Eodash | Promise<Eodash>

/** @group EodashStore */
export declare const store: EodashStore