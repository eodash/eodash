import { describe, it, expect } from "vitest";
import { vueCustomElementStyleInjector } from "../../core/node/cli/vitePlugins.js";

const PLACEHOLDER = "__VUE_CE_STYLES__";

/**
 * `transform` reads `this.environment.mode`, so it needs a plugin context.
 *
 * @param {"build" | "dev"} mode
 */
const transformIn = (mode) => {
  const plugin = vueCustomElementStyleInjector();
  const transform = /** @type {Function} */ (plugin.transform);

  /**
   * @param {string} code
   * @param {string} id
   */
  return (code, id) => transform.call({ environment: { mode } }, code, id);
};

/** @param {Record<string, any>} bundle */
const runGenerateBundle = (bundle) => {
  const plugin = vueCustomElementStyleInjector();
  const generateBundle = /** @type {Function} */ (plugin.generateBundle);
  generateBundle.call({}, {}, bundle);
};

describe("vueCustomElementStyleInjector", () => {
  describe("transform", () => {
    const build = transformIn("build");

    it("injects the styles placeholder into defineCustomElement", async () => {
      const result = await build(
        `defineCustomElement(App, { shadowRoot: true })`,
        "/src/asWebComponent.js",
      );
      expect(result.code).toBe(
        `defineCustomElement(App, {\n  styles: ${PLACEHOLDER}, shadowRoot: true })`,
      );
    });

    it("leaves an existing styles property alone", async () => {
      const code = `defineCustomElement(App, { styles: ["a{}"] })`;
      const result = await build(code, "/src/asWebComponent.js");
      expect(result.code).toBe(code);
    });

    it("ignores files other than the custom element entry", async () => {
      const result = await build(
        `defineCustomElement(App, {})`,
        "/src/main.js",
      );
      expect(result).toBeUndefined();
    });

    it("does nothing outside a build", async () => {
      const result = await transformIn("dev")(
        `defineCustomElement(App, {})`,
        "/src/asWebComponent.js",
      );
      expect(result).toBeUndefined();
    });
  });

  describe("generateBundle", () => {
    /**
     * @param {Record<string, any>} [extra]
     * @returns {Record<string, any>}
     */
    const bundleWith = (extra = {}) => ({
      "eo-dash.js": {
        type: "chunk",
        code: `defineCustomElement(App, { styles: ${PLACEHOLDER}, })`,
      },
      ...extra,
    });

    /** @param {string} source */
    const cssAsset = (source) => ({ type: "asset", source });

    it("replaces the placeholder with the collected stylesheets", () => {
      const bundle = bundleWith({ "eo-dash.css": cssAsset(".a{color:red}") });
      runGenerateBundle(bundle);

      expect(bundle["eo-dash.js"].code).not.toContain(PLACEHOLDER);
      expect(bundle["eo-dash.js"].code).toContain(
        JSON.stringify([".a{color:red}"]),
      );
    });

    it("retargets :root to :host so variables apply in the shadow root", () => {
      const bundle = bundleWith({
        "eo-dash.css": cssAsset(":root{--a:1}:root{--b:2}"),
      });
      runGenerateBundle(bundle);

      expect(bundle["eo-dash.js"].code).toContain(":host{--a:1}:host{--b:2}");
      expect(bundle["eo-dash.js"].code).not.toContain(":root");
    });

    it("removes stylesheets from the bundle once inlined, and nothing else", () => {
      const bundle = bundleWith({
        "eo-dash.css": cssAsset(".a{}"),
        "extra.css": cssAsset(".b{}"),
        "font.woff2": { type: "asset", source: "binary" },
      });
      runGenerateBundle(bundle);

      expect(bundle["eo-dash.css"]).toBeUndefined();
      expect(bundle["extra.css"]).toBeUndefined();
      expect(bundle["font.woff2"]).toBeDefined();
      expect(bundle["eo-dash.js"]).toBeDefined();
    });

    it("collects every stylesheet, not just the first", () => {
      const bundle = bundleWith({
        "a.css": cssAsset(".a{}"),
        "b.css": cssAsset(".b{}"),
      });
      runGenerateBundle(bundle);

      expect(bundle["eo-dash.js"].code).toContain(
        JSON.stringify([".a{}", ".b{}"]),
      );
    });

    it("leaves the bundle untouched when no chunk holds the placeholder", () => {
      const code = `defineCustomElement(App, { styles: ["a{}"] })`;
      const bundle = {
        "eo-dash.js": { type: "chunk", code },
        "eo-dash.css": cssAsset(".a{}"),
      };

      expect(() => runGenerateBundle(bundle)).not.toThrow();
      expect(bundle["eo-dash.js"].code).toBe(code);
      expect(bundle["eo-dash.css"]).toBeDefined();
    });
  });
});
