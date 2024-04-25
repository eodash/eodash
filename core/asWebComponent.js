import SuspensedDashboard from './SuspensedDashboard.ce.vue';
import { defineCustomElement } from 'vue'

export const Eodash = defineCustomElement(SuspensedDashboard)

export function register() {
  customElements.define('eo-dash', Eodash)
}

register()
