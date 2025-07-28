import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "@/plugins/axios";
import {
  useAbsoluteUrl,
  useCompareAbsoluteUrl,
  useGetSubCodeId,
} from "@/composables/index";
import { compareIndicator, comparePoi, indicator, poi } from "@/store/states";
import {
  eodashCollections,
  eodashCompareCollections,
  collectionsPalette,
} from "@/utils/states";
import log from "loglevel";
import { toAbsolute } from "stac-js/src/http.js";
import { updateEodashCollections } from "@/utils";

export const useSTAcStore = defineStore("stac", () => {
  /**
   * STAC catalog endpoint URL
   * @type {import("vue").Ref<string| null>}
   */
  const stacEndpoint = ref(null);
  const isApi = ref(false);

  /**
   * Links of the root STAC catalog
   *
   * @type {import("vue").Ref<import("stac-ts").StacLink[] | null>}
   */
  const stac = ref(null);

  /**
   * Selected STAC object.
   *
   * @type {import("vue").Ref<
   *   | import("stac-ts").StacCollection
   *   | null
   * >}
   */
  const selectedStac = ref(null);

  /**
   * Selected STAC object.
   *
   * @type {import("vue").Ref<
   *   | import("stac-ts").StacCollection
   *   | null
   * >}
   */
  const selectedCompareStac = ref(null);

  /**
   * Initializes the store by assigning the STAC endpoint.
   * @param {import("@/types").StacEndpoint} endpoint
   */
  function init(endpoint) {
    if (typeof endpoint === "string") {
      stacEndpoint.value = endpoint;
      return;
    }
    stacEndpoint.value = endpoint.endpoint;
    isApi.value = endpoint.api ?? false;
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
      url = url + "/collections";
    }
    const property = isApi.value ? "collections" : "links";

    log.debug("Loading STAC endpoint", url);
    await axios
      .get(url)
      .then((resp) => {
        console.log("STAC response", url, resp.data);

        //@ts-expect-error TODO
        const links = resp.data[property].map((link) => {
          if (!link.title) {
            link.title = `${link.rel} ${link.href}`;
          }
          return link;
        });
        log.debug("Setting selected STAC", links);
        stac.value = links;
      })
      .catch((err) => {
        throw new Error("error loading assigned STAC endpoint", err);
      });
  }

  /**
   * Fetches selected stac object and assign it to `selectedStac`
   *
   * @param {string} relativePath - Stac link href
   * @param {boolean} [isPoi=false] - If true, the STAC is loaded for a point of interest
   * @returns {Promise<void>}
   * @see {@link selectedStac}
   */
  async function loadSelectedSTAC(relativePath = "", isPoi = false) {
    if (!stacEndpoint.value) {
      return Promise.reject(new Error("STAC endpoint is not defined"));
    }
    const absoluteUrl = useAbsoluteUrl(relativePath, stacEndpoint.value);
    if (isPoi) {
      // construct absolute URL of a poi
      absoluteUrl.value = constructPoiUrl(relativePath, indicator.value);
    }
    console.log("Loading selected STAC", absoluteUrl.value, isPoi);

    await axios
      .get(absoluteUrl.value)
      .then(async (resp) => {
        await updateEodashCollections(
          eodashCollections,
          resp.data,
          absoluteUrl.value,
          collectionsPalette,
          isApi.value
        );
        selectedStac.value = resp.data;
        // set indicator and poi
        indicator.value = isPoi
          ? indicator.value
          : useGetSubCodeId(selectedStac.value);
        poi.value = isPoi ? (selectedStac.value?.id ?? "") : "";
      })
      .catch((err) => {
        throw new Error("error loading the selected STAC", err);
      });
  }
  /**
   * Fetches selected stac object and assign it to `selectedCompareStac`
   *
   * @param {string} relativePath - Stac link href
   * @returns {Promise<void>}
   * @see {@link selectedCompareStac}
   */
  async function loadSelectedCompareSTAC(relativePath = "", isPOI = false) {
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
    await axios
      .get(absoluteUrl.value)
      .then(async (resp) => {
        await updateEodashCollections(
          eodashCompareCollections,
          resp.data,
          absoluteUrl.value,
          [...collectionsPalette].reverse(),
          isApi.value,
        );
        selectedCompareStac.value = resp.data;
        compareIndicator.value = isPOI
          ? compareIndicator.value
          : useGetSubCodeId(selectedCompareStac.value);
        comparePoi.value = isPOI ? (selectedCompareStac.value?.id ?? "") : "";
      })
      .catch((err) => {
        throw new Error("error loading the selected comparison STAC", err);
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
    isApi,
    stac,
    init,
    loadSTAC,
    loadSelectedSTAC,
    loadSelectedCompareSTAC,
    resetSelectedCompareSTAC,
    selectedStac,
    selectedCompareStac,
  };
});
