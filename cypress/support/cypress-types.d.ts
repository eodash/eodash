/// <reference types="cypress" />
import { vMountComponent } from './component'
import { mount } from 'cypress/vue';

declare global {
  namespace Cypress {
    interface Chainable {
      vMount: typeof vMountComponent
      mount: typeof mount
    }
  }
}
