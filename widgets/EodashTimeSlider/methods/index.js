import { createLayersConfig } from "^/EodashMap/methods/create-layers-config";
import { eodashCollections } from "@/utils/states";
import axios from "@/plugins/axios";
import { datetime, mapEl } from "@/store/states";

/**
 * @param {string} stacEndpoint
 * @param {Record<string, { date: string; id: string; originalDate: string ; [key:string]: any}[]>} selectedRangeItems
 * @param {import("vue").Ref<import("stac-ts").StacCollection|null>} selectedStac
 */
export async function createAnimationsLayers(
  stacEndpoint,
  selectedRangeItems,
  selectedStac,
) {
  if (eodashCollections[0].isAPI) {
    return await createAPILayers(
      stacEndpoint,
      { min: datetime.value, max: datetime.value },
      mapEl.value?.lonLatExtent,
      selectedStac,
    );
  }
  return await Promise.all(
    Object.values(selectedRangeItems).flatMap(async (itemSet) => {
      /** @type {Array<{ layers: Record<string, any>[]; date: string }>} */
      const mapLayersArr = [];
      for (const dateItem of itemSet) {
        await createLayersConfig(
          selectedStac.value,
          eodashCollections,
          dateItem.originalDate,
        ).then((layers) => {
          layers = anonimizeLayersCORS(layers);
          mapLayersArr.push({
            layers,
            date: dateItem.originalDate,
          });
        });
      }
      return mapLayersArr;
    }),
  ).then((results) => results.flat());
}
/**
 *
 * @param {string} stacEndpoint
 * @param {{min: string, max: string}} date
 * @param {number[] | undefined} bbox
 * @param {import("vue").Ref<import("stac-ts").StacCollection|null>} selectedStac
 */
async function createAPILayers(
  stacEndpoint,
  date = { min: "", max: "" },
  bbox,
  selectedStac,
) {
  if (!bbox) {
    return [];
  }
  const url = new URL(stacEndpoint + "/search");
  url.searchParams.set("datetime", `${date.min}/${date.max}`);
  url.searchParams.set("bbox", bbox.join(","));
  /** @type {import("stac-ts").StacItem[]} */
  const items = await axios.get(url.href).then((res) => res.data.features);
  await Promise.all(
    items.map(async (item) => {
      /** @type {Array<{ layers: Record<string, any>[]; date: string }>} */
      const mapLayersArr = [];
      await createLayersConfig(
        selectedStac.value,
        eodashCollections,
        item,
      ).then((layers) => {
        layers = anonimizeLayersCORS(layers);
        mapLayersArr.push({
          layers,
          date: /** @type {string} */ (item.properties.datetime),
        });
        return mapLayersArr;
      });
    }),
  ).then((results) => results.flat());
}
/**
 *
 * @param {Record<string, any>[]} layers
 * @returns {Record<string, any>[]}
 */
export function anonimizeLayersCORS(layers) {
  return layers.map((layer) => {
    if (layer.type === "Group") {
      layer.layers = anonimizeLayersCORS(layer.layers);
      return layer;
    }
    if (layer.source) {
      layer.source.crossOrigin = "anonymous";
    }
    return layer;
  });
}
