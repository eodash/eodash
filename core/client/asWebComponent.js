import App from "./App.vue";
import { defineCustomElement } from "vue";
import { registerPlugins } from "./plugins";
/**
 *  @type {import("vue").VueElementConstructor<
 *  import("vue").ExtractPropTypes<{ config: string }>>}
 * */
const EodashConstructor = defineCustomElement(App, {
  //styles will be imported here using vite-plugin-vue-custom-element-style-injector
  shadowRoot: !import.meta.env.DEV,
  configureApp(app) {
    registerPlugins(app);
  },
});
function register() {
  customElements.define("eo-dash", EodashConstructor);
}

export { default as store } from "@/store";
export { register, EodashConstructor };
register();
