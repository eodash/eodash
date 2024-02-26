import Footer from '@/components/Footer.vue'
import { eodashConfigKey } from '@/store/Keys'

describe('<Footer />', () => {
  beforeEach(() => {
    cy.mount(Footer)
  })

  it('render component and footer title', () => {
    //@ts-expect-error
    cy.get("@vue").then(({ options }) => {

      const footerTitle = /** @type {EodashConfig }*/
        (options.global.provide[eodashConfigKey]).brand.shortName ??
         /** @type {EodashConfig }*/ (options.global.provide[eodashConfigKey]).brand.name
      cy.get('.footer-text').should('include.text', footerTitle)
    })
  })
})
