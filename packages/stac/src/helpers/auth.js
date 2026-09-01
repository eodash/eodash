/**
 * Applies authentication logic to a link or asset URL based on the STAC authentication extension.
 * Reads schemas defined on the STAC Item to determine the authentication type (e.g., API keys).
 *
 * @param {import("../types").STACItem} item
 * @param {import("../types").AuthLink | import("../types").STACAsset} linkOrAsset
 * @param { Record<string, unknown> | undefined } optionsObject - Options object passed to handlers and modified if needed.
 * @returns {{url: string, optionsObject: Record<string, unknown> | undefined}}
 */
export function handleAuthenticationOfLink(item, linkOrAsset, optionsObject) {
  for (const authRef of linkOrAsset["auth:refs"] || []) {
    const scheme = item["auth:schemes"]?.[authRef];
    if (scheme) {
      switch (scheme.type) {
        case "apiKey": {
          return handleApiKeyBasedAuth(scheme, linkOrAsset.href, optionsObject);
        }
        default:
          console.error(
            `eodash does not support referenced authentication scheme ${authRef}`,
          );
      }
    }
  }
  return { url: linkOrAsset.href, optionsObject };
}
/**
 * Generic handler for possible authentications schemes as defined in STAC authentication extension.
 * @param {import("../types").ApiKeyAuthScheme} schemeDef
 * @param { string } href
 * @param { Record<string, unknown> | undefined } optionsObject
 * @returns { {url: string, optionsObject: Record<string, unknown> | undefined} }
 */
function handleApiKeyBasedAuth(schemeDef, href, optionsObject) {
  let url = href;
  switch (schemeDef.in) {
    case "query": {
      const apiKey = schemeDef.name;
      const envVar = "EODASH_" + apiKey;
      const envValue = getEnv()[envVar];
      if (envValue) {
        if (typeof optionsObject !== "undefined") {
          optionsObject = { ...optionsObject, apiKey: envValue };
        } else {
          url = setQueryParam(href, apiKey, envValue);
        }
      } else {
        console.error(
          `env variable ${envVar} for authentication parameter ${apiKey} not set`,
        );
      }
      break;
    }
    default:
      console.error("eodash does not support any referenced handler");
  }
  return { url, optionsObject };
}

/**
 * Inserts or replaces a query parameter in a URL string (without escaping special characters).
 *
 * @param {string} url - Input URL (may contain special characters)
 * @param {string} key - Query parameter key (e.g. "token", "authCode")
 * @param {string} value - Value to set for the key
 * @returns {string} - Updated URL string
 */
function setQueryParam(url, key, value) {
  const [base, hash] = url.split("#", 2);
  const pattern = new RegExp(`([?&])${key}=[^&#]*`, "i");

  if (pattern.test(base)) {
    url = base.replace(pattern, `$1${key}=${value}`);
  } else {
    const joiner = base.includes("?") ? "&" : "?";
    url = `${base}${joiner}${key}=${value}`;
  }

  if (hash) url += "#" + hash;

  return url;
}

/**
 * The environment as the host exposes it, from either source. Read per call, so
 * a host that polyfills `globalThis.process` after this module loads is seen.
 *
 * @returns {Record<string, string | undefined>}
 */
function getEnv() {
  const proc = globalThis.process;
  const meta = import.meta;
  return { ...meta.env, ...proc?.env };
}
