/** @group WebComponent */
type EodashConstructor = import("vue").VueElementConstructor<import("vue").ExtractPropTypes<{ config: string }>>
/**
 *  Eodash Web Component constructor
 * @group WebComponent
 */
export declare const Eodash: EodashConstructor
/**
 * Registers `eo-dash` as Custom Element in the window
 * @group WebComponent
 */
export declare function register(): void

/**
 * Eodash store @see EodashStore
 * @group WebComponent
 */
export declare const store: import("./types").EodashStore
