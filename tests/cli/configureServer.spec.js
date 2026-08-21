import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import {
  createServer,
  pluginVue,
  pluginVuetify,
  resetViteMocks,
  vite,
} from "./support/mocks/vite.js";
import { createDevServer } from "../../core/node/cli/app.js";
import { makeCtx } from "./support/context.js";

vi.mock("vite", () => vite);
vi.mock("@vitejs/plugin-vue", () => pluginVue);
vi.mock("vite-plugin-vuetify", () => pluginVuetify);

const RUNTIME_CONFIG = "export default { id: 'runtime' }";
const TRANSFORMED = "<!--transformed-->";

let tmp = "";
let runtimeConfigPath = "";

beforeAll(async () => {
  tmp = await mkdtemp(path.join(tmpdir(), "eodash-cli-"));
  runtimeConfigPath = path.join(tmp, "runtime.js");
  await writeFile(runtimeConfigPath, RUNTIME_CONFIG);
});

afterAll(() => rm(tmp, { recursive: true, force: true }));

/** @param {{ name?: string } | false} plugin */
const isInjectHtml = (plugin) => plugin && plugin.name === "inject-html";

/**
 * Marks the page so a test can tell a transformed one from a raw one. In dev
 * this is the call that injects the hmr client.
 *
 * @param {string} _url
 * @param {string} html
 */
const transformIndexHtml = async (_url, html) => html + TRANSFORMED;

/**
 * Runs the dev command, then drives the inject-html hook the way vite does:
 * the hook returns a post-hook, and only that registers the middleware.
 *
 * @param {Partial<import("../../core/node/cli/globals.js").EodashContext>} [overrides]
 */
const middlewareFor = async (overrides = {}) => {
  await createDevServer(makeCtx({ runtimeConfigPath, ...overrides }));

  const { configureServer } =
    createServer.mock.calls[0][0].plugins.find(isInjectHtml);
  const server = {
    watcher: { add: vi.fn(), on: vi.fn() },
    ws: { send: vi.fn() },
    middlewares: { use: vi.fn() },
    transformIndexHtml: vi.fn(transformIndexHtml),
  };
  await (
    await configureServer(server)
  )();

  return server.middlewares.use.mock.calls[0][0];
};

/** @param {Function} middleware @param {string} url */
const request = async (middleware, url) => {
  const res = {
    statusCode: 0,
    setHeader: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
  };
  const next = vi.fn();
  await middleware({ url, originalUrl: url }, res, next);
  return { res, next };
};

describe("dev server middleware", () => {
  beforeEach(resetViteMocks);

  it("serves the host's runtime config", async () => {
    const { res } = await request(await middlewareFor(), "/config.js");

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "text/javascript",
    );
    expect(res.write.mock.calls[0][0].toString()).toBe(RUNTIME_CONFIG);
  });

  it("answers with an empty body when the host has no runtime config", async () => {
    // Most host apps ship none, so this must not throw or fall through.
    const middleware = await middlewareFor({
      runtimeConfigPath: path.join(tmp, "absent.js"),
    });

    const { res } = await request(middleware, "/config.js");

    expect(res.write).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalledWith();
  });

  // There is no index.html on disk in dev; it is generated per request.
  it("generates the spa page for html requests", async () => {
    const { res } = await request(await middlewareFor(), "/index.html");

    expect(res.end.mock.calls[0][0]).toContain('id="app"');
    expect(res.end.mock.calls[0][0]).toContain(TRANSFORMED);
  });

  it("generates the web component page when building a library", async () => {
    const middleware = await middlewareFor({ userConfig: { lib: true } });

    const { res } = await request(middleware, "/index.html");

    expect(res.end.mock.calls[0][0]).toContain("<eo-dash");
    expect(res.end.mock.calls[0][0]).toContain(TRANSFORMED);
  });

  it("passes every other request through to vite", async () => {
    const { res, next } = await request(await middlewareFor(), "/src/main.js");

    expect(next).toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });
});
