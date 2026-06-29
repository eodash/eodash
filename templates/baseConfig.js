import { deepmergeCustom } from "deepmerge-ts";
import lite from "./lite";
import expert from "./expert";
import compare from "./compare";
import explore from "./explore";

/** @type {import("@/types").Eodash} */
const baseConfig = {
  id: "demo",
  options: {
    // useSubCode: true,
  },
  stacEndpoint: {
    endpoint:
      // "https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json",
      // "https://GTIF-Austria.github.io/public-catalog/pr-preview/pr-119/GTIF-Austria/catalog.json",
      "https://api.explorer.eopf.copernicus.eu/stac",
    api: true,
    supportedUpscalingEndpoints: [
      { url: "openveda.cloud", titilerVersion: 1 },
      { url: "api.explorer.eopf.copernicus.eu", titilerVersion: 2 },
    ],
    rasterEndpoint: "https://api.explorer.eopf.copernicus.eu/rstaging",
  },
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
    lite,
    expert,
    compare,
    explore,
  },
};

/**
 * Arrays are replacement semantics (user array wins, not concat).
 * mergeArrays:false ensures e.g. widgets/collectionsPalette/supportedUpscalingEndpoints
 * supplied by the caller fully replace the base arrays.
 */
const deepmerge = deepmergeCustom({ mergeArrays: false });

/**
 * @param {import("vega-lite").DeepPartial<import("@/types").Eodash>} config
 * @return {import("@/types").Eodash}
 */
export const getBaseConfig = (config) => {
  return /** @type {import("@/types").Eodash} */ (
    deepmerge(cloneConfig(baseConfig), config || {})
  );
};

/**
 * Shallow-safe deep clone that preserves functions and Symbols as references
 * (they are intentionally shared; template functions and Symbol IDs are
 * not mutable data). Only plain objects and arrays are cloned.
 *
 * @param {unknown} val
 * @returns {unknown}
 */
function cloneConfig(val) {
  if (val === null || typeof val !== "object") return val;
  if (Array.isArray(val)) return val.map(cloneConfig);
  if (typeof val === "function") return val;
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const key of Object.keys(val)) {
    out[key] = cloneConfig(/** @type {Record<string, unknown>} */ (val)[key]);
  }
  return out;
}

export default baseConfig;
