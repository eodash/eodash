import { resolve } from "node:path";

/** Routes registered per session, so only they are removed again. */
const registered = new Map();

/**
 * @param {any} ctx
 * @param {Record<string, any>} routes url fragment -> whatever `handler` takes
 * @param {(response: any) => (route: any) => unknown} handler
 */
const addRoutes = async (ctx, routes, handler) => {
  const added = registered.get(ctx.sessionId) ?? [];
  for (const [fragment, response] of Object.entries(routes)) {
    /** @param {URL} url */
    const matches = (url) => url.href.includes(fragment);
    const fulfil = handler(response);
    await ctx.context.route(matches, fulfil);
    added.push({ matches, fulfil });
  }
  registered.set(ctx.sessionId, added);
};

/**
 * Fulfil requests whose url contains a fragment with a local file, adding the
 * CORS header the browser needs. Routing the playwright context covers every
 * transport, including the `XMLHttpRequest` OpenLayers loads features over.
 *
 * @type {import("vitest/node").BrowserCommand<[Record<string, string>]>}
 */
export const serveFiles = async (ctx, routes) =>
  addRoutes(
    ctx,
    routes,
    (file) => (route) =>
      route.fulfill({
        path: resolve(ctx.project.config.root, file),
        headers: { "access-control-allow-origin": "*" },
      }),
  );

/**
 * Answer with a synthetic response rather than a file, so a test can drive a
 * status code, a malformed body, or — with `"abort"` — a request that never
 * reaches a server. axios itself stays untouched, so it builds the real
 * `AxiosError` the interceptor then sees.
 *
 * @type {import("vitest/node").BrowserCommand<[Record<string, "abort" | {status?: number, body?: string, contentType?: string}>]>}
 */
export const serveResponses = async (ctx, routes) =>
  addRoutes(
    ctx,
    routes,
    (response) => (route) =>
      response === "abort"
        ? route.abort("failed")
        : route.fulfill({
            status: response.status ?? 200,
            body: response.body ?? "",
            contentType: response.contentType ?? "application/json",
            headers: { "access-control-allow-origin": "*" },
          }),
  );

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
