import Footer from '@/components/Footer.vue'
import { eodashKey } from '@/store/Keys'

describe('<Footer />', () => {
  beforeEach(() => {
    cy.vMount(Footer)
  })

  it('render component and footer title', () => {
    //@ts-expect-error
    cy.get("@vue").then(({ options }) => {
      const footerText =/** @type {import('@/types').Eodash} */ (options.global.provide[eodashKey]).brand.footerText ?? ""
      cy.get('.footer-text').should('include.text', footerText)
    })
  })
})
