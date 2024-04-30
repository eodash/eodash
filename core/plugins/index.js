import vuetify from './vuetify';
import { createPinia } from 'pinia';
import eodash from '@/eodash';
import { eodashKey } from '@/utils/keys';
import store from '../store';
import { createHead } from '@unhead/vue'

export const pinia = createPinia();
export const head = createHead()

/**
 * @param {import('vue').App} app
 */
export function registerPlugins(app) {
  window.eodashStore = store;

  app.use(vuetify)
    .use(head)
    .use(pinia)
    .provide(eodashKey, eodash);
}
