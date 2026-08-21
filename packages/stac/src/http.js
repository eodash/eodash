/**
 * Query values for HTTP requests.
 *
 * @typedef {Record<string, string | number | undefined>} SearchQuery
 */

/**
 * HTTP client interface for internal library reads and builders.
 *
 * @typedef {object} HttpClient
 * @property {<T = any>(url: string, params?: SearchQuery) => Promise<T>} get reads json
 */

/**
 * An Axios-compatible instance interface.
 *
 * @typedef {object} AxiosInstance
 * @property {(url: string, config?: { params?: SearchQuery }) => Promise<{ data: any }>} get
 */

/**
 * Creates an HTTP client for making API requests.
 * Uses the provided client or defaults to native `fetch`.
 *
 * @param {object} [context]
 * @param {AxiosInstance} [context.client]
 * @returns {HttpClient}
 */
export const createHTTPInstance = ({ client } = {}) => ({
  get: async (url, params) => {
    if (client) {
      const response = await client.get(url, params && { params });
      return response.data;
    }
    const response = await fetch(withQuery(url, params));
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText} for ${url}`);
    }
    return response.json();
  },
});

/**
 * @param {string} url
 * @param {SearchQuery} [params]
 */
function withQuery(url, params) {
  if (!params) {
    return url;
  }
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  }
  const search = query.toString();
  return search ? `${url}?${search}` : url;
}
