import vuetify from './vuetify';
import { createPinia } from 'pinia';
import eodash from '@/eodash';
import { eodashKey } from '@/utils/keys';
import store from '../store';

export const pinia = createPinia();

/**
 * @param {import('vue').App} app
 */
export function registerPlugins(app) {
  window.eodashStore = store;

  app.use(vuetify)
    .use(pinia)
    .provide(eodashKey, eodash);
}
