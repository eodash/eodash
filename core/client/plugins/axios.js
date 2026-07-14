import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";

import { loading } from "@/store/states";
// TEMP: prototype per-item S1 rasterform until it is added to the STAC items
import s1RasterForm from "../../../templates/s1-rtc-rasterform.json";

const instance = Axios.create();
export const axios = setupCache(instance, { cacheTakeover: false });

/**
 * TEMP: bake the item's orbit into the S1 rasterform by resolving every
 * `{{orbit}}` token (in expressions, enums, defaultVariables) to the item's
 * `sat:orbit_state`, so the layer-config form targets the item's primary orbit.
 * @param {"ascending" | "descending"} orbit
 * @returns {Record<string, any>}
 */
function s1RasterFormForOrbit(orbit) {
  return JSON.parse(JSON.stringify(s1RasterForm).replaceAll("{{orbit}}", orbit));
}

/**
 * TEMP: attach a per-item `eodash:rasterform` to Sentinel-1 GRD items so the
 * layer-config form defaults to the item's orbit. Recurses into feature
 * collections (search results).
 * @param {any} data STAC response payload
 */
function patchS1Rasterform(data) {
  if (!data || typeof data !== "object") return;
  if (Array.isArray(data.features)) {
    data.features.forEach(patchS1Rasterform);
    return;
  }
  if (
    data.type === "Feature" &&
    typeof data.collection === "string" &&
    data.collection.startsWith("sentinel-1-grd") &&
    !data["eodash:rasterform"]
  ) {
    const orbit =
      data.properties?.["sat:orbit_state"] === "descending"
        ? "descending"
        : "ascending";
    data["eodash:rasterform"] = s1RasterFormForOrbit(orbit);
  }
}

function installLoadingInterceptors() {
  const reqId = axios.interceptors.request.use((config) => {
    loading.activeLoads++;
    return config;
  });

  const resId = axios.interceptors.response.use(
    (response) => {
      loading.activeLoads = Math.max(0, loading.activeLoads - 1);
      patchS1Rasterform(response.data); // TEMP
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

const dispose = installLoadingInterceptors();

if (import.meta.hot) {
  import.meta.hot.dispose(() => dispose());
}

export default axios;
