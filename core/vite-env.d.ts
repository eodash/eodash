/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare interface Window {
  eodashStore: EodashStore
}
declare module '@eox/itemfilter' {
  export const EOxItemFilter: CustomElementConstructor
}
declare module '@eox/stacinfo' {
  export const EOxStacInfo: CustomElementConstructor
}
declare module '@eox/map' {
  export const EOxMap: CustomElementConstructor
}
declare module '@eox/chart' {
  export const EOxChart: CustomElementConstructor
}
declare module '@eox/layercontrol' {
  export const EOxLayerControl: CustomElementConstructor
}
declare module '@eox/timecontrol' {
  export const EOxTimeControl: CustomElementConstructor
}
declare module '@eox/jsonform' {
  export const EOxJSONForm: CustomElementConstructor
}
