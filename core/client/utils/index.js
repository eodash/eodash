import log from "loglevel";
import axios from "@/plugins/axios";
import Axios from "axios";
import { collectionsPalette } from "./states";
import {
  extractCollectionUrls,
  generateLinksFromItems,
  revokeCollectionBlobUrls,
} from "@/eodashSTAC/helpers";
import { EodashCollection } from "@/eodashSTAC/EodashCollection";
import { toAbsolute } from "stac-js/src/http.js";
import { readParquetItems } from "@/eodashSTAC/parquet";
import WebFontLoader from "webfontloader";

/**
 * Fetches JSON data from a URL with descriptive error handling
 *
 * @param {string} url - The URL to fetch from
 * @param {string} [description="file"] - A description of the file being fetched (for error messages)
 * @returns {Promise<any>}
 */
export const fetchJson = async (url, description = "file") => {
  try {
    const response = await axios.get(url);
    let data = response.data;

    // Handle string responses (e.g., if Content-Type is not application/json)
    if (typeof data === "string") {
      const trimmedData = data.trim();
      if (trimmedData.startsWith("<!DOCTYPE html>")) {
        throw new Error(
          `Expected JSON but received an HTML document. The URL might be incorrect or pointing to a landing page.`,
        );
      }
      try {
        data = JSON.parse(trimmedData);
      } catch (e) {
        const parseMsg = e instanceof Error ? e.message : String(e);
        throw new Error(
          `Failed to parse ${description} as JSON. Please ensure the file is valid JSON. (Error: ${parseMsg})`,
        );
      }
    }

    if (data === null || typeof data !== "object") {
      throw new Error(
        `Expected a JSON object for ${description} but received ${typeof data}.`,
      );
    }

    return data;
  } catch (error) {
    let message = `Failed to load ${description} from ${url}.`;
    if (Axios.isAxiosError(error)) {
      if (error.response) {
        message += ` (Server responded with ${error.response.status}: ${error.response.statusText})`;
      } else if (error.request) {
        message += ` (No response received from server. Please check your connection or the URL.)`;
      } else {
        message += ` (Error: ${error.message})`;
      }
    } else {
      const errMsg = error instanceof Error ? error.message : String(error);
      message += ` (Error: ${errMsg})`;
    }
    throw new Error(message);
  }
};

/**
 * Loads font in the app using `webfontloader`
 *
 * @param {import("@/types").Eodash["brand"]["font"]} fontConfig
 * @param {boolean} isWebComponent
 * @returns {Promise<string[]>} - Font family name
 * @see {@link "https://github.com/typekit/webfontloader"}
 */
export const loadFont = async (fontConfig, isWebComponent) => {
  if (!fontConfig) {
    return [];
  }

  let headerFamily = "",
    bodyFamily = "",
    headerLink = "",
    bodyLink = "";
  if ("headers" in fontConfig) {
    headerFamily = fontConfig?.headers?.family;
    headerLink = fontConfig.headers.link ?? "";
    bodyFamily = fontConfig?.body?.family;
    bodyLink = fontConfig.body.link ?? "";
  } else {
    headerFamily = fontConfig.family;
    headerLink = fontConfig.link ?? "";
    bodyFamily = fontConfig?.family;
    bodyLink = fontConfig.link ?? "";
  }
  const families =
    headerFamily === bodyFamily ? [headerFamily] : [headerFamily, bodyFamily];
  const urls = [];
  if (bodyLink && headerLink) {
    if (bodyLink !== headerLink) {
      urls.push(bodyLink);
      urls.push(headerLink);
    } else {
      urls.push(bodyLink);
    }
  }

  WebFontLoader.load({
    classes: false,
    custom: {
      // Use FVD notation to include families https://github.com/typekit/fvd
      families,
      // Path to stylesheet that defines font-face
      urls,
    },
    fontactive(familyName, _fvd) {
      const stylesheet = new CSSStyleSheet();

      const bodyRule = `
         ${isWebComponent ? "eo-dash" : `:root`} {
          font-family: ${bodyFamily};
          --vc-font-family: ${bodyFamily};
          }
           eox-layercontrol,
           eox-map,
           eox-jsonform,
           eox-timecontrol,
           eox-itemfilter,
           eox-geosearch,
           eox-feedback,
           eox-chart,
           eox-stacinfo{
            --eox-body-font-family: ${bodyFamily};
             font-family: ${bodyFamily}
            ;
           }
            *[class*="text-body"]{
              font-family: ${bodyFamily}
            }
            `;

      const headersRule = `
           ${
             isWebComponent
               ? `
            eo-dash h1,
            eo-dash h2,
            eo-dash h3,
            eo-dash h4,
            eo-dash h5,
            eo-dash *[class*="header"]
            `
               : `
            h1,
            h2,
            h3,
            h4,
            h5,
            *[class*="header"]`
           } {
           font-family: ${headerFamily} !important;
         }
           eox-layercontrol,
           eox-map,
           eox-jsonform,
           eox-timecontrol,
           eox-itemfilter,
           eox-feedback,
           eox-geosearch,
           eox-chart,
           eox-stacinfo {
          --eox-header-font-family: ${headerFamily};
          `;
      const isOne = headerFamily && headerFamily === bodyFamily;
      const styles = isOne
        ? bodyRule + "\n" + headersRule
        : familyName == bodyFamily
          ? bodyRule
          : headersRule;
      stylesheet.replaceSync(styles);
      document?.adoptedStyleSheets?.push(stylesheet);
    },
    fontinactive(familyName, _fvd) {
      throw new Error(`error loading font: ${familyName}`);
    },
  });
  return families;
};

/**
 *  @param {string} text
 *  @param {import("vue").Ref<boolean>} showIcon
 **/
export const copyToClipBoard = async (text, showIcon) => {
  await navigator.clipboard.writeText(text);
  showIcon.value = true;
  setTimeout(() => {
    showIcon.value = false;
  }, 2000);
};

/**
 * Sets the color palette for STAC indicators
 * @param {string[]} colors
 **/
export const setCollectionsPalette = (colors) => {
  log.debug("Setting collections color palette", colors);
  collectionsPalette.splice(0, collectionsPalette.length);
  collectionsPalette.push(...colors);
};

/**
 * Updates the eodash collections by fetching and processing collection data from specified URLs
 * @param {import("stac-ts").StacCollection} selectedStac - The indicator object
 * @param {string} absoluteUrl - The absolute indicator URL
 * @param {import('@/eodashSTAC/EodashCollection').EodashCollection[]} eodashCollections  - The array of existing eodash collections to be updated
 * @param {string[]} colorPalette - The color palette to assign to each collection
 * @param {boolean} isAPI - Flag indicating if the collection is fetched from an API
 * @param {string | null} rasterEndpoint - Optional raster endpoint URL
 * @async
 * @description This function extracts collection URLs from the indicator, fetches collection data,
 * processes parquet items if available, and updates the eodashCollections array with new collection data.
 * Each collection is assigned a color from a predefined palette.
 */
export const updateEodashCollections = async (
  eodashCollections,
  selectedStac,
  absoluteUrl,
  colorPalette,
  isAPI,
  rasterEndpoint = null,
) => {
  // init eodash collections
  const collectionUrls = extractCollectionUrls(selectedStac, absoluteUrl);

  try {
    const collections = await Promise.all(
      collectionUrls.map(async (cu, idx) => {
        const ec = new EodashCollection(cu, isAPI, rasterEndpoint);
        const col = await ec.fetchCollection();
        // assign color from the palette
        ec.color = colorPalette[idx % colorPalette.length];
        const parquetAsset = Object.values(col.assets ?? {}).find(
          (asset) =>
            asset.type === "application/vnd.apache.parquet" &&
            asset.roles?.includes("collection-mirror"),
        );

        if (!parquetAsset) {
          return ec;
        }

        const items = await readParquetItems(toAbsolute(parquetAsset.href, cu));
        col.links.push(...generateLinksFromItems(items));
        return ec;
      }),
    );
    // revoke old blob urls in the previous collections. see generateLinksFromItems in "../eodashSTAC/helpers.js"
    eodashCollections.forEach((ec) => {
      revokeCollectionBlobUrls(ec);
    });
    // empty array from old collections
    eodashCollections.splice(0, eodashCollections.length);
    // update eodashCollections
    eodashCollections.push(...collections);
  } catch (error) {
    console.error("Error updating eodash collections:", error);
  }
};
/**
 *
 * @param {Element | string} selector
 */
export const getElement = (selector) => {
  const eoDash = document.querySelector("eo-dash");
  if (!eoDash) {
    //@ts-expect-error selectior can be a string or an Element
    return document.querySelector(selector);
  }
  //@ts-expect-error selector can be a string or an Element
  return eoDash.shadowRoot?.querySelector(selector);
};

/**
 * Recursively searches parents for overlay HTML element (mobile tab root)
 *
 * @param { HTMLElement } el - HTML component, starting search from.
 * @returns { HTMLElement | null }
 */
export const getOverlayParent = (el) => {
  while (el) {
    if (el.id === "overlay" || el.classList.contains("panel")) {
      return el;
    }
    //@ts-expect-error selector can be null or an Element
    el = el.parentElement;
  }
  return null;
};
