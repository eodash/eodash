/**
* Generic handler for possible authentications schemes as defined in STAC authentication extension.
* @param {import("@/types").StacAuthItem } item
* @param {import("@/types").StacAuthLink | import("@/types").StacAuthAsset} linkOrAsset
* @returns {string}
*/
export function handleAuthenticationOfLink(item, linkOrAsset) {
  // browse through all authentication refs on a link to find a first one we support
  for (const authRef of linkOrAsset["auth:refs"] || []) {
    const authSchemes  = item["auth:schemes"];
    if (authRef in authSchemes) {
      switch (authSchemes[authRef].type) {
        case "apiKey":
        //@ts-expect-error TODO
        return handleApiKeyBasedAuth(authSchemes[authRef], linkOrAsset.href);
        // case "signedUrl":
        // case "s3":
        // case "http":
        // case "openIdConnect":
        // case "apiKey":
        // case "oauth2":
        // todo add more handlers when needed
        default:
        console.error(`eodash does not support referenced authentication scheme ${authRef}`);
      }
    }
  }
  return linkOrAsset.href;
}
/**
* Generic handler for possible authentications schemes as defined in STAC authentication extension.
* @param {import("@/types").ApiKeyAuthScheme } schemeDef
* @param { string } href
* @returns { string }
*/
function handleApiKeyBasedAuth(schemeDef, href) {
  // add token to query parameters of href
  let url = href;
  switch (schemeDef.in) {
    case "query":
      const apiKey = schemeDef.name;
      // this this 
      const envVar = "EODASH_" + apiKey;
      const envValue = process.env[envVar];
      if (envValue) {
        url = setQueryParam(href, apiKey, envValue);
      } else {
        console.error(`env variable ${envVar} for authentication parameter ${apiKey} not set`);
      }
      break
    default:
      console.error('eodash does not support any referenced handler');
  }
  return url;
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
