import { vi } from "vitest";

/** Stand-in for `searchForWorkspaceRoot`, distinct from any ctx path. */
export const WORKSPACE_ROOT = "/workspace-root";

/**
 * Identity: the tests assert on the config object, not on vite's handling.
 *
 * @template T
 * @param {T} config
 * @returns {T}
 */
export const defineConfig = (config) => config;

export const loadEnv = vi.fn(() => /** @type {Record<string, string>} */ ({}));
export const mergeConfig = vi.fn();
export const searchForWorkspaceRoot = vi.fn(() => WORKSPACE_ROOT);
export const createLogger = vi.fn(() => ({
  info: vi.fn(),
  warn: vi.fn(),
  warnOnce: vi.fn(),
  error: vi.fn(),
  clearScreen: vi.fn(),
  hasErrorLogged: vi.fn(() => false),
  hasWarned: false,
}));
export const devServer = {
  listen: vi.fn(async () => {}),
  printUrls: vi.fn(),
  bindCLIShortcuts: vi.fn(),
};
export const previewServer = { printUrls: vi.fn() };

export const createServer = vi.fn(async () => devServer);
export const build = vi.fn(async () => {});
export const preview = vi.fn(async () => previewServer);

/**
 * A sentinel standing in for a real plugin, so the plugins array can be
 * matched by identity and the factory arguments inspected.
 *
 * @param {string} name
 * @returns {(options: Record<string, unknown>) => { name: string, options: Record<string, unknown> }}
 */
const pluginSentinel = (name) => (options) => ({ name, options });

export const vuePlugin = vi.fn(pluginSentinel("vue"));
export const vuetifyPlugin = vi.fn(pluginSentinel("vuetify"));

/** viteConfig.js imports this by name; without it the module fails to load. */
export const transformAssetUrls = { video: ["src"] };

export const writeFile = vi.fn(async () => {});
export const rm = vi.fn(async () => {});
export const cp = vi.fn(async () => {});
export const readFile = vi.fn(async () => "");

/** Module shapes, each fed to a `vi.mock` factory in the spec. */
export const vite = {
  defineConfig,
  loadEnv,
  mergeConfig,
  searchForWorkspaceRoot,
  createLogger,
  createServer,
  build,
  preview,
};
export const pluginVue = { default: vuePlugin };
export const pluginVuetify = { default: vuetifyPlugin, transformAssetUrls };
export const fsPromises = { writeFile, rm, cp, readFile };

/** `vi.clearAllMocks` only clears calls, so return values have to be reinstated. */
export function resetViteMocks() {
  vi.clearAllMocks();
  loadEnv.mockReturnValue({});
  mergeConfig.mockReturnValue(undefined);
  searchForWorkspaceRoot.mockReturnValue(WORKSPACE_ROOT);
  vuePlugin.mockImplementation(pluginSentinel("vue"));
  vuetifyPlugin.mockImplementation(pluginSentinel("vuetify"));
  build.mockResolvedValue(undefined);
  createServer.mockResolvedValue(devServer);
  preview.mockResolvedValue(previewServer);
}
