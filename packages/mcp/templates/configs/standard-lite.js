// @id dashboard-config-standard-lite
// @title Standard Lite Dashboard Configuration
// @features config, lite-template, branding, stac
// @tags config, lite, branding, stac, eodash.config.js
// @description Standard eodash dashboard configuration module using the 'lite' template, full branding palette, and STAC endpoint.
import { createEodash } from "@eodash/eodash";
import { lite } from "@eodash/eodash/templates";

/** @type {import("@eodash/eodash").Eodash} */
export default createEodash({
  id: "demo-dashboard",
  stacEndpoint:
    "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json",
  brand: {
    name: "EO Dashboard",
    theme: {
      colors: {
        primary: "#002742",
        secondary: "#0071C2",
        surface: "#ffffff",
      },
      variables: {
        "surface-opacity": 0.8,
        "primary-opacity": 0.8,
      },
      collectionsPalette: [
        "#009E73",
        "#E69F00",
        "#56B4E9",
        "#F0E442",
        "#0072B2",
        "#D55E00",
        "#CC79A7",
        "#994F00",
      ],
    },
    footerText: "EO Dashboard - Powered by eodash",
  },
  template: lite,
});
