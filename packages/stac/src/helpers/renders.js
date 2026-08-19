/**
 * Picks the render presets for a collection, preferring client-provided config
 * (`options.renders[collectionId]`) and falling back to the collection's own STAC
 * `renders` extension when no config entry exists.
 * @param {import("../types").EodashCollection | null | undefined} collection
 * @param {Record<string, Record<string, import("../types").Render>> | undefined} [configRenders]
 * @returns {Record<string, import("../types").Render> | undefined}
 */
export function resolveRenders(collection, configRenders) {
  const config = collection?.id ? configRenders?.[collection.id] : undefined;
  if (config) return config;
  return /** @type {Record<string, import("../types").Render>|undefined} */ (
    collection?.renders ?? undefined
  );
}

/**
 * TiTiler expects rescale as [min,max] pairs; chunks a flat numeric list
 * into pairs (e.g. [0,0.4,0,0.1] -> [[0,0.4],[0,0.1]]). Nested input passes through.
 * @param {number[]|number[][]|undefined} rescale - flat or nested rescale values
 * @returns {number[][]|undefined} rescale as [min,max] pairs
 */
export function normalizeRescale(rescale) {
  if (!rescale?.length || Array.isArray(rescale[0])) {
    return /** @type {number[][]|undefined} */ (rescale);
  }
  const pairs = [];
  for (let i = 0; i < rescale.length; i += 2) {
    pairs.push(/** @type {number[]} */ (rescale).slice(i, i + 2));
  }
  return pairs;
}

/**
 * Drops NaN nodata values; NaN is already the implicit fill for float data,
 * so forwarding `nodata=nan` to TiTiler is redundant.
 * @param {string|number|undefined} nodata - nodata value from render/asset metadata
 * @returns {string|number|undefined} nodata, or undefined when it is NaN
 */
export function normalizeNodata(nodata) {
  if (typeof nodata === "number" && Number.isNaN(nodata)) return undefined;
  if (typeof nodata === "string" && nodata.trim().toLowerCase() === "nan")
    return undefined;
  return nodata;
}

/**
 * Applies titiler upscaling to an XYZ tile URL based on the matched endpoint config.
 * - titiler v1: appends `@2x` to the `{y}` tile coordinate
 * - titiler v2: adds `tilesize=512` query parameter (v2 removed the `@2x` suffix)
 * Plain strings in the config default to v1 behavior for backward compatibility.
 * - scaleFactor, if larger than 2, multiplies the default size of 512px tile requested from server by the value at the expense of larger data transfers
 * for v1, the value is rounded to nearest integer, for titiler v2 it can be a decimal
 *
 * @param {string} url - The XYZ tile URL template
 * @param {Array<string | { url: string; titilerVersion?: 1 | 2, scaleFactor?: number }>} upscalingEndpoints
 * @returns {{ url: string; tileSize: [number, number] } | null} null if no endpoint matches
 */
export function applyTitilerUpscaling(url, upscalingEndpoints) {
  const match = upscalingEndpoints.find((entry) => {
    const endpointUrl = typeof entry === "string" ? entry : entry.url;
    return url.includes(endpointUrl);
  });

  if (!match) {
    return null;
  }

  const version = typeof match === "string" ? 1 : (match.titilerVersion ?? 1);
  let scaleFactor = typeof match === "string" ? 2 : (match.scaleFactor ?? 2);

  if (version === 2) {
    const [base, query] = url.split("?");
    const params = new URLSearchParams(query);
    const tilesize = Math.round(256 * scaleFactor).toString();
    params.set("tilesize", tilesize);
    return { url: `${base}?${params.toString()}`, tileSize: [512, 512] };
  }
  scaleFactor = Math.min(scaleFactor, 4);
  const exponent = Math.round(scaleFactor).toString();
  return { url: url.replace("{y}", `{y}@${exponent}x`), tileSize: [512, 512] };
}
