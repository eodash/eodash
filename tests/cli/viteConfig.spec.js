import { beforeEach, describe, expect, it, vi } from "vitest";
import path from "path";
import {
  build,
  cp,
  createServer,
  fsPromises,
  loadEnv,
  mergeConfig,
  pluginVue,
  pluginVuetify,
  preview,
  resetViteMocks,
  rm,
  vite,
  vuePlugin,
  writeFile,
} from "./support/mocks/vite.js";
import {
  buildApp,
  createDevServer,
  previewApp,
} from "../../core/node/cli/app.js";
import {
  appPath,
  getUserConfig,
  resolveEodashContext,
} from "../../core/node/cli/globals.js";
import { HOST_ROOT, makeCtx } from "./support/context.js";

vi.mock("vite", () => vite);
vi.mock("@vitejs/plugin-vue", () => pluginVue);
vi.mock("vite-plugin-vuetify", () => pluginVuetify);
vi.mock("fs/promises", () => fsPromises);

const SPA = makeCtx();
const LIB = makeCtx({ userConfig: { lib: true } });
const OUT_DIR = path.join(HOST_ROOT, ".eodash/dist");

/** @typedef {import("../../core/node/cli/globals.js").EodashContext} EodashContext */

/**
 * The config the CLI actually hands vite, taken from the real command.
 *
 * @param {EodashContext} ctx
 */
const devConfig = async (ctx) => {
  await createDevServer(ctx);
  //@ts-expect-error todo
  return createServer.mock.calls[0][0];
};

/**
 * @template {EodashContext} Context
 * @param {Context} ctx
 * @returns {Promise<import("vite").ResolvedConfig>}
 **/
const buildConfig = async (ctx) => {
  await buildApp(ctx);
  //@ts-expect-error todo
  return build.mock.calls[0][0];
};

describe("eodash vite config", () => {
  beforeEach(resetViteMocks);

  it("resolves user defined configuration and passes it to the vite config", async () => {
    // The chain is flags -> getUserConfig -> context -> vite.
    const userConfig = await getUserConfig(
      {
        base: "/base",
        outDir: "out",
        cacheDir: "cache",
        publicDir: "static",
        widgets: "widgets",
        entryPoint: "entry.js",
        port: "3000",
        open: true,
        host: "0.0.0.0",
      },
      "dev",
      HOST_ROOT,
    );

    const config = await devConfig(resolveEodashContext(userConfig, HOST_ROOT));

    expect(config).toMatchObject({
      base: "/base",
      cacheDir: path.join(HOST_ROOT, "cache"),
      publicDir: path.join(HOST_ROOT, "static"),
      resolve: {
        alias: {
          "user:widgets": path.join(HOST_ROOT, "widgets"),
          "user:config": path.join(HOST_ROOT, "entry.js"),
        },
      },
      server: { port: 3000, open: true, host: "0.0.0.0" },
      build: { outDir: path.join(HOST_ROOT, "out") },
    });
  });

  it("stops serving static assets when publicDir is disabled", async () => {
    const ctx = makeCtx({
      userConfig: { publicDir: false },
    });
    //@ts-expect-error todo
    expect((await devConfig(ctx)).publicDir).toBe(false);
  });

  it("merges the host's vite overrides over eodash's own config", async () => {
    const overrides = { server: { port: 9999 } };
    mergeConfig.mockReturnValue({ merged: true });
    const ctx = makeCtx({
      userConfig: { vite: overrides },
    });

    const config = await devConfig(ctx);

    // eodash's config first, so the host's values win.
    expect(mergeConfig).toHaveBeenCalledWith(
      expect.objectContaining({ root: appPath }),
      overrides,
    );
    expect(config).toEqual({ merged: true });
  });

  it("reads .env from the host application, not from eodash", async () => {
    loadEnv.mockReturnValue({ EODASH_TOKEN: "t" });

    const config = await devConfig(SPA);

    expect(loadEnv).toHaveBeenCalledWith("development", HOST_ROOT, [
      "VITE_",
      "EODASH_",
    ]);
    //@ts-expect-error todo
    expect(config.define["process.env.EODASH_TOKEN"]).toBe('"t"');
  });

  it("keeps user:config resolvable when the host has no entry point", async () => {
    const ctx = makeCtx({
      entryPath: false,
      userConfig: { lib: true },
    });

    const config = await buildConfig(ctx);

    // Aliasing to `false` would fail to resolve. Treeshaking drops the import,
    // but it has to survive as an external until then.
    expect(config.resolve.alias).not.toHaveProperty("user:config");
    expect(config.define?.__userConfigExist__).toBe(false);
    //@ts-expect-error todo
    expect(config.build.rolldownOptions?.external?.("user:config")).toBe(true);
  });

  describe("preview", () => {
    it("serves the build output with the configured server options", async () => {
      const ctx = makeCtx({
        userConfig: {
          base: "/base",
          port: 8000,
          open: true,
          host: "0.0.0.0",
        },
      });

      await previewApp(ctx);

      expect(preview).toHaveBeenCalledWith({
        root: HOST_ROOT,
        base: "/base",
        preview: { port: 8000, open: true, host: "0.0.0.0" },
        build: { outDir: OUT_DIR },
      });
    });

    it("falls back to port 8080 when none is configured", async () => {
      // Unlike the dev server, preview guards the NaN that getUserConfig
      // produces for an unset port.
      await previewApp(makeCtx());
      //@ts-expect-error todo
      expect(preview.mock.calls[0][0].preview.port).toBe(8080);
    });
  });

  describe("runtime config", () => {
    it("is copied into the build output so the deployed app can load it", async () => {
      // Any real path will do here; existsSync is not mocked.
      const ctx = makeCtx({ runtimeConfigPath: import.meta.filename });

      await buildApp(ctx);

      expect(cp).toHaveBeenCalledWith(
        import.meta.filename,
        path.join(OUT_DIR, "config.js"),
        { recursive: true },
      );
    });

    it("is skipped when the host does not have one", async () => {
      await buildApp(SPA);

      expect(cp).not.toHaveBeenCalled();
    });
  });

  describe("spa build", () => {
    const htmlPath = path.join(appPath, "index.html");

    it("builds the html and templates entries into the host outDir", async () => {
      const { build: spa } = await buildConfig(SPA);

      expect(spa.outDir).toBe(OUT_DIR);
      expect(spa.rolldownOptions.input).toEqual({
        main: htmlPath,
        templates: path.join(appPath, "templates/index.js"),
      });
    });

    it("writes the index.html its build input points at, then removes it", async () => {
      await buildApp(SPA);

      expect(writeFile).toHaveBeenCalledWith(
        htmlPath,
        expect.stringContaining('id="app"'),
      );
      expect(rm).toHaveBeenCalledWith(htmlPath);
    });

    it("removes that index.html even when the build fails", async () => {
      // It lives in eodash's own package, which for a consumer is node_modules.
      build.mockRejectedValue(new Error("boom"));

      await expect(buildApp(SPA)).rejects.toThrow("boom");
      expect(rm).toHaveBeenCalledWith(htmlPath);
    });

    it("stays out of custom-element mode", async () => {
      // Compiling an spa as custom elements moves styles into shadow roots
      // that nothing renders.
      await buildConfig(SPA);
      //@ts-expect-error todo
      expect(vuePlugin.mock.calls[0][0].features?.customElement).toBeFalsy();
    });
  });

  describe("library build", () => {
    it("needs no temporary index.html", async () => {
      await buildApp(LIB);

      expect(writeFile).not.toHaveBeenCalled();
    });

    it("compiles vue as a custom element and inlines its styles", async () => {
      // Without either half the published web component renders unstyled.
      const config = await buildConfig(LIB);
      //@ts-expect-error todo
      expect(vuePlugin.mock.calls[0][0].features.customElement).toBe(true);
      expect(config.plugins).toContainEqual(
        expect.objectContaining({
          name: "vite-plugin-vue-custom-element-style-injector",
        }),
      );
    });

    it("emits eo-dash.js from the web component entry", async () => {
      const { build: lib } = await buildConfig(LIB);

      expect(lib.outDir).toBe(OUT_DIR);
      //@ts-expect-error todo
      expect(lib.lib.entry).toBe(
        path.join(appPath, "core/client/asWebComponent.js"),
      );
      //@ts-expect-error todo
      expect(lib.lib.fileName("es", "asWebComponent")).toBe("eo-dash.js");
      //@ts-expect-error todo
      expect(lib.lib.fileName("es", "templates")).toBe("templates.js");
    });

    it("rewrites process.env so client reads survive bundling", async () => {
      expect((await buildConfig(LIB)).define?.["process.env"]).toBe(
        "import.meta.env",
      );
    });

    describe("externals", () => {
      /** @type {(source: string) => boolean} */
      let external;

      beforeEach(async () => {
        //@ts-expect-error todo
        external = (await buildConfig(LIB)).build.rolldownOptions.external;
      });

      it("externalises client dependencies", () => {
        expect(external("vue")).toBe(true);
        expect(external("@eox/map")).toBe(true);
      });

      it("bundles vuetify, stylesheets and relative sources", () => {
        expect(external("vuetify/lib/components")).toBe(false);
        expect(external("vuetify/styles")).toBe(false);
        expect(external("@eox/ui/style.css")).toBe(false);
        expect(external("./eodash.js")).toBe(false);
      });

      it("bundles transitive deps that merely share a name prefix", () => {
        expect(external("vue-demi")).toBe(false);
        expect(external("vue/dist/vue.esm-bundler.js")).toBe(true);
      });
    });
  });
});
