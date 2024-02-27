import { createVuetify } from 'vuetify';
import { createWebHistory, createRouter } from 'vue-router'
import { routes } from '@/plugins/router'
import { createTestingPinia } from "@pinia/testing"

/**
 * @param {import("vue").App} app
 * @param {import('vuetify/lib/framework.mjs').VuetifyOptions} vuetifyOptions
 * @param {import("@pinia/testing").TestingOptions | undefined} piniaOptions
 *
 */
export const registerPlugins = (app, vuetifyOptions = {}, piniaOptions = { createSpy: cy.stub() }) => {
  const router = createRouter({
    routes,
    history: createWebHistory(process.env.BASE_URL)
  })
  app.use(router)

  const vuetify = createVuetify(vuetifyOptions)
  app.use(vuetify)

  const pinia = createTestingPinia(piniaOptions)
  app.use(pinia)
}
