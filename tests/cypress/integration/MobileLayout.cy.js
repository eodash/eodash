// import MobileLayout from '@/components/MobileLayout.vue'
// import { eodashKey } from '@/store/Keys'

// describe('<MobileLayout />', () => {
//   beforeEach(() => {
//     cy.vMount(MobileLayout)
//   })

//   it('renders successfully', () => {
//     cy.get("@vue").should('exist')
//     cy.get('.v-row').should('exist')
//   })

//   it('renders titles in tabs ', () => {
//     //@ts-ignore
//     cy.get('@vue').then(({ options }) => {
//       /** @type {import('@/types').Widget[]} */
//       (options.global.provide[eodashKey].template.widgets).forEach((widget, idx) => {
//         const title = "defineWidget" in widget ? widget.defineWidget(null).title : widget.title
//         cy.get(`value[${idx}]`).contains(title)
//       })
//     })
//   })

// })
