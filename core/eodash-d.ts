import { useSTAcStore } from "@/store/stac"
import { ThemeDefinition } from "vuetify/lib/framework.mjs";
import { Ref } from "vue";
import type { Map } from 'ol'
/**
 * Eodash configuration specification.
 */
export declare interface EodashConfig {
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
     * Indicates if the the current selected STAC contains a WMS type link.
     */
    hasWMS: Ref<boolean>
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
