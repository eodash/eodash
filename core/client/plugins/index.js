import vuetify from "./vuetify";
import { createPinia } from "pinia";
import store from "../store";
import log from "loglevel";
import { eodashKey } from "@/utils/keys";
import { reactive } from "vue";

export const pinia = createPinia();

// what a web component throws after its setter returned lands here or nowhere
window.addEventListener("unhandledrejection", (event) =>
  console.error("[eodash] Unhandled rejection:", event.reason),
);
window.addEventListener("error", (event) =>
  console.error("[eodash] Uncaught error:", event.error ?? event.message),
);

/** @param {import("vue").App} app */
export function registerPlugins(app) {
  window.eodashStore = store;
  window.setEodashLoglevel = log.setLevel;

  app
    .use(vuetify)
    .use(pinia)
    //@ts-expect-error reactive placeholder for eodash
    .provide(eodashKey, reactive({}));
}
