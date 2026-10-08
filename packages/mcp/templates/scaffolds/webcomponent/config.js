export default {
  id: "embedded-dash",
  stacEndpoint:
    "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json",
  template: {
    gap: 16,
    background: {
      id: "background-map",
      type: "internal",
      widget: {
        name: "EodashMap",
      },
    },
    widgets: [
      {
        id: "Tools",
        type: "internal",
        title: "Tools",
        layout: { x: 0, y: 0, w: 3, h: 2 },
        widget: {
          name: "EodashTools",
        },
      },
      {
        id: "Layercontrol",
        type: "internal",
        title: "Layers",
        layout: { x: 0, y: 2, w: 3, h: 10 },
        widget: {
          name: "EodashLayerControl",
        },
      },
      {
        id: "Datepicker",
        type: "internal",
        title: "Date",
        layout: { x: 3, y: 10, w: 6, h: 2 },
        widget: {
          name: "EodashDatePicker",
        },
      },
    ],
  },
};
