import { vi } from "vitest";
import path from "path";

/** @typedef {import("../../../core/node/cli/globals.js").EodashContext} EodashContext */
/** @typedef {import("../../../core/node/cli/globals.js").ResolvedUserConfig} ResolvedUserConfig */

/**
 * Anything a test wants to differ from the defaults below.
 *
 * @typedef {Partial<Omit<EodashContext, "userConfig">> &
 *   { userConfig?: Partial<ResolvedUserConfig> }} ContextOverrides
 */

/** Host application root every derived path hangs off. */
export const HOST_ROOT = "/host/app";

/**
 * A hand-built context, bypassing `resolveEodashContext` so config tests pin
 * the consumer rather than the path derivation.
 *
 * @param {ContextOverrides} [overrides]
 * @returns {EodashContext}
 */
export const makeCtx = ({ userConfig, ...overrides } = {}) => ({
  // getUserConfig runs the port through `Number(...)`, so an unset one arrives
  // as NaN rather than undefined; anything else would pin a value the CLI
  // never produces.
  userConfig: { port: NaN, ...userConfig },
  rootPath: HOST_ROOT,
  logger: makeLogger(),
  srcPath: path.join(HOST_ROOT, "src"),
  dotEodashPath: path.join(HOST_ROOT, ".eodash"),
  publicPath: path.join(HOST_ROOT, "public"),
  runtimeConfigPath: path.join(HOST_ROOT, "src/runtime.js"),
  entryPath: path.join(HOST_ROOT, "src/main.js"),
  internalWidgetsPath: path.join(HOST_ROOT, "src/widgets"),
  buildTargetPath: path.join(HOST_ROOT, ".eodash/dist"),
  cachePath: path.join(HOST_ROOT, ".eodash/cache"),
  ...overrides,
});

/** @returns {import("vite").Logger} */
function makeLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    warnOnce: vi.fn(),
    error: vi.fn(),
    clearScreen: vi.fn(),
    hasErrorLogged: vi.fn(() => false),
    hasWarned: false,
  };
}
