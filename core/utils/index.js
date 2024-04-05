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
 *  InternalRoute type guard
 * @param {import("@/types").InternalRoute | import("@/types").ExternalRoute| undefined} val
 * @returns {val is import("@/types").InternalRoute}
 */
export function isInternalRoute(val) {
  return val?.to.startsWith('/') ?? false
}
