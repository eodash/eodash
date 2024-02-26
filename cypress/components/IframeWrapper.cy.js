// @ts-nocheck
import IframeWrapper from '@/components/IframeWrapper.vue'


describe('<IframeWrapper />', () => {

  it('renders external html', () => {
    cy.fixture('../fixtures/hello-world.html').then(/** @param {string} html */(html) => {
      const url = URL.createObjectURL(new Blob([html], { type: "text/html" })).toString()
      cy.mount(IframeWrapper, {
        props: {
          src: url
        }
      }).then($vue => {
        cy.get($vue.wrapper.wrapperElement)
          .should('have.attr', 'src', url)
        cy.get(/** @type {HTMLIFrameElement} */($vue.wrapper.wrapperElement).contentWindow?.document.getElementsByTagName("H2")).should('have.text', "Hello World")
      })
    })
  })
})
