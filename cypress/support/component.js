//@ts-nocheck

import { Suspense, defineComponent, h } from 'vue'
import './commands'
import { routes } from '@/plugins/router'


import { mount } from 'cypress/vue'
import { createWebHistory, createRouter } from 'vue-router';
import { VApp } from 'vuetify/components'

import { createVuetify } from 'vuetify';
import eodashConfig from '@/eodashConfig';
import { eodashConfigKey } from '@/store/Keys';


export const mountComponent = (component, options = {}) => {
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

  return mount({ render: () => h(Suspense, [h(VApp, [h(component, { ...(options.props ?? {}) })])]) }, options).then((comp) => {
    return cy.wrap({ wrapper: comp.wrapper.getComponent(component), options }).as('vue')
  })
}
Cypress.Commands.add('mount', mountComponent);
// Example use:
// cy.mount(MyComponent)
