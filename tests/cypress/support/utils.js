import { createVuetify } from 'vuetify';
import { createWebHistory, createRouter } from 'vue-router'
import { routes } from '@/plugins/router'
import { createTestingPinia } from "@pinia/testing"
/**
 * @param {import("vue").App} app
 * @param {Parameters<typeof import('cypress/vue').mount >['1'] & {
 * vuetify?:import('vuetify/lib/framework.mjs').VuetifyOptions;
 * pinia?:import('@pinia/testing').TestingPinia | import("pinia").Pinia;
 * router?:import('vue-router').Router
 * } } options
 *
 */
export const registerPlugins = async (app, options) => {

  options.router = options.router ?? createRouter({
    routes,
    history: createWebHistory(process.env.BASE_URL)
  })
  app.use(options.router)

  options.vuetify = options.vuetify ?? {}
  const vuetify = createVuetify(options.vuetify)
  app.use(vuetify)

  options.pinia = options.pinia ?? createTestingPinia({ createSpy: cy.stub() })
  app.use(options.pinia)
  options.router.push('/dashboard')
  await options.router.isReady()
}
