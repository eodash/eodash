import MobileLayout from '@/components/MobileLayout.vue'
import { eodashKey } from '@/utils/keys'

describe('<MobileLayout />', () => {
  beforeEach(() => {
    cy.vMount(MobileLayout, {
      global: {
        stubs: {
          "EodashDatePicker": true,
          "EodashItemFilter": true,
          "EodashMap": true,
          "DynamicWebComponent": true
        }
      }
    })
  })

  it('renders successfully', () => {
    cy.get("main", { timeout: 10000 }).should("exist")
  })

  it('renders titles in tabs ', () => {
    //@ts-expect-error
    cy.get('@vue').then(({ options }) => {
      /** @type {import('@/types').Widget[]} */
      (options.global.provide[eodashKey].template.widgets).forEach((widget, idx) => {
        const title = "defineWidget" in widget ? widget.defineWidget(null).title : widget.title
        cy.get(`button[value="${idx}"]`).contains(title)
      })
    })
  })

  it("render background widget", () => {
    cy.get("#bg-widget").should("exist")
  })

  it("close opened tab", () => {
    cy.get("#overlay > .v-btn").then(els => {
      els[0].click()
    })
    cy.get(".v-slide-group-item--active").should('not.exist')
  })

  it("open new tab", () => {
    //@ts-expect-error
    cy.get("@vue").then(({ options }) => {
      const lastIdx =  /** @type {import('@/types').Eodash} */
        (options.global.provide[eodashKey]).template.widgets.length - 1
      cy.get(`.v-slide-group__content button[value=${lastIdx}]`).click({ force: true })

      cy.get("#overlay").should("exist")
    })
  })

})
