import DashboardLayout from '@/components/DashboardLayout.vue'
import { eodashKey } from '@/utils/keys'

describe('<DashboardLayout />', () => {
  /** @type {import('@/types').Widget[]|null} */
  let widgets = null
  beforeEach(() => {
    cy.vMount(DashboardLayout, {
      global: {
        stubs: {
          "EodashDatePicker": true,
          "EodashItemFilter": true,
          "EodashMap": true
        }
      }
    }).then(({ options }) => {
      //@ts-expect-error
      widgets = options.global.provide[eodashKey].template.widgets
    })
  })

  it('mount successfully', () => {
    cy.get('@vue').then(() => {
      cy.get("main", { timeout: 10000 }).should('exist')
    })
  })


  it('check layout elements based on X position', () => {
    widgets?.forEach((widget) => {
      cy.get(`[x="${widget.layout.x}"]`).should('exist')
    })
  })

  it('check layout elements based on Y position', () => {
    widgets?.forEach((widget) => {
      cy.get(`[y="${widget.layout.y}"]`).should('exist')
    })
  })

  it('check layout elements based on height', () => {
    widgets?.forEach((widget) => {
      cy.get(`[h="${widget.layout.h}"]`).should('exist')
    })
  })

  it('check layout elements based on width', () => {
    widgets?.forEach((widget) => {
      cy.get(`[w="${widget.layout.w}"]`).should('exist')
    })
  })

  it('renders background widget', () => {
    cy.get('#bg-widget').should('exist')
  })

})
