import App from "./App.vue";
import { defineCustomElement } from "vue";
import { registerPlugins } from "./plugins";

/** @type {import("./asWebComponent").EodashConstructor} */
export const Eodash = defineCustomElement(App, {
  shadowRoot: false,
  configureApp(app) {
    registerPlugins(app);
  },
});

export function register() {
  customElements.define("eo-dash", Eodash);
}

export { default as store } from "@/store";

register();
