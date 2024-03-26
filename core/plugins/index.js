/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify';
import router from './router';
import { createPinia } from 'pinia';
import eodash from '@/eodash';
import { eodashKey } from '@/store/Keys';
import store from '../store';
import { createHead } from '@unhead/vue'

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
    .provide(eodashKey, eodash);
}
