import IframeWrapper from '@/components/IframeWrapper.vue'

describe('<IframeWrapper />', () => {

  it('renders external hello world html', () => {
    cy.fixture('../fixtures/basic.html',).then(/** @param {string} html */(html) => {
      const url = URL.createObjectURL(new Blob([html], { type: "text/html" })).toString()
      cy.mount(IframeWrapper, {
        props: {
          src: url
        }
      }).then(({ wrapper }) => {
        cy.get(wrapper.wrapperElement)
          .should('have.attr', 'src', url)
        cy.get(wrapper.wrapperElement.contentWindow.document.getElementsByTagName("H2")).should('have.text', "Hello World")
      })
    })
  })
})
