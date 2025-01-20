import log from "loglevel";
import { collectionsPalette } from "./states";
/**
 * Loads font in the app using `webfontloader`
 *
 * @param {string} [family]
 * @param {string} [link]
 * @param {boolean} [isWebComponent]
 * @returns {Promise<string>} - Font family name
 * @see {@link "https://github.com/typekit/webfontloader"}
 */
export const loadFont = async (
  family = "",
  link = "",
  isWebComponent = false,
) => {
  if (family && link) {
    const WebFontLoader = (await import("webfontloader")).default;
    WebFontLoader.load({
      classes: false,
      custom: {
        // Use FVD notation to include families https://github.com/typekit/fvd
        families: [family],
        // Path to stylesheet that defines font-face
        urls: [link],
      },
      fontactive(familyName, _fvd) {
        const stylesheet = new CSSStyleSheet();
        const styles = isWebComponent
          ? `eo-dash {font-family: ${familyName};}`
          : `* {font-family: ${familyName};}`;
        stylesheet.replaceSync(styles);
        document.adoptedStyleSheets.push(stylesheet);
      },
      fontinactive(familyName, _fvd) {
        throw new Error(`error loading font: ${familyName}`);
      },
    });
  }
  return family;
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
