import MobileLayout from '@/components/MobileLayout.vue'
import { eodashConfigKey } from '@/store/Keys'

describe('<MobileLayout />', () => {
  beforeEach(() => {
    cy.vMount(MobileLayout)
  })

  it('renders successfully', () => {
    cy.get("@vue").should('exist')
    cy.get('.v-row').should('exist')
  })

  it('renders statically configured titles in tabs ', () => {
    //@ts-ignore
    cy.get('@vue').then(({ options }) => {
      /** @type {StaticWidget[]} */
      (options.global.provide[eodashConfigKey].template.widgets).forEach((widget, idx) => {
        cy.get(`.v-row > :nth-child(${idx + 1})`).contains(widget.title)
      })
    })
  })

})
