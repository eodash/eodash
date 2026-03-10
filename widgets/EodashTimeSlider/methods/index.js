import { createLayersConfig } from "^/EodashMap/methods/create-layers-config";
import { eodashCollections } from "@/utils/states";
import axios from "@/plugins/axios";
import { mapEl } from "@/store/states";
import { sanitizeBbox } from "@/eodashSTAC/helpers";

/**
 * @param {string} stacEndpoint
 * @param {[string, string]} selectedRange
 * @param {import("../types").TimelineExportEventDetail["selectedRangeItems"]} selectedRangeItems
 * @param {import("vue").Ref<import("stac-ts").StacCollection|null>} selectedStac
 */
export async function createAnimationsLayers(
  stacEndpoint,
  selectedRange,
  selectedRangeItems,
  selectedStac,
) {
  if (eodashCollections[0].isAPI) {
    return await createAPILayers(
      stacEndpoint,
      { min: selectedRange[0], max: selectedRange[1] },
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
 * @return {Promise<Array<{ layers: Record<string, any>[]; date: string }>>}
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
  url.searchParams.set(
    "datetime",
    `${new Date(date.min).toISOString()}/${new Date(date.max).toISOString()}`,
  );
  url.searchParams.set("bbox", sanitizeBbox(bbox).join(","));
  /** @type {import("stac-ts").StacItem[]} */
  const items = await axios
    .get(url.href)
    .then((res) => res.data.features)
    .catch((err) => {
      console.error("[eodash] Error fetching items for animation:", err);
      return [];
    });
  if (!items || !items.length) {
    console.warn("[eodash] No items found for animation.");
    return [];
  }

  return await Promise.all(
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
      return mapLayersArr;
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
