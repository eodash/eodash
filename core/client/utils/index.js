import log from "loglevel";
import { collectionsPalette } from "./states";
import { createEodashCollection } from "@eodash/stac";
import { extractCollectionUrls } from "@eodash/stac/helpers";
import { axios } from "@/plugins/axios";
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
 * Fetches indicator collections and populates the reactive reader array.
 *
 * @param {import("@eodash/stac").Reader[]} eodashCollections - Reactive array to receive the initialized collection readers
 * @param {import("@eodash/stac").STACCollection} selectedStac - Indicator collection metadata
 * @param {string} absoluteUrl - Indicator URL used as the base for relative collection links
 * @param {string[]} colorPalette - Color palette assigned cyclically across collections
 * @param {boolean} isAPI - Whether collections are backed by a STAC API endpoint
 * @param {object} [rasterOptions] - Default options applied when building layers
 * @param {string} [rasterOptions.rasterEndpoint]
 * @param {import("@eodash/stac").BuildContext["upscalingEndpoints"]} [rasterOptions.upscalingEndpoints]
 * @param {Record<string, any> | null} [rasterOptions.tileMatrixSets]
 * @param {import("@eodash/stac").BuildContext["renders"]} [rasterOptions.renders]
 * @param {string} [rasterOptions.viewProjection]
 */
export const updateEodashCollections = async (
  eodashCollections,
  selectedStac,
  absoluteUrl,
  colorPalette,
  isAPI,
  rasterOptions = {},
) => {
  // init eodash collections
  const collectionUrls = extractCollectionUrls(selectedStac, absoluteUrl);

  const collections = await Promise.all(
    collectionUrls.map((cu, idx) =>
      createEodashCollection(cu, {
        api: isAPI,
        client: axios,
        color: colorPalette[idx % colorPalette.length],
        ...rasterOptions,
      }),
    ),
  );

  eodashCollections.splice(0, eodashCollections.length, ...collections);
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
