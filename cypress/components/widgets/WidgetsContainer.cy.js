//@ts-nocheck
import WidgetsContainer from '^/WidgetsContainer.vue'

describe('<WidgetsContainer />', () => {
  const widgets = [
    {
      id: Symbol(),
      title: 'Tools',
      type: 'web-component',
      widget: {
        link: '@eox/itemfilter',
        node_module: true,
        properties: {
          config: {
            titleProperty: "title",
            filterProperties: [
              {
                keys: ["title", "themes"],
                title: "Search",
                type: "text",
                expanded: true,
              },
              {
                key: "themes",
                title: "Theme",
                type: "multiselect",
                featured: true
              },
            ],
            aggregateResults: "themes",
            enableHighlighting: true,
          }
        },
        tagName: 'eox-itemfilter'
      },
    },
    {
      title: 'Map',
      type: "web-component",
      widget: {
        link: '@eox/map',
        node_module: true,
        properties: {
          class: "fill-height fill-width overflow-none",
          center: [15, 48],
          layers: [{ type: "Tile", source: { type: "OSM" } }],
        },
        tagName: 'eox-map',
      },
    }
  ]

  beforeEach(() => {
    cy.vMount(WidgetsContainer, {
      props: {
        widgets
      },
    })
  })

  it('renders successfully', () => {
    cy.get('@vue').should('exist')
    cy.get('details').should('exist')
  })

  it('renders statically configured titles', () => {
    for (let index = 0; index < widgets.length; index++) {
      cy.get(`:nth-child(${index + 1}) > summary`).contains(widgets[index].title)
    }
  })


})
