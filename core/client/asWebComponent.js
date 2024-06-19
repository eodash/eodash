import SuspensedDashboard from "./SuspensedDashboard.ce.vue";
import { defineCustomElement } from "vue";
/** @type {import("./asWebComponent").EodashConstructor} */
export const Eodash = defineCustomElement(SuspensedDashboard);

export function register() {
  customElements.define("eo-dash", Eodash);
}

export { default as store } from "@/store";

register();
