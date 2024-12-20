/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
declare interface Window {
  eodashStore: typeof import("@/store").default;
  setEodashLoglevel: typeof import("loglevel").setLevel;
}
declare module "user:config" {
  const eodash: import("@/types").Eodash | Promise<import("@/types").Eodash>;
  export default eodash;
}
declare module "stac-js" {
  export const Collection: {
    new (data?: object): import("stac-ts").StacCollection;
  };
  export const Item: { new (data?: object): import("stac-ts").StacItem };
}
declare module "stac-js/src/http.js" {
  const toAbsolute: (...args: string[]) => string;
  export { toAbsolute };
}
