import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";
import { errorState, loading } from "@/store/states";

const instance = Axios.create();
export const axios = setupCache(instance, { cacheTakeover: false });

/**
 * STAC properties worth naming when they fail, each declaring where its urls
 * live and how much the user loses. Adding one is a single entry; anything
 * unlisted keeps the bare url and stops what was asked for.
 *
 * @type {Record<string, {label: string, severity: "error" | "warning" | "info", urls: (doc: {links?: Record<string, any>[]} & Record<string, any>) => (string | undefined)[]}>}
 */
const RESOURCES = {
  "eodash:vegadefinition": {
    label: "chart definition",
    severity: "warning",
    urls: (doc) => [doc["eodash:vegadefinition"]],
  },
  // without the schema the process form cannot render at all
  "eodash:jsonform": {
    label: "process form definition",
    severity: "error",
    urls: (doc) => [doc["eodash:jsonform"]],
  },
  style: {
    label: "layer style",
    severity: "warning",
    urls: (doc) =>
      doc.links?.filter((l) => l.rel?.includes("style")).map((l) => l.href) ??
      [],
  },
  // a link's flatstyle is a url, a list of {id,url}, or a map of them
  "eox:flatstyle": {
    label: "flat style",
    severity: "warning",
    urls: (doc) =>
      doc.links?.flatMap((l) => {
        const style = l["eox:flatstyle"];
        if (typeof style === "string") return [style];
        if (Array.isArray(style)) return style.map((s) => s?.url);
        return Object.values(style ?? {});
      }) ?? [],
  },
};

const disposeLoading = installLoadingInterceptors();
const disposeError = installErrorInterceptors();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    disposeLoading();
    disposeError();
  });
}

export default axios;

function installLoadingInterceptors() {
  const reqId = axios.interceptors.request.use((config) => {
    loading.activeLoads++;
    return config;
  });

  const resId = axios.interceptors.response.use(
    (response) => {
      loading.activeLoads = Math.max(0, loading.activeLoads - 1);
      return response;
    },
    (error) => {
      loading.activeLoads = Math.max(0, loading.activeLoads - 1);
      return Promise.reject(error);
    },
  );

  return () => {
    axios.interceptors.request.eject(reqId);
    axios.interceptors.response.eject(resId);
  };
}

function installErrorInterceptors() {
  const id = axios.interceptors.response.use(
    reportParseFailure,
    reportFetchFailure,
  );
  return () => axios.interceptors.response.eject(id);
}

/**
 * axios swallows `JSON.parse` failures and hands back the raw string, so a
 * malformed file reaches callers as a success. Skipped when the caller asked
 * for a non-JSON `responseType`.
 *
 * @param {import("axios").AxiosResponse} response
 */
function reportParseFailure(response) {
  const body =
    !response.config.responseType && typeof response.data === "string"
      ? response.data
      : "";

  if (!body.trim()) {
    indexResources(response.data ?? {});
    return response;
  }

  report("parse", "not valid JSON", response.config, asDetails(body));
  throw new Axios.AxiosError(
    "not valid JSON",
    Axios.AxiosError.ERR_BAD_RESPONSE,
    response.config,
    response.request,
    response,
  );
}

/**
 * Reports a transport failure and rethrows it as it came, so callers keep the
 * `AxiosError` they would get without this instance.
 *
 * @param {unknown} error
 * @returns {never}
 */
function reportFetchFailure(error) {
  if (!Axios.isAxiosError(error) || Axios.isCancel(error)) {
    throw error;
  }

  // a timeout also sets `error.request`, so it has to be checked first
  const reason =
    error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
      ? "the request timed out"
      : error.response
        ? `${error.response.status} ${error.response.statusText}`
        : error.request
          ? "no response, check the URL and its CORS headers"
          : error.message;

  report("fetch", reason, error.config, asDetails(error.response?.data));

  throw error;
}

/** @param {import("axios").InternalAxiosRequestConfig} [config] */
function target(config) {
  return `${config?.method?.toUpperCase() ?? "GET"} ${config?.url}`;
}

/** @param {string} [url] */
function fileName(url) {
  return url?.split(/[?#]/)[0].split("/").at(-1) || "file";
}

/** @param {unknown} payload */
const asDetails = (payload) => {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload);
  return text ? text.slice(0, 500) : "";
};
/**
 * Which `RESOURCES` entry a url belongs to. Style and vega hrefs sit on
 * third-party hosts, so the document that referenced them is the only thing
 * that can name them — and it is long gone by the time they are fetched.
 * @type {Map<string, string>}
 */
const resourceByUrl = new Map();

/** @param {any} doc a document that may reference described resources */
const indexResources = (doc) => {
  for (const [name, { urls }] of Object.entries(RESOURCES)) {
    for (const url of urls(doc)) {
      if (url) {
        resourceByUrl.set(url, name);
      }
    }
  }
};

/**
 * Shows the failure to the user. The only writer of `errorState`.
 *
 * @param {string} verb
 * @param {string} reason
 * @param {import("axios").InternalAxiosRequestConfig} [config]
 * @param {string} [details] raw payload the server returned, if any
 */
const report = (verb, reason, config, details = "") => {
  const resource = config?.url && resourceByUrl.get(config.url);
  const named = resource ? RESOURCES[resource].label : fileName(config?.url);

  errorState.value = {
    message: `Failed to ${verb} the ${named} (${reason}).`,
    details: `${target(config)}\n${details}`.trim(),
    severity: resource ? RESOURCES[resource].severity : "error",
  };
};
