import { indicator } from '@/store/States';

/**
 * loads font in the app using `webfontloader`
 * @param {string} [family="Roboto"]
 * @param {string} [link]
 * @returns {Promise<string>} - font family name
 * @see {@link "https://github.com/typekit/webfontloader "}
 */
export const loadFont = async (family = "Roboto", link) => {
  const WebFontLoader = (await import('webfontloader')).default;
  if (link) {
    WebFontLoader.load({
      custom: {
        // Use FVD notation to include families https://github.com/typekit/fvd
        families: [family],
        // Path to stylesheet that defines font-face
        urls: [link],
      },
    });
  }
  else {
    WebFontLoader.load({
      google: {
        families: [family]
      }
    });
  }
  return family;
};


/**
 * @param {import('stac-ts').StacCatalog | import('stac-ts').StacCollection | import('stac-ts').StacItem | null} selectedSTAC
 * @see {@link indicator}
 */
export const assignIndicator = (selectedSTAC) => {
  const code = /** @type {string | undefined} */ (selectedSTAC?.code);
  const subcode = /** @type {string | string[] | undefined} */ (selectedSTAC?.subcode);

  if (selectedSTAC?.code || selectedSTAC?.subcode) {
    indicator.value = code ? code :
      Array.isArray(subcode) ? subcode[0] : subcode ?? ""
  } else {
    indicator.value = ""
  }
}
