/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare interface Window {
  eodashStore: import('@/store/Types').EodashStore
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
