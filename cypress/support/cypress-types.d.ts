/// <reference types="cypress" />
import { mountComponent } from './component'

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mountComponent
    }
  }
}
