import log from "loglevel";
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

  await Promise.all(
    collectionUrls.map((cu, idx) => {
      return new Promise((resolve, _reject) => {
        const ec = new EodashCollection(cu, isAPI, rasterEndpoint);
        ec.fetchCollection().then((col) => {
          // assign color from the palette
          ec.color = colorPalette[idx % colorPalette.length];
          const parquetAsset = Object.values(col.assets ?? {}).find(
            (asset) =>
              asset.type === "application/vnd.apache.parquet" &&
              asset.roles?.includes("collection-mirror"),
          );

          if (!parquetAsset) {
            resolve(ec);
            return;
          }

          readParquetItems(toAbsolute(parquetAsset.href, cu)).then((items) => {
            col.links.push(...generateLinksFromItems(items));
            resolve(ec);
          });
        });
      });
    }),
  ).then(async (collections) => {
    // revoke old blob urls in the previous collections. see generateLinksFromItems in "../eodashSTAC/helpers.js"
    eodashCollections.forEach((ec) => {
      revokeCollectionBlobUrls(ec);
    });
    // empty array from old collections
    eodashCollections.splice(0, eodashCollections.length);
    // update eodashCollections
    eodashCollections.push(...collections);
  });
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
  //@ts-expect-error selectior can be a string or an Element
  return eoDash.shadowRoot?.querySelector(selector);
};
