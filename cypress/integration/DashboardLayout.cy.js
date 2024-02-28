import DashboardLayout from '@/components/DashboardLayout.vue'
import { eodashConfigKey } from '@/store/Keys'

describe('<DashboardLayout />', () => {
  /** @type {WidgetConfig[]|null} */
  let widgets = null
  beforeEach(() => {
    cy.vMount(DashboardLayout).then(({ options }) => {
      //@ts-ignore
      widgets = options.global.provide[eodashConfigKey].template.widgets
    })
  })

  it('mount successfully', () => {
    cy.get('@vue').should('exist')
  })

  it('renders background widget', () => {
    cy.get('.bg-widget').should('exist')
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

})
