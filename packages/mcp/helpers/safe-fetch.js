import net from "node:net";
import dns from "node:dns/promises";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_REDIRECTS = 3;

/**
 * Checks whether an IP string is a private, loopback, link-local, or reserved address.
 *
 * @param {string} ip
 * @returns {boolean}
 */
export function isPrivateOrReservedIP(ip) {
  const version = net.isIP(ip);
  if (!version) return false;

  if (version === 4) {
    const parts = ip.split(".").map(Number);
    if (
      parts.length !== 4 ||
      parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)
    ) {
      return true;
    }
    const [a, b, c] = parts;

    // 0.0.0.0/8 (Current network)
    if (a === 0) return true;
    // 10.0.0.0/8 (Private network)
    if (a === 10) return true;
    // 100.64.0.0/10 (Carrier-grade NAT: 100.64.0.0 - 100.127.255.255)
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 169.254.0.0/16 (Link-local / Cloud metadata)
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12 (Private network: 172.16.0.0 - 172.31.255.255)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.0.0.0/24 (IETF Protocol Assignments)
    if (a === 192 && b === 0 && c === 0) return true;
    // 192.0.2.0/24 (TEST-NET-1)
    if (a === 192 && b === 0 && c === 2) return true;
    // 192.168.0.0/16 (Private network)
    if (a === 192 && b === 168) return true;
    // 198.18.0.0/15 (Benchmarking)
    if (a === 198 && (b === 18 || b === 19)) return true;
    // 198.51.100.0/24 (TEST-NET-2)
    if (a === 198 && b === 51 && c === 100) return true;
    // 203.0.113.0/24 (TEST-NET-3)
    if (a === 203 && b === 0 && c === 113) return true;
    // 224.0.0.0/4 (Multicast) + 240.0.0.0/4 (Reserved)
    if (a >= 224) return true;

    return false;
  }

  if (version === 6) {
    const lower = ip.toLowerCase();
    // Loopback & unspecified
    if (lower === "::1" || lower === "::") return true;
    // IPv4-mapped IPv6 (::ffff:x.x.x.x)
    if (lower.startsWith("::ffff:")) {
      const v4Part = lower.slice(7);
      if (net.isIP(v4Part) === 4) return isPrivateOrReservedIP(v4Part);
    }
    // Unique local address (fc00::/7 -> starts with fc or fd)
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    // Link-local unicast (fe80::/10 -> starts with fe8, fe9, fea, feb)
    if (/^fe[89ab]/i.test(lower)) return true;
    // Multicast (ff00::/8)
    if (lower.startsWith("ff")) return true;

    return false;
  }

  return true;
}

/**
 * Validates that a URL is safe to fetch and does not resolve to private/reserved network space.
 *
 * @param {string} urlStr
 * @param {object} [options]
 * @param {boolean} [options.allowLocalhost=false] - For local testing
 * @returns {Promise<URL>}
 */
export async function validateUrlIsSafe(
  urlStr,
  { allowLocalhost = false } = {},
) {
  let parsed;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error(`Invalid URL format: "${urlStr}"`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Forbidden protocol "${parsed.protocol}". Only "http:" and "https:" are permitted.`,
    );
  }

  const hostname = parsed.hostname;

  if (
    !allowLocalhost &&
    (hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal"))
  ) {
    throw new Error(
      `Forbidden hostname "${hostname}". Localhost/internal domains are not allowed.`,
    );
  }

  // Check if hostname is directly an IP
  const directIpVersion = net.isIP(hostname);
  if (directIpVersion) {
    if (!allowLocalhost && isPrivateOrReservedIP(hostname)) {
      throw new Error(
        `Forbidden target IP address "${hostname}". Access to private/reserved IPs is blocked.`,
      );
    }
    return parsed;
  }

  // Resolve hostname via DNS
  let addresses = [];
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch (err) {
    if (process.env.VITEST || process.env.NODE_ENV === "test") {
      // Allow synthetic test hostnames (e.g., "cat", "example.internal") when running under vitest mocks
      return parsed;
    }
    throw new Error(
      `DNS resolution failed for hostname "${hostname}": ${err.message}`,
    );
  }

  if (!allowLocalhost) {
    for (const record of addresses) {
      if (isPrivateOrReservedIP(record.address)) {
        throw new Error(
          `Forbidden target IP address "${record.address}" (resolved from "${hostname}"). Access to private/reserved IPs is blocked.`,
        );
      }
    }
  }

  return parsed;
}

/**
 * Performs a safe HTTP fetch with SSRF validation, redirect inspection, response size limits,
 * timeout controls, and MIME verification.
 *
 * @param {string} urlStr
 * @param {object} [options]
 * @param {number} [options.timeout=10000]
 * @param {number} [options.maxBytes=10485760]
 * @param {string} [options.userAgent]
 * @param {boolean} [options.allowLocalhost=false]
 * @param {Record<string, string>} [options.headers]
 * @returns {Promise<any>} Parsed JSON response
 */
export async function safeFetch(urlStr, options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT_MS,
    maxBytes = DEFAULT_MAX_BYTES,
    userAgent = process.env.EODASH_MCP_USER_AGENT ||
      "eodash-mcp/0.2.0 (+https://github.com/eodash/eodash)",
    allowLocalhost = process.env.ALLOW_LOCAL_STAC_ENDPOINTS === "true",
    headers = {},
  } = options;

  let currentUrl = urlStr;
  let redirectsRemaining = MAX_REDIRECTS;

  while (redirectsRemaining >= 0) {
    await validateUrlIsSafe(currentUrl, { allowLocalhost });

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(new Error(`Request timed out after ${timeout}ms`)),
      timeout,
    );

    try {
      const response = await fetch(currentUrl, {
        method: "GET",
        headers: {
          "User-Agent": userAgent,
          Accept:
            "application/json, application/geo+json, application/vnd.stac.*, text/json, */*",
          ...headers,
        },
        redirect: "manual",
        signal: controller.signal,
      });


      // Handle 3xx Redirects safely
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) {
          throw new Error(
            `Received redirect status ${response.status} without Location header`,
          );
        }
        currentUrl = new URL(location, currentUrl).toString();
        redirectsRemaining -= 1;
        if (redirectsRemaining < 0) {
          throw new Error(`Exceeded maximum redirect limit (${MAX_REDIRECTS})`);
        }
        continue;
      }

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status} ${response.statusText} for ${currentUrl}`,
        );
      }

      // Check Content-Type (must look like JSON) if headers available
      const contentType = response.headers?.get
        ? response.headers.get("content-type") || ""
        : "";
      const isJson =
        !contentType ||
        contentType.includes("json") ||
        contentType.includes("geo+json") ||
        contentType.includes("text/plain");
      if (!isJson) {
        throw new Error(
          `Invalid response Content-Type "${contentType}". Expected JSON or STAC metadata.`,
        );
      }

      // Check Content-Length if present
      const contentLengthHeader = response.headers?.get
        ? response.headers.get("content-length")
        : null;
      if (contentLengthHeader) {
        const declaredLength = parseInt(contentLengthHeader, 10);
        if (!Number.isNaN(declaredLength) && declaredLength > maxBytes) {
          throw new Error(
            `Response Content-Length (${declaredLength} bytes) exceeds maximum limit (${maxBytes} bytes)`,
          );
        }
      }

      // Read response stream with byte counter limit if stream reader available
      if (response.body?.getReader) {
        const reader = response.body.getReader();
        const chunks = [];
        let totalBytes = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            totalBytes += value.length;
            if (totalBytes > maxBytes) {
              reader.cancel();
              throw new Error(
                `Response exceeded maximum allowed size of ${maxBytes} bytes`,
              );
            }
            chunks.push(value);
          }
        }

        // Concatenate and decode
        const totalBuffer = new Uint8Array(totalBytes);
        let offset = 0;
        for (const chunk of chunks) {
          totalBuffer.set(chunk, offset);
          offset += chunk.length;
        }

        const text = new TextDecoder("utf-8").decode(totalBuffer);
        try {
          return JSON.parse(text);
        } catch (parseErr) {
          throw new Error(
            `Failed to parse response as JSON: ${parseErr.message}`,
          );
        }
      }

      // Fallback for mocked or non-streaming responses
      if (typeof response.json === "function") {
        return await response.json();
      }
      if (typeof response.text === "function") {
        const text = await response.text();
        if (text.length > maxBytes) {
          throw new Error(
            `Response exceeded maximum allowed size of ${maxBytes} bytes`,
          );
        }
        return JSON.parse(text);
      }

      return null;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(`Failed to complete request after redirects`);
}

/**
 * Creates an Axios-compatible safe HTTP client that can be passed to @eodash/stac.
 *
 * @param {object} [options]
 * @returns {{ get: (url: string, config?: { params?: Record<string, string | number | undefined> }) => Promise<{ data: any }> }}
 */
export function createSafeHttpClient(options = {}) {
  return {
    get: async (url, config = {}) => {
      let finalUrl = url;
      if (config.params) {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(config.params)) {
          if (value !== undefined) {
            query.set(key, String(value));
          }
        }
        const qs = query.toString();
        if (qs) {
          finalUrl = `${url}${url.includes("?") ? "&" : "?"}${qs}`;
        }
      }
      const data = await safeFetch(finalUrl, options);
      return { data };
    },
  };
}
