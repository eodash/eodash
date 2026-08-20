/**
 * Query values as they go on the wire. An array is joined by the caller, since
 * the repeated form a client would otherwise send is ignored by STAC APIs.
 *
 * @typedef {Record<string, string | number | undefined>} SearchQuery
 */

/**
 * What the readers and builders read through. `get` takes the shape it is read
 * into, so annotating the variable it lands in checks the read rather than
 * trusting it.
 *
 * @typedef {object} HttpClient
 * @property {<T = any>(url: string, params?: SearchQuery) => Promise<T>} get reads json
 */

/**
 * The client every request goes through. eodash passes its own axios instance,
 * whose interceptors give the package its cache, loading state and error
 * reporting; with none, this falls back to `fetch`, so the package carries no
 * http dependency of its own.
 *
 * @param {object} [context]
 * @param {import("axios").AxiosInstance} [context.client]
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
