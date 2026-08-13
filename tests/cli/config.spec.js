import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { pluginVue, pluginVuetify, vite } from "./support/mocks/vite.js";
import {
  getUserConfig,
  resolveEodashContext,
} from "../../core/node/cli/globals.js";

vi.mock("vite", () => vite);
vi.mock("@vitejs/plugin-vue", () => pluginVue);
vi.mock("vite-plugin-vuetify", () => pluginVuetify);

const HOST = "/host/app";

let tmp = "";

beforeAll(async () => {
  tmp = await mkdtemp(path.join(tmpdir(), "eodash-config-"));
});

afterAll(() => rm(tmp, { recursive: true, force: true }));

/**
 * Each config lands in its own directory: `import()` caches by url, so reusing
 * one path would hand every test the first test's module.
 *
 * @param {string} name
 * @param {string} source
 */
const hostWithConfig = async (name, source) => {
  const root = path.join(tmp, name);
  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, "eodash.config.js"), source);
  return root;
};

/** @typedef {import("../../core/node/cli/globals.js").ResolvedUserConfig} ResolvedUserConfig */

/** @param {Partial<ResolvedUserConfig>} config */
const contextFor = (config) =>
  resolveEodashContext(/** @type {ResolvedUserConfig} */ (config), HOST);

describe("getUserConfig", () => {
  it("reads eodash.config.js and lets cli flags override it", async () => {
    const root = await hostWithConfig(
      "flags",
      `export default { outDir: "from-config", base: "/from-config" }`,
    );

    const config = await getUserConfig({ outDir: "from-flag" }, "dev", root);

    expect(config.outDir).toBe("from-flag");
    expect(config.base).toBe("/from-config");
  });

  it("calls the default export when it is a function", async () => {
    const root = await hostWithConfig(
      "factory",
      `export default () => ({ base: "/from-factory" })`,
    );

    expect((await getUserConfig({}, "dev", root)).base).toBe("/from-factory");
  });

  it("takes the server options from the section matching the command", async () => {
    const root = await hostWithConfig(
      "sections",
      `export default { dev: { port: 4000 }, preview: { port: 5000 } }`,
    );

    expect((await getUserConfig({}, "dev", root)).port).toBe(4000);
    expect((await getUserConfig({}, "preview", root)).port).toBe(5000);
  });

  it("falls back to flags alone when the host has no config file", async () => {
    const root = path.join(tmp, "no-config");
    await mkdir(root, { recursive: true });

    expect((await getUserConfig({ base: "/flag" }, "dev", root)).base).toBe(
      "/flag",
    );
  });

  it("fails loudly when the config file throws", async () => {
    const root = await hostWithConfig("broken", `throw new Error("boom")`);

    await expect(getUserConfig({}, "dev", root)).rejects.toThrow("boom");
  });
});

describe("resolveEodashContext", () => {
  it("derives every path from the host application root", () => {
    expect(contextFor({})).toMatchObject({
      entryPath: path.join(HOST, "src/main.js"),
      publicPath: path.join(HOST, "public"),
      runtimeConfigPath: path.join(HOST, "src/runtime.js"),
      internalWidgetsPath: path.join(HOST, "src/widgets"),
      buildTargetPath: path.join(HOST, ".eodash/dist"),
      cachePath: path.join(HOST, ".eodash/cache"),
    });
  });

  it("resolves relative overrides against the host root, not the cwd", () => {
    const ctx = contextFor({
      outDir: "build",
      widgets: "components",
      runtime: "config/runtime.js",
    });

    expect(ctx.buildTargetPath).toBe(path.join(HOST, "build"));
    expect(ctx.internalWidgetsPath).toBe(path.join(HOST, "components"));
    expect(ctx.runtimeConfigPath).toBe(path.join(HOST, "config/runtime.js"));
  });

  it.each([
    // the string form is what arrives from `--entryPoint false`
    { label: "a boolean", entryPoint: false },
    { label: "the string from the cli flag", entryPoint: "false" },
  ])(
    "runs without a user entry point when disabled by $label",
    ({ entryPoint }) => {
      expect(contextFor({ entryPoint }).entryPath).toBe(false);
    },
  );
});
