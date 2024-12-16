import App from "./App.vue";
import { defineCustomElement } from "vue";
import { registerPlugins } from "./plugins";

/**
 *  @type {import("vue").VueElementConstructor<
 *  import("vue").ExtractPropTypes<{ config: string }>>}
 * */
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
