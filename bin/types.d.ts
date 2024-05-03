/**
 * Extending [Vite's](https://vitejs.dev/) config to configure eodash's server, build and setup.
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
   * Base public path
   */
  base?: string;
  /**
   * Build target folder path
   */
  outDir?: string;
  /**
   * Path to statically served assets folder, can be set to `false`
   * to disable serving assets statically
   **/
  publicDir?: string | false;
  /**
   * Cache folder
   */
  cacheDir?: string
  /** Specifies main entry file, exporting `createEodash`*/
  entryPoint?: string
  /**
   * File exporting eodash client runtime config
   */
  runtime?: string
  widgets?: string
  /** builds eodash as a web component library */
  lib?: boolean
}

export declare const definConfig: (config: EodashConfig) => EodashConfig
