/// <reference types="cypress" />
import { vMountComponent as _vMount } from "./component";
import { mount as _mount } from "cypress/vue";

type VueMountOptions = Parameters<typeof _mount<object, object>>["1"] & {
  vuetify?: import("vuetify/lib/framework.mjs").VuetifyOptions;
  pinia?: import("@pinia/testing").TestingPinia | import("pinia").Pinia;
};
declare global {
  namespace Cypress {
    interface Chainable {
      vMount: typeof _vMount;
      mount: typeof _mount;
      get(el: "@vue"): Chainable<{
        wrapper: Record<string, unknown>;
        options: VueMountOptions;
      }>;
    }
  }
}
