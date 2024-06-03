/**
 * Eodash CLI configuration
 * @group CLI
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
  /** set a custom path for importing user defined internal widgets */
  widgets?: string
  /** builds eodash as a web component library */
  lib?: boolean
}
/**
 *  helper function that provides intellisense
 *  without the need for JSDOC for `eodash.config.js`:
 * @group CLI
 */
export declare const defineConfig: (config: EodashConfig) => EodashConfig
