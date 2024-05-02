import Header from '@/components/Header.vue'
import { eodashKey } from '@/store/Keys'

describe('<Header />', () => {
  beforeEach(() => {
    cy.vMount(Header)
  })


  it('render component and app title', () => {
    //@ts-ignore
    cy.get("@vue").then(({ options }) => {
      const appTitle = /** @type {import('@/types').Eodash }*/
        (options.global.provide[eodashKey]).brand.name
      cy.get('.cursor-pointer').should('have.text', appTitle)
    })
  })


  it('render configured routes btns', () => {
    //@ts-expect-error
    cy.get('@vue').then(({ options }) => {
      const routeNames = /** @type {{ title:string; to:string }[]}*/(options.global.provide[eodashKey].routes)
        .map(r => r.title)
      let i = 0
      while (i < routeNames.length) {
        cy.get(`.v-toolbar-items > :nth-child(${i + 1})`).contains(routeNames[i])
        i++
      }
    })
  })
})
