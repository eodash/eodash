import DynamicWebComponent from '@/components/DynamicWebComponent.vue'

describe('<DynamicWebComponent />', () => {

  it('renders successfully from external URL', () => {
    cy.vMount(DynamicWebComponent, {
      /** @type {import('@/types').WebComponentProps} */
      //@ts-ignore
      props: {
        link: "https://cdn.jsdelivr.net/npm/ldrs/dist/auto/mirage.js",
        tagName: "l-mirage",
        properties: {
          class: "align-self-center justify-self-center",
          size: "120",
          speed: "2.5",
          color: "#004170"
        }
      }
    })
    cy.get("l-mirage", { timeout: 10000 }).should("exist")
  })

  it('renders successfully from import map', () => {
    cy.vMount(DynamicWebComponent, {
      /** @type {import('@/types').WebComponentProps} */
      //@ts-ignore
      props: {
        link: async () => await import("@eox/stacinfo"),
        tagName: "eox-stacinfo",
        properties: {
          for: "https://esa-eodash.github.io/RACE-catalog/RACE/cruises_impact/collection.json",
          allowHtml: "true",
        },
      }
    })
    cy.get("eox-stacinfo", { timeout: 10000 }).should("exist")
  })
})
