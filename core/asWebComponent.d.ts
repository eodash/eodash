type EodashConstructor = import("vue").VueElementConstructor<import("vue").ExtractPropTypes<{ config: string }>>
/**
 * Eodash Web Component constructor
 */
export declare const Eodash: EodashConstructor
/**
 * Registers `eo-dash` as Custom Element in the window
 */
export declare function register(): void

/**
 * Eodash store @see @link import("./types").EodashStore
 */
export declare const store: import("./types").EodashStore
