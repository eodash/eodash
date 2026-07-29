import { resolve } from "node:path";

/** Routes registered per session, so only they are removed again. */
const registered = new Map();

/**
 * Fulfil requests whose url contains a fragment with a local file, adding the
 * CORS header the browser needs. Routing the playwright context covers every
 * transport, including the `XMLHttpRequest` OpenLayers loads features over.
 *
 * @type {import("vitest/node").BrowserCommand<[Record<string, string>]>}
 */
export const serveFiles = async (ctx, routes) => {
  if (ctx.provider.name !== "playwright") {
    throw new Error(`serveFiles does not support ${ctx.provider.name}`);
  }
  const added = registered.get(ctx.sessionId) ?? [];
  for (const [fragment, file] of Object.entries(routes)) {
    /** @param {URL} url */
    const matches = (url) => url.href.includes(fragment);
    /** @param {any} route */
    const fulfil = (route) =>
      route.fulfill({
        path: resolve(ctx.project.config.root, file),
        headers: { "access-control-allow-origin": "*" },
      });
    await ctx.context.route(matches, fulfil);
    added.push({ matches, fulfil });
  }
  registered.set(ctx.sessionId, added);
};

/**
 * Drop those routes again. Playwright reuses one browser context per session, so
 * they would otherwise answer requests in the files that run after this one.
 *
 * @type {import("vitest/node").BrowserCommand<[]>}
 */
export const stopServingFiles = async (ctx) => {
  for (const { matches, fulfil } of registered.get(ctx.sessionId) ?? []) {
    await ctx.context.unroute(matches, fulfil);
  }
  registered.delete(ctx.sessionId);
};
