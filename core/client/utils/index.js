/**
 * loads font in the app using `webfontloader`
 * @param {string} [family]
 * @param {string} [link]
 * @param {boolean} [isWebComponent]
 * @returns {Promise<string>} - font family name
 * @see {@link "https://github.com/typekit/webfontloader"}
 */
export const loadFont = async (family = '', link = '', isWebComponent = false) => {
  if (family && link) {
    const WebFontLoader = (await import('webfontloader')).default;
    WebFontLoader.load({
      classes: false,
      custom: {
        // Use FVD notation to include families https://github.com/typekit/fvd
        families: [family],
        // Path to stylesheet that defines font-face
        urls: [link],
      },
      fontactive(familyName, _fvd) {
        const stylesheet = new CSSStyleSheet()
        const styles = isWebComponent ? `eo-dash {font-family: ${familyName};}` : `* {font-family: ${familyName};}`
        stylesheet.replaceSync(styles)
        document.adoptedStyleSheets.push(stylesheet)
      },
      fontinactive(familyName, _fvd) {
        throw new Error(`error loading font: ${familyName}`)
      }
    });
  }
  return family;
};
