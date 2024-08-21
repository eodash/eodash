import { defineStore } from "pinia";
import { inject, ref } from "vue";
import axios from "axios";
import { useAbsoluteUrl, useCompareAbsoluteUrl } from "@/composables/index";
import { eodashKey } from "@/utils/keys";
import { indicator } from "@/store/States";
import { extractCollectionUrls } from "@/utils/helpers";
import { eodashCollections, eodashCompareCollections } from "@/utils/states";
import { EodashCollection } from "@/utils/eodashSTAC";

export const useSTAcStore = defineStore("stac", () => {
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
   *   | import("stac-ts").StacCatalog
   *   | import("stac-ts").StacCollection
   *   | import("stac-ts").StacItem
   *   | null
   * >}
   */
  const selectedStac = ref(null);

  /**
   * Selected STAC object.
   *
   * @type {import("vue").Ref<
   *   | import("stac-ts").StacCatalog
   *   | import("stac-ts").StacCollection
   *   | import("stac-ts").StacItem
   *   | null
   * >}
   */
  const selectedCompareStac = ref(null);

  const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey));

  /**
   * Fetches root stac catalog and assign it to `stac`
   *
   * @async
   * @param {import("@/types").StacEndpoint} [url=eodash.stacEndpoint] Default
   *   is `eodash.stacEndpoint`
   * @returns {Promise<void>}
   * @see {@link stac}
   */
  async function loadSTAC(url = eodash.stacEndpoint) {
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
        stac.value = links;
      })
      .catch((err) => {
        throw new Error("error loading assigned STAC endpoint", err);
      });
  }

  /**
   * Fetches selected stac object and assign it to `selectedStac`
   *
   * @async
   * @param {string} relativePath - Stac link href
   * @returns {Promise<void>}
   * @see {@link selectedStac}
   */
  async function loadSelectedSTAC(relativePath = "") {
    const absoluteUrl = useAbsoluteUrl(relativePath);

    await axios
      .get(absoluteUrl.value)
      .then(async (resp) => {
        // init eodash collections
        const collectionUrls = extractCollectionUrls(
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
          eodashCollections.splice(0, eodashCollections.length);
          // update eodashCollections
          eodashCollections.push(...collections);

          selectedStac.value = resp.data;
          indicator.value = selectedStac.value?.id ?? "";
        });
      })
      .catch((err) => {
        throw new Error("error loading the selected STAC", err);
      });
  }

  /**
   * Fetches selected stac object and assign it to `selectedCompareStac`
   *
   * @async
   * @param {string} relativePath - Stac link href
   * @returns {Promise<void>}
   * @see {@link selectedCompareStac}
   */
  async function loadSelectedCompareSTAC(relativePath = "") {
    const absoluteUrl = useCompareAbsoluteUrl(relativePath);

    await axios
      .get(absoluteUrl.value)
      .then(async (resp) => {
        // init eodash collections
        const collectionUrls = extractCollectionUrls(
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
    loadSTAC,
    loadSelectedSTAC,
    loadSelectedCompareSTAC,
    resetSelectedCompareSTAC,
    selectedStac,
    selectedCompareStac,
  };
});
