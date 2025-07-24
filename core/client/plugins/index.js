import vuetify from "./vuetify";
import { createPinia } from "pinia";
import VCalendar from "v-calendar";
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
    // Use plugin with optional defaults
    .use(VCalendar, {})
    //@ts-expect-error reactive placeholder for eodash
    .provide(eodashKey, reactive({}));
}
