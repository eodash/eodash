import { deepmergeInto } from "deepmerge-ts";
import light from "./light";
import expert from "./expert";
import compare from "./compare";

/** @type {import("@/types").Eodash} */
const baseConfig = {
  id: "demo",
  options: {
    // useSubCode: true,
  },
  stacEndpoint:
    "https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json",
  brand: {
    noLayout: true,
    name: "Demo",
    font: {
      headers: {
        family: "Open Sans",
        link: "https://eox.at/fonts/opensans/opensans.css",
      },
      body: {
        family: "Sintony",
        link: "https://eox.at/fonts/sintony/sintony.css",
      },
    },
    theme: {
      colors: {
        primary: "#002742",
        secondary: "#0071C2",
        surface: "#ffff",
      },
      variables: {
        "surface-opacity": 0.8,
        "primary-opacity": 0.8,
      },
      // Bank-Wong palette
      collectionsPalette: [
        "#009E73",
        "#E69F00",
        "#56B4E9",
        "#009E73",
        "#F0E442",
        "#0072B2",
        "#D55E00",
        "#CC79A7",
        "#994F00",
      ],
    },
    footerText: "Demo configuration of eodash client",
  },
  templates: {
    light,
    expert,
    compare,
  },
};

/**
 * @param {Partial<import("@/types").Eodash>} config
 */
export const getBaseConfig = (config) => {
  const merged = /** @type {import("@/types").Eodash} */ ({});
  deepmergeInto(merged, baseConfig, config || {});
  return merged;
};

export default baseConfig;
