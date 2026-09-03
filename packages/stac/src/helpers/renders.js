/**
 * Resolves the render presets for a collection.
 * Prefers client-provided configurations over the collection's native STAC `renders` extension.
 *
 * @param {import("../types").STACCollection | null | undefined} collection
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
 * Normalizes TiTiler rescale arrays into `[min, max]` pairs.
 * Unnested numeric lists are chunked (e.g., `[0,0.4,0,0.1]` -> `[[0,0.4],[0,0.1]]`).
 *
 * @param {number[]|number[][]|undefined} rescale - Flat or nested rescale values.
 * @returns {number[][]|undefined} Rescale as `[min, max]` pairs.
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
 * Normalizes nodata values by stripping out redundant `NaN` strings or numbers.
 * `NaN` is the implicit fill for float data in TiTiler.
 *
 * @param {string|number|undefined} nodata - Nodata value from render or asset metadata.
 * @returns {string|number|undefined}
 */
export function normalizeNodata(nodata) {
  if (typeof nodata === "number" && Number.isNaN(nodata)) return undefined;
  if (typeof nodata === "string" && nodata.trim().toLowerCase() === "nan")
    return undefined;
  return nodata;
}

/**
 * Adapts an XYZ tile URL to use TiTiler's upscaling mechanism.
 * Depending on the titiler version configured, it modifies either the `{y}` coordinate or appends a `tilesize` query parameter.
 *
 * @param {string} url - The XYZ tile URL template.
 * @param {Array<string | { url: string; titilerVersion?: 1 | 2, scaleFactor?: number }>} upscalingEndpoints
 * @returns {{ url: string; tileSize: [number, number] } | null} Returns null if no endpoint matches.
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
