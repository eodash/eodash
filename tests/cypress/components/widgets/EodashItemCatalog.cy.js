import EodashItemCatalog from "^/EodashItemCatalog.vue";
import { createTestingPinia } from "@pinia/testing";

// Characterization tests for the declared-filters model: the author declares
// filters via props, and their options/bounds are populated from the selected
// collection's metadata (a declared filter the collection does not expose is
// hidden). eox-itemfilter renders filter sections into nested (open) shadow
// roots, so shadow piercing is enabled for the whole spec.

const STAC = "https://example.test/stac";
const COLLECTION_ID = "col-1";

const searchResponse = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "item-1",
      collection: COLLECTION_ID,
      properties: { datetime: "2026-01-01T00:00:00Z", platform: "Sentinel-2A" },
      geometry: null,
      assets: {},
    },
  ],
};

const interceptStac = () => {
  cy.intercept("GET", "**/collections/*/queryables*", {
    properties: { "eo:cloud_cover": { type: "number" } },
  }).as("queryables");
  cy.intercept("GET", "**/collections/*", {
    id: COLLECTION_ID,
    summaries: { platform: ["Sentinel-2A", "Sentinel-2B"] },
  }).as("collection");
  cy.intercept("GET", "**/search*", searchResponse).as("search");
};

/**
 * @param {Record<string, any>} props
 * @param {boolean} withActiveCollection seed a selected collection
 */
const mountCatalog = (props = {}, withActiveCollection = true) =>
  cy.vMount(EodashItemCatalog, {
    props: { stacEndpoint: STAC, bboxFilter: false, ...props },
    pinia: createTestingPinia({
      initialState: {
        stac: {
          stac: [{ id: COLLECTION_ID }],
          selectedStac: withActiveCollection ? { id: COLLECTION_ID } : null,
        },
      },
      createSpy: cy.stub,
    }),
  });

describe("<EodashItemCatalog />", () => {
  beforeEach(() => {
    Cypress.config("includeShadowDom", true);
    interceptStac();
  });

  it("populates a declared multiselect from the collection summaries", () => {
    mountCatalog({
      filters: [
        { property: "platform", type: "multiselect", title: "Platform" },
      ],
    });

    cy.get("eox-itemfilter", { timeout: 15000 }).should("exist");
    cy.contains("summary", "Collections").should("exist");
    cy.contains("summary", "Platform").should("exist");
  });

  it("populates a declared range whose property is a queryable", () => {
    mountCatalog({
      filters: [
        { property: "eo:cloud_cover", type: "range", title: "Cloud cover" },
      ],
    });

    cy.get("eox-itemfilter", { timeout: 15000 }).should("exist");
    cy.contains("summary", "Cloud cover").should("exist");
  });

  it("hides a declared filter the collection does not expose", () => {
    mountCatalog({
      filters: [
        {
          property: "sar:polarizations",
          type: "multiselect",
          title: "Polarizations",
        },
      ],
    });

    cy.get("eox-itemfilter", { timeout: 15000 }).should("exist");
    cy.contains("summary", "Collections").should("exist");
    cy.contains("summary", "Polarizations").should("not.exist");
  });

  it("renders only the base collection filter with no declared filters", () => {
    mountCatalog({});

    cy.get("eox-itemfilter", { timeout: 15000 }).should("exist");
    cy.contains("summary", "Collections").should("exist");
  });
});
