/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare interface Window {
  eodashStore: import("@/types").EodashStore
}
declare module '@eox/stacinfo' {
  export const EOxStacInfo: CustomElementConstructor
}
declare module '@eox/map' {
  export const EOxMap: CustomElementConstructor
}
declare module '@eox/itemfilter' {
  export const EOxItemFilter: CustomElementConstructor
}
declare module 'user:config' {
  const eodash: import("@/types").Eodash | Promise<import("@/types").Eodash>;
  export default eodash
}
declare module "stac-js" {
  const STAC: any, Collection: any, Item: any
  export { STAC, Collection, Item }
}
declare module "stac-js/src/http.js" {
  const toAbsolute: any
  export { toAbsolute }
}
