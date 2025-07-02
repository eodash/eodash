import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "@/plugins/axios";
import {
  useAbsoluteUrl,
  useCompareAbsoluteUrl,
  useGetSubCodeId,
} from "@/composables/index";
import { indicator, poi } from "@/store/states";
import { extractCollectionUrls } from "@/eodashSTAC/helpers";
import {
  eodashCollections,
  eodashCompareCollections,
  collectionsPalette,
  switchToCompare,
} from "@/utils/states";
import { EodashCollection } from "@/eodashSTAC/EodashCollection";
import log from "loglevel";
import { toAbsolute } from "stac-js/src/http.js";

export const useSTAcStore = defineStore("stac", () => {
  /**
   * STAC endpoint URL
   * @type {import("vue").Ref<import("@/types").StacEndpoint | null>}
   */
  const stacEndpoint = ref(null);
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
   * Initializes the STAC endpoint.
   * @param {import("@/types").StacEndpoint} endpoint
   */
  function init(endpoint) {
    stacEndpoint.value = endpoint;
  }

  /**
   * Fetches root stac catalog and assign it to `stac`
   *
   * @param {import("@/types").StacEndpoint} [url=eodash.stacEndpoint] Default
   *   is `eodash.stacEndpoint`
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

    log.debug("Loading STAC endpoint", url);
    await axios
      .get(url)
      .then((resp) => {
        const links = /** @type {import("stac-ts").StacCatalog} */ (
          resp.data
        ).links.map((link) => {
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
      return Promise.reject(
        new Error("STAC endpoint is not defined in eodash configuration"),
      );
    }
    const absoluteUrl = useAbsoluteUrl(relativePath, stacEndpoint.value);
    // construct absolute URL of a poi
    if (isPoi) {
      const indicatorUrl =
        stac.value?.find((link) => useGetSubCodeId(link) === indicator.value)
          ?.href ?? "";
      const absoluteIndicatorUrl = toAbsolute(indicatorUrl, stacEndpoint.value);
      absoluteUrl.value = useAbsoluteUrl(
        relativePath,
        absoluteIndicatorUrl,
      ).value;
    }
    console.log("Loading STAC from", stac.value, absoluteUrl.value);

    await axios
      .get(absoluteUrl.value)
      .then(async (resp) => {
        // init eodash collections
        const collectionUrls = extractCollectionUrls(
          resp.data,
          absoluteUrl.value,
        );

        await Promise.all(
          collectionUrls.map((cu, idx) => {
            const ec = new EodashCollection(cu);
            ec.fetchCollection();
            ec.color = collectionsPalette[idx % collectionsPalette.length];
            return ec;
          }),
        ).then((collections) => {
          // empty array from old collections
          eodashCollections.splice(0, eodashCollections.length);
          // update eodashCollections
          eodashCollections.push(...collections);

          selectedStac.value = resp.data;
          // set indicator and poi
          indicator.value = isPoi
            ? indicator.value
            : useGetSubCodeId(selectedStac.value);
          poi.value = isPoi ? (selectedStac.value?.id ?? "") : "";
          switchToCompare.value = true;
        });
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
  async function loadSelectedCompareSTAC(relativePath = "") {
    if (!stacEndpoint.value) {
      return Promise.reject(
        new Error("STAC endpoint is not defined in eodash configuration"),
      );
    }

    const absoluteUrl = useCompareAbsoluteUrl(relativePath, stacEndpoint.value);
    await axios
      .get(absoluteUrl.value)
      .then(async (resp) => {
        // init eodash collections
        const collectionUrls = await extractCollectionUrls(
          resp.data,
          absoluteUrl.value,
        );

        await Promise.all(
          collectionUrls.map((cu) => {
            const ec = new EodashCollection(cu);
            ec.fetchCollection();
            return ec;
          }),
        ).then((collections) => {
          // empty array from old collections
          eodashCompareCollections.splice(0, eodashCompareCollections.length);
          // update eodashCompareCollections
          eodashCompareCollections.push(...collections);

          selectedCompareStac.value = resp.data;
          switchToCompare.value = false;
        });
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
    selectedCompareStac.value = null;
  }

  return {
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
