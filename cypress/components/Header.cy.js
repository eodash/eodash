import Header from '@/components/Header.vue'
import { eodashConfigKey } from '@/store/Keys'

describe('<Header />', () => {
  beforeEach(() => {
    cy.vMount(Header)
  })


  it('render component and app title', () => {
    //@ts-ignore
    cy.get("@vue").then(({ options }) => {
      const appTitle = /** @type {EodashConfig }*/
        (options.global.provide[eodashConfigKey]).brand.name
      cy.get('.cursor-pointer').should('have.text', appTitle)
    })
  })


  it('render configured routes btns', () => {
    //@ts-expect-error
    cy.get('@vue').then(({ options }) => {
      const routeNames = options.global.provide[eodashConfigKey].routes.map(
        /** @param {{ title:string; to:string }} r */
        r => r.title)
      cy.get('.v-toolbar-items').children().each(btn => {
        const idx = routeNames.indexOf(btn.text())
        if (idx !== -1) {
          routeNames.splice(idx, 1)
        } else {
          throw new Error("cant find route")
        }
      })
    })
  })
})
