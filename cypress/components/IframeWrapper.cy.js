// @ts-nocheck
import IframeWrapper from '@/components/IframeWrapper.vue'


describe('<IframeWrapper />', () => {

  describe("renders Hello World html", () => {

    beforeEach(() => {
      cy.fixture('../fixtures/hello-world.html').then(/** @param {string} html */(html) => {
        const url = URL.createObjectURL(new Blob([html], { type: "text/html" })).toString()
        cy.wrap(html).as('html')
        cy.wrap(url).as('url')
      })

      cy.get('@url').then((url) => {
        cy.vMount(IframeWrapper, {
          props: {
            src: url
          }
        })
      })
    })

    it('iframe renders internal DOM', () => {
      cy.get('@vue').then(vue => {
        cy.get(/** @type {HTMLIFrameElement} */(vue.wrapper.element)).its('0.contentDocument').should('exist')
      })
    })

    it('external html contains "Hello world"', () => {
      cy.get('@html').then(html => {
        expect(html).to.contain('Hello World')
      })
    })

    it('iframe contains "Hello World"', () => {
      cy.get('@vue').then(vue => {
        cy.get(/** @type {HTMLIFrameElement} */(vue.wrapper.element)).
          its('0.contentDocument')
          .its('body')
          .should('contain', "Hello World")
      })
    })


  })
})
