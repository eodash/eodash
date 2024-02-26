//@ts-nocheck

import { mount } from 'cypress/vue'
import { Suspense, h } from 'vue'
import './commands'
import { routes } from '@/plugins/router'
import { createWebHistory, createRouter } from 'vue-router';
import { VApp } from 'vuetify/components'
import { createVuetify } from 'vuetify';
import eodashConfig from '@/eodashConfig';
import { eodashConfigKey } from '@/store/Keys';


export const vMountComponent = (component, options = {}) => {
  options.global = options.global || {}
  options.global.plugins = options.global.plugins || []

  // create router if one is not provided
  if (!options.router) {
    options['router'] = createRouter({
      routes,
      history: createWebHistory(process.env.BASE_URL)
    })
    options.router.useRouter = cy.spy(() => ({
      push: cy.spy()
    }))
  }

  if (!options.vuetify) {
    options.vuetify = createVuetify({})
  }

  // Add plugins
  options.global.plugins.push({
    install(app) {
      app.use(options.router)
      app.use(options.vuetify)
    },
  })
  options.global.provide = {
    [eodashConfigKey]: eodashConfig
  }

  return mount({ render: () => h(Suspense, [h(VApp, [h(component, { ...(options.props ?? {}) })])]) }, options).then((app) => {
    return cy.wrap({ wrapper: app.wrapper.getComponent(component), options }).as('vue')
  })
}

Cypress.Commands.add('vMount', vMountComponent);
Cypress.Commands.add('mount', mount);
// Example use:
// cy.mount(MyComponent)
