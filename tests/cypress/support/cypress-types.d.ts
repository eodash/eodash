/// <reference types="cypress" />
import { vMountComponent } from "./component";
import { mount } from "cypress/vue";

type VueMountOptions = Parameters<typeof mount<object, object>>["1"] & {
  vuetify?: import("vuetify/lib/framework.mjs").VuetifyOptions;
  pinia?: import("@pinia/testing").TestingPinia | import("pinia").Pinia;
};
declare global {
  namespace Cypress {
    interface Chainable {
      vMount: typeof vMountComponent;
      mount: typeof mount;
      get(el: "@vue"): Chainable<{
        wrapper: Record<string, unknown>;
        options: VueMountOptions;
      }>;
    }
  }
}
