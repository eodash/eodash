import { mdiViewDashboardVariant } from "@mdi/js";

/** @type {import("@/types").Template} */
export default {
  gap: 16,
  loading: {
    id: Symbol(),
    type: "web-component",
    widget: {
      // https://uiball.com/ldrs/
      link: "https://cdn.jsdelivr.net/npm/ldrs/dist/auto/mirage.js",
      tagName: "l-mirage",
      properties: {
        class: "align-self-center justify-self-center",
        size: "120",
        speed: "2.5",
        color: "#004170",
      },
    },
  },
  background: {
    id: "background-map",
    type: "internal",
    widget: {
      name: "EodashMap",
      properties: {
        enableCompare: true,
      },
    },
  },
  widgets: [
    {
      id: Symbol(),
      type: "internal",
      title: "Tools",
      layout: { x: 0, y: 0, w: 3, h: 1 },
      widget: {
        name: "EodashTools",
        properties: {
          layoutTarget: "expert",
          layoutIcon: mdiViewDashboardVariant,
          itemFilterConfig: {
            resultType: "cards",
            filtersTitle: "",
            style: "--padding: 72px",
            filterProperties: [],
            resultsTitle: "Explore more indicators",
            subTitleProperty: "subtitle",
            imageProperty: "thumbnail",
          },
        },
      },
    },
    {
      defineWidget: (selectedSTAC) => {
        return selectedSTAC
          ? {
              id: "layercontrol-light",
              type: "internal",
              title: "Layers",
              layout: { x: 0, y: 1, w: 3, h: 3 },
              widget: {
                name: "EodashLayerControl",
                properties: {
                  slider: false,
                  tools: ["datetime", "info", "legend"],
                  cssVars: {
                    "--list-padding": "0",
                    "--tools-button-visibility": "none",
                    "--layer-input-visibility": "none",
                    "--layer-type-visibility": "none",
                    "--padding": "16px",
                    "--padding-vertical": "16px",
                    "--layer-tools-button-visibility": "none",
                    "--layer-summary-visibility": "none",
                  },
                },
              },
            }
          : null;
      },
    },
    {
      defineWidget: (selectedSTAC) => {
        return selectedSTAC
          ? {
              id: "stacinfo-light",
              type: "internal",
              title: "Information",
              layout: { x: 9, y: 0, w: 3, h: 6 },
              widget: {
                name: "EodashStacInfo",
                properties: {
                  tags: [],
                  header: [],
                  footer: [],
                  body: ["description"],
                  styleOverride: "",
                  featured: [],
                },
              },
            }
          : null;
      },
    },
    {
      defineWidget: (selectedSTAC) => {
        return selectedSTAC
          ? {
              id: "light-datepicker",
              type: "internal",
              layout: { x: 5, y: 8, w: 2, h: 4 },
              title: "Date",
              widget: {
                name: "EodashDatePicker",
                properties: {
                  hintText: `<b>Hint:</b> closest available date is displayed <br />
                            on map (see Analysis Layers)`,
                },
              },
            }
          : null;
      },
    },
  ],
};
