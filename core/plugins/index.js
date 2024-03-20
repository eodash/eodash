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

export const pinia = createPinia();

/**
 * @param {import('vue').App} app
 */
export function registerPlugins(app) {
  window.eodashStore = store;

  app.use(vuetify)
    .use(router)
    .use(pinia)
    .provide(eodashKey, eodash);
}
