import vuetify from "./vuetify";
import { createPinia } from "pinia";
import store from "../store";
import log from "loglevel";
import { eodashKey } from "@/utils/keys";
import { reactive } from "vue";

export const pinia = createPinia();

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
