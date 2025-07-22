import path from "path";
/**
 * @returns {import("vite").Plugin}
 */

/**
 * @param {Object} [options]
 * @param {string} [options.customElementFileName = 'asWebComponent.js'] the basename of the file containing defineCustomElement
 * @param {string} [options.stylePlaceHolder = '__VUE_CE_STYLES__'] the placeholder for styles in the custom element file, will be automatically injected
 * @returns {import("vite").Plugin}
 */
export function vueCustomElementStyleInjector(
  options = {
    customElementFileName: "asWebComponent.js",
    stylePlaceHolder: "__VUE_CE_STYLES__",
  },
) {
  const { customElementFileName, stylePlaceHolder } = options;
  return {
    name: "vite-plugin-vue-custom-element-style-injector",
    enforce: "post",
    async transform(code, id) {
      if (this.environment.mode !== "build") {
        return;
      }
      const fileBasename = path.basename(id);

      if (fileBasename === customElementFileName) {
        let modifiedCode = code;

        const hasStylesProperty =
          /defineCustomElement\s*\([^{]*\{[\s\S]*?styles\s*:/.test(code);

        if (!hasStylesProperty) {
          modifiedCode = code.replace(
            /(defineCustomElement\s*\(\s*[^,{]*,?\s*\{)/,
            `$1\n  styles: ${stylePlaceHolder},`,
          );
        }

        return {
          code: modifiedCode,
          map: null,
        };
      }
    },
    generateBundle(_options, bundle) {
      let entryPoint = "";
      let css = [];
      const cssFiles = [];
      for (const chunkName in bundle) {
        const chunk = bundle[chunkName];
        if (chunk.type === "chunk" && chunk.code.includes(stylePlaceHolder)) {
          entryPoint = chunkName;
          break;
        }
      }
      for (const chunkName in bundle) {
        const chunk = bundle[chunkName];
        if (isCSSRequest(chunkName) && chunk.type === "asset") {
          let cssSource = chunk.source.toString();
          // Retarget :root selectors to :host for shadow DOM
          cssSource = cssSource.replaceAll(":root", ":host");
          css.push(cssSource);
          cssFiles.push(chunkName);
        }
      }
      //@ts-expect-error the entryPoint file is a chunk type
      bundle[entryPoint].code = bundle[entryPoint].code.replace(
        stylePlaceHolder,
        JSON.stringify(css),
      );
      cssFiles.forEach((cssFile) => {
        // Remove the CSS file from the bundle
        delete bundle[cssFile];
      });
    },
  };
}

/** @param {string} request */
function isCSSRequest(request) {
  const CSS_LANGS_RE =
    /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/;

  return CSS_LANGS_RE.test(request);
}
