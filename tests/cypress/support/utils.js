import { createVuetify } from 'vuetify';
import { createWebHistory, createRouter } from 'vue-router'
import { routes } from '@/plugins/router'
import { createTestingPinia } from "@pinia/testing"

/**
 * @param {import("vue").App} app
 * @param {import('vuetify/lib/framework.mjs').VuetifyOptions} vuetifyOptions
 * @param {import("@pinia/testing").TestingOptions | undefined} piniaOptions
 * @param {import('vue-router').Router | undefined} customRouter
 *
 */
export const registerPlugins = async (app, vuetifyOptions = {}, piniaOptions = { createSpy: cy.stub() }, customRouter) => {
  const router = customRouter ? customRouter : createRouter({
    routes,
    history: createWebHistory(process.env.BASE_URL)
  })
  app.use(router)

  const vuetify = createVuetify(vuetifyOptions)
  app.use(vuetify)

  const pinia = createTestingPinia(piniaOptions)
  app.use(pinia)

  router.push('/dashboard')
  await router.isReady()
}
