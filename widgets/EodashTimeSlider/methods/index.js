import { createLayersConfig } from "^/EodashMap/methods/create-layers-config";
import { eodashCollections } from "@/utils/states";
import axios from "@/plugins/axios";
import { mapEl } from "@/store/states";
import { removeLayers, sanitizeBbox } from "@/eodashSTAC/helpers";
import { getLayers } from "@/store/actions";
import { buildStacFilters } from "./index";

/**
 * @param {string} stacEndpoint
 * @param {[string, string]} selectedRange
 * @param {import("../types").TimelineExportEventDetail["selectedRangeItems"]} selectedRangeItems
 * @param {import("vue").Ref<import("stac-ts").StacCollection|null>} selectedStac
 * @param {import("@/types").ItemFilterFilters} filters
 */
export async function createAnimationLayers(
  stacEndpoint,
  selectedRange,
  selectedRangeItems,
  selectedStac,
  filters,
) {
  if (eodashCollections[0].isAPI) {
    return await createAPILayers(
      stacEndpoint,
      { min: selectedRange[0], max: selectedRange[1] },
      mapEl.value?.lonLatExtent,
      selectedStac,
      filters,
    );
  }
  const { collections: hiddenCollections, layers: hiddenLayers } =
    getHiddenLayers([...getLayers()]);

  return await Promise.all(
    Object.values(selectedRangeItems).flatMap(async (itemSet) => {
      /** @type {Array<{ layers: Record<string, any>[]; date: string }>} */
      const mapLayersArr = [];
      for (const dateItem of itemSet) {
        await createLayersConfig(
          selectedStac.value,
          eodashCollections.filter(
            (collection) =>
              !hiddenCollections.includes(collection.collectionStac?.id ?? ""),
          ),
          dateItem.originalDate,
        ).then((layers) => {
          //@ts-expect-error createLayersConfig is not typed strictly
          layers = removeLayers(layers, hiddenLayers);
          //@ts-expect-error createLayersConfig is not typed strictly
          layers = restoreLayersVisibility(layers);
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
 * @param {import("@/types").ItemFilterFilters} filters
 * @return {Promise<Array<{ layers: Record<string, any>[]; date: string }>>}
 */
async function createAPILayers(
  stacEndpoint,
  date = { min: "", max: "" },
  bbox,
  selectedStac,
  filters,
) {
  if (!bbox) {
    return [];
  }
  const url = new URL(stacEndpoint + "/search");
  url.searchParams.set("limit", "100");
  url.searchParams.set("collections", selectedStac.value?.id ?? "");
  url.searchParams.set(
    "datetime",
    `${new Date(date.min).toISOString()}/${new Date(date.max).toISOString()}`,
  );
  url.searchParams.set("bbox", sanitizeBbox(bbox).join(","));

  const stacFilter = buildStacFilters(filters);
  if (stacFilter) {
    url.searchParams.set("filter", stacFilter);
  }

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
  const { collections: hiddenCollections, layers: hiddenLayers } =
    getHiddenLayers([...getLayers()]);
  return await Promise.all(
    items.map(async (item) => {
      /** @type {Array<{ layers: Record<string, any>[]; date: string }>} */
      const mapLayersArr = [];
      await createLayersConfig(
        selectedStac.value,
        eodashCollections.filter(
          (collection) =>
            !hiddenCollections.includes(collection.collectionStac?.id ?? ""),
        ),
        item,
      ).then((layers) => {
        //@ts-expect-error createLayersConfig is not typed strictly
        layers = removeLayers(layers, hiddenLayers);
        //@ts-expect-error createLayersConfig is not typed strictly
        layers = restoreLayersVisibility(layers);
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
/**
 * returns the list of layers that has visibility hidden
 * @param {import("@eox/map").EoxLayer[]} layers
 * @returns {{ collections: string[]; layers: string[] }}
 */
export function getHiddenLayers(layers) {
  /** @type {{ collections: string[]; layers: string[] }} */
  const result = { collections: [], layers: [] };

  for (const layer of layers) {
    // check inner layers if it's a group layer first
    if (layer.type === "Group" && Array.isArray(layer.layers)) {
      const childResult = getHiddenLayers(layer.layers);
      for (const col of childResult.collections) {
        if (!result.collections.includes(col)) {
          result.collections.push(col);
        }
      }
      for (const lyr of childResult.layers) {
        if (!result.layers.includes(lyr)) {
          result.layers.push(lyr);
        }
      }
    }

    if (!layer.properties?.id) {
      continue;
    }

    const olLayer = mapEl.value?.getLayerById(layer.properties?.id);
    if (!olLayer) {
      continue;
    }

    if (olLayer.getVisible() === false) {
      const refId = layer.properties.id;
      if (refId) {
        if (refId.includes(";:;")) {
          // Check if this looks like a typical eodash collection ID with separator
          const parts = refId.split(";:;");
          if (parts.length > 2) {
            const prefix = parts[0];
            if (!result.collections.includes(prefix)) {
              result.collections.push(prefix);
            }
          } else {
            // It has a separator but might just be a base layer like `layerId;:;EPSG`
            if (!result.layers.includes(refId)) {
              result.layers.push(refId);
            }
          }
        } else {
          if (!result.layers.includes(refId)) {
            result.layers.push(refId);
          }
        }
      }
    }
  }

  return result;
}

/**
 * Iterates through a list of layers and updates layer.properties.visible to true
 * if it is set to false
 * @param {import("@eox/map").EoxLayer[]} layers
 * @returns {import("@eox/map").EoxLayer[]}
 */
export function restoreLayersVisibility(layers) {
  for (const layer of layers) {
    if (layer.properties && layer.properties.visible === false) {
      layer.properties.visible = true;
    }

    if (layer.type === "Group" && Array.isArray(layer.layers)) {
      restoreLayersVisibility(layer.layers);
    }
  }
  return layers;
}

export { buildCqlFilter as buildStacFilters } from "@/eodashSTAC/cql";
export { scheduleMosaicUpdate } from "@/eodashSTAC/mosaic";
