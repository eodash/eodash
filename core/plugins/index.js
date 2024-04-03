import vuetify from './vuetify';
import router from './router';
import { createPinia } from 'pinia';
import eodash from '@/eodash';
import { eodashKey } from '@/store/Keys';
import store from '../store';
import { createHead } from '@unhead/vue'
import VueCookies from 'vue3-cookies'

export const pinia = createPinia();
const head = createHead()

/**
 * @param {import('vue').App} app
 */
export function registerPlugins(app) {
  window.eodashStore = store;

  app.use(vuetify)
    .use(head)
    .use(router)
    .use(pinia)
    .use(VueCookies, {
      expireTimes: "30d",
      sameSite: "Lax"
    })
    .provide(eodashKey, eodash);
}
