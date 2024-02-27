import { mount } from 'cypress/vue'
import { Suspense, h } from 'vue'
import './commands';
import { VApp } from 'vuetify/components'
import { registerPlugins } from './utils';
import eodashConfig from '@/eodashConfig';
import { eodashConfigKey } from '@/store/Keys';


/**
 *
 * @param {import('vue').DefineComponent<{},{},any> } component
 * @param {Parameters<typeof mount >['1'] & {
 * vuetify?:import('vuetify/lib/framework.mjs').VuetifyOptions;
 * pinia?:import('@pinia/testing').TestingOptions
 * } } options
 */
export const vMountComponent = (component, options = {}) => {
  options.global = options.global ?? {}
  options.global.plugins = options.global.plugins ?? []

  // Add plugins
  options.global.plugins.push({
    install(app) {
      registerPlugins(app, options.vuetify, options.pinia)
    },
  })

  options.global.provide = {
    [eodashConfigKey]: eodashConfig
  }

  return mount({
    render: () => h(Suspense,
      [h(VApp,
        [
          h(component, options.props)
        ]
      )]
    )
  }, options).then((app) => {
    //@ts-ignore
    return cy.wrap({ wrapper: app.wrapper.getComponent(component), options }).as('vue')
  })
}

Cypress.Commands.add('vMount', vMountComponent);
Cypress.Commands.add('mount', mount);
// Example use:
// cy.mount(MyComponent)
