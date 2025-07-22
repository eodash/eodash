import path from "path";
/**
 * @returns {import("vite").Plugin}
 */

export function vueCustomElementStyleInjector(fileName = "asWebComponent.js", stylePlaceHolder = '__VUE_CE_STYLES__') {
  // const css = []
  return {
    name: 'vite-plugin-vue-custom-element-style-injector',
    enforce: 'post',
    async transform(code,id) {
      // const code = (await this.fs.readFile(id)).toString();

      if (this.environment.mode !== "build") {
        // This plugin is only active in production builds
        return;
      }
      // // console.log(`[eodash-dev] Transforming: ${id}`);

      // const transformCss = filterCSSRequest(id, { unincluded: ["inline&lang.css","inline&lang.scss"] });
      const fileBasename = path.basename(id);
      // if(transformCss) {

      //   // console.log(`[eodash-dev] Loading: ${id}`);
      //   let modifiedCssCode = code;
      //   modifiedCssCode = modifiedCssCode.replaceAll("export default","")
      //   modifiedCssCode = modifiedCssCode.replaceAll('"',"")
      //   css.push(modifiedCssCode);
      //   console.log(`[eodash-dev] added styles: ${id}`, modifiedCssCode.length);

      //   // Return empty export to remove CSS from bundle
      //   return {
      //    code: "",
      //    map: null,
      //   };
      // }


      if (fileBasename === fileName) {

        let modifiedCode = code;

    const hasStylesProperty = /defineCustomElement\s*\([^{]*\{[\s\S]*?styles\s*:/.test(code);

    if (!hasStylesProperty) {
      modifiedCode = code.replace(
        /(defineCustomElement\s*\(\s*[^,{]*,?\s*\{)/,
        `$1\n  styles: ${stylePlaceHolder},`
      );
    }
        console.log(`[eodash-dev] modify styles: ${modifiedCode.includes(stylePlaceHolder)}`);

        return {
          code: modifiedCode,
          map: null,
        };
      }
    },
    generateBundle(_options, bundle) {
      let entryPoint = ''
      let css = []
      const cssFiles = []
       for (const chunkName in bundle) {
        const chunk = bundle[chunkName];
        if (chunk.type === 'chunk' && chunk.code.includes(stylePlaceHolder)) {
          entryPoint = chunkName;
          break;
        }
      }
      for (const chunkName in bundle) {
        const chunk = bundle[chunkName];
        if(isCSSRequest(chunkName) && chunk.type === 'asset') {
          let cssSource = chunk.source.toString();
          // Retarget :root selectors to :host for shadow DOM
          cssSource = cssSource.replaceAll(":root", ":host");
          css.push(cssSource);
          cssFiles.push(chunkName);
        }
      }
      //@ts-expect-error the entryPoint file is a chunk type
      bundle[entryPoint].code = bundle[entryPoint].code.replace(stylePlaceHolder, JSON.stringify(css));
      cssFiles.forEach((cssFile) => {
        // Remove the CSS file from the bundle
        delete bundle[cssFile];
      });
    }
  }
}


/** @param {string} request */
function isCSSRequest(request) {
    const CSS_LANGS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/;

    return CSS_LANGS_RE.test(request);
}
/**
 * @param {string} request
 * @param {object} [opt]
 * @param {string[] | undefined} [opt.include]
 * @param {string[] | undefined} [opt.unincluded]
 * */
function filterCSSRequest(request, opt) {
  const { include, unincluded } = opt || {};
  if (!isCSSRequest(request)) {
    return false;
  }
  if (include && include.length && unincluded && unincluded.length) {
    return include.some(pattern => request.includes(pattern)) &&
      unincluded.every(pattern => !request.includes(pattern));

  }
  if (include && include.length) {
    return include.some(pattern => request.includes(pattern));
  }
  if (unincluded && unincluded.length) {
    return unincluded.every(pattern => !request.includes(pattern));

  }
  return true;
}
