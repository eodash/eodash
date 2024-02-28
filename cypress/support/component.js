import { mount } from 'cypress/vue'
import { Suspense, h } from 'vue'
import './commands';
import { VApp } from 'vuetify/components'
import { mockedEodashConfig, registerPlugins } from './utils';
import { eodashConfigKey } from '@/store/Keys';

/**
 * @param {import('vue').DefineComponent<{},{},any> | Element} OriginalComponent
 * @param {Parameters<typeof mount >['1'] & {
 * vuetify?:import('vuetify/lib/framework.mjs').VuetifyOptions;
 * pinia?:import('@pinia/testing').TestingOptions;
 * router?:import('vue-router').Router
 * } } options
 */
export const vMountComponent = (OriginalComponent, options = {}) => {
  options.global = options.global ?? {}
  options.global.mocks = options.global.mocks ?? {
    "$router": {
      push: cy.spy().as('routerPush')
    }
  }
  options.global.plugins = options.global.plugins ?? []

  const props = options.props ?? {}
  delete options.props

  // Add plugins
  options.global.plugins.push({
    install(app) {
      registerPlugins(app, options.vuetify, options.pinia, options.router)
    },
  })

  options.global.provide = {
    [eodashConfigKey]: mockedEodashConfig,
  }

  return mount(
    {
      render: () => h(Suspense,
        [h(VApp,
          [
            h(OriginalComponent, props)
          ]
        )]
      )
    }, options)
    .then((app) => {
      //@ts-ignore
      return cy.wrap({ wrapper: app.wrapper.getComponent(OriginalComponent), options }).as('vue')
    })
}

Cypress.Commands.add('vMount', vMountComponent);
Cypress.Commands.add('mount', mount);
// Example use:
// cy.mount(MyComponent)
