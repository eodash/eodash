import { defineStore } from 'pinia';
import { inject, ref } from 'vue';
import axios from 'axios';
import { useAbsoluteUrl } from '@/composables/index';
import { eodashKey } from '@/store/Keys';

export const useSTAcStore = defineStore('stac', () => {
  /**
   * links of the root STAC catalog
   * @type {import("vue").Ref<import('stac-ts').StacLink[]|null>}
   */
  const stac = ref(null);

  /**
   * selected STAC object.
   * @type {import('vue').Ref<import('stac-ts').StacCatalog |
   * import('stac-ts').StacCollection |import('stac-ts').StacItem
   * | null>}
   */
  const selectedStac = ref(null);


  const eodash = /** @type {import("@/types").Eodash} */(inject(eodashKey));

  /**
   * fetches root stac catalog and assign it to `stac`
   * @async
   * @param {import("@/types").StacEndpoint} [url = eodash.stacEndpoint]
   * @returns {Promise<void>}
   * @see {@link stac}
   */
  async function loadSTAC(url = eodash.stacEndpoint) {
    await axios.get(url).then(resp => {
      const links = /** @type {import('stac-ts').StacCatalog} */(resp.data).links.map(link => {
        if (!link.title) {
          link.title = `${link.rel} ${link.href}`
        }
        return link
      })
      stac.value = links;
    }).catch(err => console.error(err));
  }

  /**
   * fetches selected stac object and assign it to `selectedStac`
   * @async
   * @param {string} relativePath - stac link href
   * @returns {Promise<void>}
   * @see {@link selectedStac}
   */
  async function loadSelectedSTAC(relativePath = '') {

    const absoluteUrl = useAbsoluteUrl(relativePath);

    await axios.get(absoluteUrl.value).then(resp => {
      selectedStac.value = resp.data;
    }).catch(err => console.error(err));
  }

  return { stac, loadSTAC, loadSelectedSTAC, selectedStac };
});
