import vuetify from "./vuetify";
import { createPinia } from "pinia";
import eodash from "@/eodash";
import VCalendar from "v-calendar";
import { eodashKey } from "@/utils/keys";
import store from "../store";
import log from "loglevel";

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
    .provide(eodashKey, eodash);
}
