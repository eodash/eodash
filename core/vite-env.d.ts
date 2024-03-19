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
declare module 'user:config' {
  const eodash: import("@/types").Eodash | Promise<import("@/types").Eodash>;
  export default eodash
}
