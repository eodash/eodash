import { unionMs } from "./clock";
import { callerLabel, frameLabel, stackTrace } from "./frames";

/**
 * `canceled` is a request the app or browser abandoned, which is routine during
 * a view change. `failed` is a transport error or a >= 400 status.
 * @typedef {"pending" | "ok" | "failed" | "canceled"} RequestState
 */

/**
 * @typedef {object} Request
 * @property {string} url
 * @property {string} method
 * @property {string} range
 * @property {string} via the calling frame, or the resource type for tiles and
 *   other loads the browser issues without a stack
 * @property {string[]} trace the frames behind `via`, innermost first
 * @property {number} start
 * @property {number} end
 * @property {number} bytes transferred
 * @property {number} status
 * @property {RequestState} state
 * @property {boolean} cached served from a cache rather than the network
 */

/** @param {string} url */
const isExternal = (url) =>
  !url.startsWith(location.origin) &&
  !url.startsWith("blob:") &&
  !url.startsWith("data:");

/**
 * Only served responses are keyed, since retrying a failure is recovery. The
 * key includes the byte range because paging through a COG legitimately reads
 * one file many times.
 *
 * @param {Request[]} requests
 */
const repeatedIn = (requests) => {
  /** @type {Map<string, Request & {times: number}>} */
  const seen = new Map();
  for (const request of requests.filter(({ state }) => state === "ok")) {
    const key = `${request.method} ${request.url} ${request.range}`;
    const entry = seen.get(key) ?? { ...request, times: 0 };
    entry.times += 1;
    seen.set(key, entry);
  }
  return [...seen.values()].filter(({ times }) => times > 1);
};

/**
 * Requests from the devtools protocol. It reports the `Range` header, the
 * calling stack, the status and the transferred bytes for cross-origin
 * responses, none of which Resource Timing exposes.
 *
 * @param {{send: Function, on: Function, off: Function}} session vitest `cdp()`
 * @param {ReturnType<typeof import("./clock").createClock>} clock
 */
export const observeNetwork = async (session, clock) => {
  /** @type {Map<string, Request>} */
  const byId = new Map();
  let inFlight = 0;

  /** @param {number} seconds */
  const at = (seconds) => seconds * 1000;

  /** @param {any} event */
  const onSent = (event) => {
    // A redirect reuses the request id but only closes the chain once, so each
    // hop must extend the request in flight. Counting hops separately leaves
    // the count stuck above zero and the window never closes.
    if (event.redirectResponse && byId.has(event.requestId)) {
      clock.touch();
      return;
    }
    const frames = stackTrace(event.initiator?.stack);
    byId.set(event.requestId, {
      url: event.request.url,
      method: event.request.method,
      range: event.request.headers?.Range ?? event.request.headers?.range ?? "",
      via: callerLabel(frames) || event.type || "other",
      //@ts-expect-error todo
      trace: frames.map(frameLabel),
      start: at(event.timestamp),
      end: at(event.timestamp),
      bytes: 0,
      status: 0,
      state: "pending",
      cached: false,
    });
    inFlight++;
    clock.touch();
  };

  // A 4xx arrives like any other response, so the status is what separates a
  // served error from a served body.
  /** @param {any} event */
  const onResponse = (event) => {
    const request = byId.get(event.requestId);
    if (!request) return;
    request.status = event.response?.status ?? 0;
    request.cached ||= Boolean(event.response?.fromDiskCache);
  };

  /** @param {any} event */
  const onCached = (event) => {
    const request = byId.get(event.requestId);
    if (request) request.cached = true;
  };

  /** @param {any} event @param {RequestState} state */
  const close = (event, state) => {
    const request = byId.get(event.requestId);
    if (!request) return;
    Object.assign(request, {
      end: at(event.timestamp),
      bytes: event.encodedDataLength || request.bytes,
      state,
    });
    inFlight--;
    clock.touch();
  };

  /** @param {any} event */
  const onDone = (event) =>
    close(
      event,
      (byId.get(event.requestId)?.status ?? 0) >= 400 ? "failed" : "ok",
    );
  /** @param {any} event */
  const onFailed = (event) =>
    close(event, event.canceled ? "canceled" : "failed");

  session.on("Network.requestWillBeSent", onSent);
  session.on("Network.responseReceived", onResponse);
  session.on("Network.requestServedFromCache", onCached);
  session.on("Network.loadingFinished", onDone);
  session.on("Network.loadingFailed", onFailed);
  await session.send("Network.enable");

  return {
    name: "requests",
    busy: () => inFlight > 0,
    collect: () => {
      const requests = [...byId.values()].filter(({ url }) => isExternal(url));
      const counted = (/** @type {RequestState} */ state) =>
        requests.filter((request) => request.state === state).length;
      const repeated = repeatedIn(requests);
      // Requests still open when the window closed have no duration to add.
      const spans = requests.filter(({ start, end }) => end > start);
      /** @type {Map<string, Request[]>} */
      const byHost = new Map();
      for (const span of spans) {
        const { host } = new URL(span.url);
        byHost.set(host, [...(byHost.get(host) ?? []), span]);
      }
      return {
        requests: requests.length,
        // Failures cost time and bytes like anything else, so they are counted
        // everywhere below. Only a connection that never opened carries none.
        failedRequests: counted("failed"),
        canceledRequests: counted("canceled"),
        bytes: requests.reduce((total, { bytes }) => total + bytes, 0),
        repeatedRequests: repeated,
        networkMs: unionMs(spans),
        hosts: [...byHost]
          .map(([host, group]) => ({
            host,
            requests: group.length,
            failed: group.filter(({ state }) => state === "failed").length,
            bytes: group.reduce((total, { bytes }) => total + bytes, 0),
            networkMs: unionMs(group),
          }))
          .sort((a, b) => b.networkMs - a.networkMs),
      };
    },
    dispose: async () => {
      session.off("Network.requestWillBeSent", onSent);
      session.off("Network.responseReceived", onResponse);
      session.off("Network.requestServedFromCache", onCached);
      session.off("Network.loadingFinished", onDone);
      session.off("Network.loadingFailed", onFailed);
      await session.send("Network.disable");
    },
  };
};
