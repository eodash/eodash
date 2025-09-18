import { createVuetify } from "vuetify";
import { createTestingPinia } from "@pinia/testing";
/**
 * @param {import("vue").App} app
 * @param {import("./cypress-types").VueMountOptions} options
 */
export const registerPlugins = async (app, options) => {
  options.vuetify = options.vuetify ?? {};
  const vuetify = createVuetify(options.vuetify);
  app.use(vuetify);

  options.pinia =
    options.pinia ??
    createTestingPinia({
      createSpy: cy.stub().returns({
        selectedStac: { value: null },
        selectedCompareStac: { value: null },
        stac: { value: null },
      }),
    });
  app.use(options.pinia);
};

/** @type {import("../../../core/client/types").Eodash} */
export const mockEodash = {
  id: "mocked",
  stacEndpoint:
    "https://eodashcatalog.eox.at/test-style/trilateral/catalog.json",
  brand: {
    name: "Mock Dashboard",
    theme: {
      colors: {
        primary: "#fff",
        secondary: "#fff",
        surface: "#fff",
      },
    },
    footerText: "Mock",
  },
  template: {
    loading: {
      id: Symbol(),
      type: "web-component",
      widget: {
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
      id: Symbol(),
      type: "internal",
      widget: {
        name: "EodashMap",
      },
    },
    widgets: [
      {
        id: Symbol(),
        type: "internal",
        title: "Indicators",
        layout: { x: 0, y: 0, w: 3, h: 6 },
        widget: {
          name: "EodashItemFilter",
          properties: {
            aggregateResults: "collection_group",
          },
        },
      },
      {
        id: Symbol(),
        type: "internal",
        title: "Layer Control",
        layout: { x: 0, y: 6, w: 3, h: 6 },
        widget: {
          name: "EodashLayerControl",
        },
      },
      {
        id: "Information",
        title: "Information",
        layout: { x: 9, y: 0, w: 3, h: 6 },
        type: "web-component",
        widget: {
          link: async () => await import("@eox/stacinfo"),
          properties: {
            for: "https://eodashcatalog.eox.at/test-style/trilateral/catalog.json",
            allowHtml: "true",
          },
          tagName: "eox-stacinfo",
        },
      },
      {
        id: "Datepicker",
        type: "internal",
        layout: { x: 5, y: 10, w: 1, h: 1 },
        title: "Datepicker",
        widget: {
          name: "EodashDatePicker",
        },
      },
    ],
  },
};
