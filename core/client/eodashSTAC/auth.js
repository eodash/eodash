/**
 * Generic handler for possible authentications schemes as defined in STAC authentication extension.
 * @param {import("@/types").StacAuthItem } item
 * @param {import("@/types").StacAuthLink | import("@/types").StacAuthAsset} linkOrAsset
 * @param { object } optionsObject // generic object to pass options to handlers and modify them if needed
 * @returns {{url: string, optionsObject: object}}
 */
export function handleAuthenticationOfLink(item, linkOrAsset, optionsObject) {
  // browse through all authentication refs on a link to find a first one we support
  for (const authRef of linkOrAsset["auth:refs"] || []) {
    const authSchemes = item["auth:schemes"];
    if (authRef in authSchemes) {
      switch (authSchemes[authRef].type) {
        case "apiKey": {
          return handleApiKeyBasedAuth(
            //@ts-expect-error TODO
            authSchemes[authRef],
            linkOrAsset.href,
            optionsObject,
          );
        }
        // case "signedUrl":
        // case "s3":
        // case "http":
        // case "openIdConnect":
        // case "apiKey":
        // case "oauth2":
        // todo add more handlers when needed
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
 * @param {import("@/types").ApiKeyAuthScheme } schemeDef
 * @param { string } href
 * @param { object } optionsObject
 * @returns { {url: string, optionsObject: object} }
 */
function handleApiKeyBasedAuth(schemeDef, href, optionsObject) {
  // add token to query parameters of href
  let url = href;
  switch (schemeDef.in) {
    case "query": {
      const apiKey = schemeDef.name;
      const envVar = "EODASH_" + apiKey;
      const envValue = process.env[envVar];
      if (envValue) {
        if (optionsObject) {
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
  // Split off any fragment (#something)
  const [base, hash] = url.split("#", 2);

  // Regex to detect existing key, respecting ? or &
  const pattern = new RegExp(`([?&])${key}=[^&#]*`, "i");

  if (pattern.test(base)) {
    // Replace existing key=value
    url = base.replace(pattern, `$1${key}=${value}`);
  } else {
    // Append as new key=value
    const joiner = base.includes("?") ? "&" : "?";
    url = `${base}${joiner}${key}=${value}`;
  }

  // Reattach fragment if present
  if (hash) url += "#" + hash;

  return url;
}
