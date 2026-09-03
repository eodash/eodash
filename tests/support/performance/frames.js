/**
 * Vite serves sources with a cache-busting query, and pre-bundled dependencies
 * from a hashed cache directory that says nothing about which package it is.
 */
const tidyUrl = (/** @type {string} */ url) =>
  url
    .replace(location.origin, "")
    .replace(/\?.*$/, "")
    .replace(/^\//, "")
    .replace(/^node_modules\/\.vite\/.*\/deps\//, "");

/**
 * A call frame as `name (file:line)`. Undefined when the frame carries no url,
 * which is how synthetic and browser-issued work arrives; callers say what that
 * means in their own terms.
 *
 * @param {{functionName?: string, url?: string, lineNumber?: number}} [frame]
 */
export const frameLabel = (frame) =>
  frame?.url &&
  `${frame.functionName || "(anonymous)"} (${tidyUrl(frame.url)}:${frame.lineNumber})`;

/** Frames innermost first, continued through the async parents. @param {any} stack */
export const stackTrace = (stack, limit = 6) => {
  /** @type {{functionName?: string, url?: string, lineNumber?: number}[]} */
  const frames = [];
  for (
    let level = stack;
    level && frames.length < limit;
    level = level.parent
  ) {
    frames.push(...(level.callFrames ?? []));
  }
  return frames.slice(0, limit);
};

/**
 * The nearest application frame, falling back to whichever frame issued the
 * call. Loads are made by a library on the app's behalf, so the innermost frame
 * names the library every time and answers nobody's question.
 *
 * @param {{functionName?: string, url?: string, lineNumber?: number}[]} [frames]
 */
export const callerLabel = (frames = []) =>
  frameLabel(frames.find(({ url }) => url && !url.includes("node_modules"))) ||
  frameLabel(frames[0]);
