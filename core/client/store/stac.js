import { defineStore } from "pinia";
import { ref, shallowReactive } from "vue";
import axios from "@/plugins/axios";
import {
  useAbsoluteUrl,
  useCompareAbsoluteUrl,
  useGetSubCodeId,
} from "@/composables/index";
import {
  compareIndicator,
  comparePoi,
  datetime,
  indicator,
  mapCompareEl,
  mapEl,
  poi,
} from "@/store/states";
import { getLatestDatetime } from "@/eodashSTAC/triggers";
import { updateIndicatorLayers } from "@/eodashSTAC/layers";
import { collectionsPalette } from "@/utils/states";
import log from "loglevel";
import {
  toAbsolute,
  getProjectionCode,
  getProjection,
} from "@eodash/stac/helpers";
import { updateEodashCollections } from "@/utils";
import { setMapProjFromCol } from "@/eodashSTAC/triggers";
import { availableMapProjection } from "@/store/states";

/**
 * Collection readers for the active indicator.
 * Rebuilt by {@link loadSelectedSTAC}.
 *
 * @type {import("@eodash/stac").Reader[]}
 */
export const eodashCollections = shallowReactive([]);

/**
 * Collection readers for the active compare indicator.
 * Rebuilt by {@link loadSelectedCompareSTAC}.
 *
 * @type {import("@eodash/stac").Reader[]}
 */
export const eodashCompareCollections = shallowReactive([]);

export const useSTAcStore = defineStore("stac", () => {
  /**
   * STAC catalog endpoint URL
   * @type {import("vue").Ref<string| null>}
   */
  const stacEndpoint = ref(null);
  /**
   * Raster endpoint URL
   * @type {import("vue").Ref<string | null>}
   */
  const rasterEndpoint = ref(null);
  const isApi = ref(false);

  /**
   * List of supported endpoints for upscaling.
   * `scaleFactor` for v1 corresponds to `@nx` suffix (max 4).
   * `scaleFactor` for v2 multiplies base tile size of 256px.
   * Default `scaleFactor` is 2.
   * @type {import("vue").Ref<Array<string | { url: string; titilerVersion?: 1 | 2, scaleFactor?: number; }>>}
   */
  const supportedUpscalingEndpoints = ref([]);

  /**
   * TiTiler render presets from the eodash configuration, keyed by collection
   * id then render name. Take precedence over a collection's own `renders`.
   *
   * @type {Record<string, Record<string, import("@eodash/stac").Render>>}
   */
  const configRenders = {};

  /**
   * Registry of colormap ranges
   * @type {import("vue").Ref<Record<string, string[]> | null>}
   */
  const colormapRegistry = ref(null);

  /**
   * Links of the root STAC catalog
   *
   * @type {import("vue").Ref<import("@eodash/stac").STACLink[] | null>}
   */
  const stac = ref(null);

  /**
   * Selected STAC object.
   *
   * @type {import("vue").Ref<import("@eodash/stac").STACCollection | null>}
   */
  const selectedStac = ref(null);

  /**
   * Selected compare STAC object.
   *
   * @type {import("vue").Ref<import("@eodash/stac").STACCollection | null>}
   */
  const selectedCompareStac = ref(null);
  /**
   * Currently selected item
   * @type {import("vue").Ref<import("@eodash/stac").STACItem | null | undefined>}
   */
  const selectedItem = ref(undefined);
  /**
   * Currently selected compare item
   * @type {import("vue").Ref<import("@eodash/stac").STACItem | null | undefined>}
   */
  const selectedCompareItem = ref(undefined);

  /**
   * Custom registry of TileMatrixSets that replaces the default eodash registry
   * @type {import("vue").Ref<Record<string, any> | null>}
   */
  const tileMatrixSetRegistry = ref(null);

  /**
   * Initializes the store by assigning the STAC endpoint.
   * @param {import("@/types").StacEndpoint} endpoint
   * @param {Record<string, Record<string, import("@eodash/stac").Render>>} [renders] - `options.renders` from the eodash configuration
   */
  function init(endpoint, renders) {
    if (!endpoint) {
      throw new Error("STAC endpoint is not defined");
    }
    Object.assign(configRenders, renders);

    if (typeof endpoint === "string") {
      stacEndpoint.value = endpoint;
      return;
    }
    stacEndpoint.value = endpoint.endpoint;
    isApi.value = endpoint.api ?? false;
    rasterEndpoint.value = endpoint.rasterEndpoint ?? null;
    supportedUpscalingEndpoints.value =
      endpoint.supportedUpscalingEndpoints ?? [];
    if (endpoint.colormapRegistry) {
      loadColormapRegistry(endpoint.colormapRegistry);
    }
    if (endpoint.tileMatrixSetRegistry) {
      loadTileMatrixSetRegistry(endpoint.tileMatrixSetRegistry);
    }
  }

  /**
   * Loads the tileMatrixSet registry from a URL or object
   * @param {string | Record<string, any>} registry
   */
  async function loadTileMatrixSetRegistry(registry) {
    if (typeof registry === "object") {
      tileMatrixSetRegistry.value = registry;
      return;
    }
    try {
      const resp = await axios.get(registry);
      tileMatrixSetRegistry.value = resp.data;
    } catch (err) {
      log.error("Error loading TileMatrixSet registry", err);
    }
  }

  /**
   * Loads the colormap registry from a URL or object
   * @param {string | Record<string, string[]>} registry
   */
  async function loadColormapRegistry(registry) {
    if (typeof registry === "object") {
      colormapRegistry.value = registry;
      return;
    }
    try {
      const resp = await axios.get(registry);
      colormapRegistry.value = resp.data;
    } catch (err) {
      log.error("Error loading colormap registry", err);
    }
  }

  /**
   * Fetches root stac catalog and assign it to `stac`
   *
   * @param {string} [url=stacEndpoint] Default
   *   is  the configured `stacEndpoint` url
   * @returns {Promise<void>}
   * @see {@link stac}
   */
  async function loadSTAC(url) {
    if (!url) {
      if (!stacEndpoint.value) {
        throw new Error("STAC endpoint is not defined in eodash configuration");
      }
      url = stacEndpoint.value;
    }

    if (!url) {
      stac.value = null;
      return;
    }
    if (isApi.value) {
      url = url + "/collections?limit=1000"; // to get all collections
    }
    const property = isApi.value ? "collections" : "links";

    log.debug("Loading STAC endpoint", url);
    await axios.get(url).then((resp) => {
      //@ts-expect-error TODO
      const links = resp.data[property].map((link) => {
        if (!link.title) {
          link.title = `${link.rel} ${link.href}`;
        }
        return link;
      });
      log.debug("Setting selected STAC", links);
      stac.value = links;
    });
  }

  /**
   * Fetches the selected STAC object and assigns it to `selectedStac`.
   *
   * @param {string} [relativePath=""] - STAC link href
   * @param {boolean} [isPoi=false] - If true, the STAC is loaded for a point of interest
   * @param {import("@eodash/stac").STACItem} [stacItem] - The STAC item to load
   * @returns {Promise<void>}
   * @see {@link selectedStac}
   */
  async function loadSelectedSTAC(relativePath = "", isPoi = false, stacItem) {
    if (!stacEndpoint.value) {
      return Promise.reject(new Error("STAC endpoint is not defined"));
    }
    const absoluteUrl = useAbsoluteUrl(relativePath, stacEndpoint.value);
    if (isPoi) {
      // construct absolute URL of a poi
      absoluteUrl.value = constructPoiUrl(relativePath, indicator.value);
    }

    await axios.get(absoluteUrl.value).then(async (resp) => {
      // set the view projection
      await setMapProjFromCol(resp.data);
      await updateEodashCollections(
        eodashCollections,
        resp.data,
        absoluteUrl.value,
        collectionsPalette,
        isApi.value,
        {
          rasterEndpoint: rasterEndpoint.value ?? undefined,
          upscalingEndpoints: supportedUpscalingEndpoints.value,
          tileMatrixSets: tileMatrixSetRegistry.value,
          renders: configRenders,
          viewProjection:
            getProjectionCode(getProjection(resp.data)) || "EPSG:3857",
        },
      );
      selectedItem.value = /** @type {any} */ (stacItem) ?? undefined;
      selectedStac.value = resp.data;
      // set indicator and poi
      indicator.value = isPoi
        ? indicator.value
        : useGetSubCodeId(selectedStac.value);
      poi.value = isPoi ? (selectedStac.value?.id ?? "") : "";

      // no time of its own means the collection's most recent data. Selecting
      // an indicator clears `datetime` so that it lands here.
      if (!datetime.value) {
        datetime.value = getLatestDatetime(resp.data).toISOString();
      }

      await updateIndicatorLayers(mapEl.value, {
        readers: eodashCollections,
        stac: resp.data,
        timeOrItem: /** @type {any} */ (stacItem) ?? datetime.value,
        event: "layers:updated",
      });
    });
  }
  /**
   * Fetches the selected STAC object and assigns it to `selectedCompareStac`.
   *
   * @param {string} [relativePath=""] - STAC link href
   * @param {boolean} [isPOI=false] - If true, the STAC is loaded for a point of interest
   * @param {import("@eodash/stac").STACItem} [stacItem] - The STAC item to load
   * @returns {Promise<void>}
   * @see {@link selectedCompareStac}
   */
  async function loadSelectedCompareSTAC(
    relativePath = "",
    isPOI = false,
    stacItem,
  ) {
    if (!stacEndpoint.value) {
      return Promise.reject(
        new Error("STAC endpoint is not defined in eodash configuration"),
      );
    }
    const absoluteUrl = useCompareAbsoluteUrl(relativePath, stacEndpoint.value);
    if (isPOI) {
      // construct absolute URL of a poi
      absoluteUrl.value = constructPoiUrl(relativePath, compareIndicator.value);
    }
    await axios.get(absoluteUrl.value).then(async (resp) => {
      await updateEodashCollections(
        eodashCompareCollections,
        resp.data,
        absoluteUrl.value,
        [...collectionsPalette].reverse(),
        isApi.value,
        {
          rasterEndpoint: rasterEndpoint.value ?? undefined,
          upscalingEndpoints: supportedUpscalingEndpoints.value,
          tileMatrixSets: tileMatrixSetRegistry.value,
          renders: configRenders,
          // the main map's view defines the compare map's projection too
          viewProjection: availableMapProjection.value || "EPSG:3857",
        },
      );
      selectedCompareItem.value = /** @type {any} */ (stacItem) ?? undefined;
      selectedCompareStac.value = resp.data;
      compareIndicator.value = isPOI
        ? compareIndicator.value
        : useGetSubCodeId(selectedCompareStac.value);
      comparePoi.value = isPOI ? (selectedCompareStac.value?.id ?? "") : "";

      if (!datetime.value) {
        datetime.value = getLatestDatetime(resp.data).toISOString();
      }

      await updateIndicatorLayers(mapCompareEl.value, {
        readers: eodashCompareCollections,
        stac: resp.data,
        timeOrItem: /** @type {any} */ (stacItem) ?? datetime.value,
        event: "compareLayers:updated",
      });
    });
  }

  /**
   * Reset selected compare stac object
   *
   */
  async function resetSelectedCompareSTAC() {
    eodashCompareCollections.splice(0, eodashCompareCollections.length);
    selectedCompareStac.value = null;
  }

  /**
   * Construct absolute URL of a point of interest (POI)
   *
   * @param {string} relativePath - The relative path to the POI
   * @param {string} indicatorStr - selected indicator id or subcode
   */
  function constructPoiUrl(relativePath, indicatorStr) {
    if (!stacEndpoint.value) {
      throw new Error("STAC endpoint is not defined in eodash configuration");
    }
    // construct absolute URL of a poi
    const indicatorUrl =
      stac.value?.find((link) => useGetSubCodeId(link) === indicatorStr)
        ?.href ?? "";
    const absoluteIndicatorUrl = toAbsolute(indicatorUrl, stacEndpoint.value);
    return toAbsolute(relativePath, absoluteIndicatorUrl);
  }

  return {
    stacEndpoint,
    rasterEndpoint,
    configRenders,
    isApi,
    stac,
    init,
    loadSTAC,
    loadSelectedSTAC,
    loadSelectedCompareSTAC,
    resetSelectedCompareSTAC,
    selectedStac,
    selectedCompareStac,
    selectedItem,
    selectedCompareItem,
    supportedUpscalingEndpoints,
    colormapRegistry,
    loadColormapRegistry,
    tileMatrixSetRegistry,
    loadTileMatrixSetRegistry,
  };
});
