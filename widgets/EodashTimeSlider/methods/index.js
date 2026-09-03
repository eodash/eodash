import {
  ANALYSIS_GROUP,
  BASE_LAYERS_GROUP,
  OVERLAY_GROUP,
  buildIndicatorLayers,
} from "@/eodashSTAC/layers";
import { eodashCollections } from "@/store/stac";
import { mapEl } from "@/store/states";
import { defaultBaseLayers } from "@/utils/states";
import {
  LAYER_ID_SEPARATOR,
  removeLayers,
  sanitizeBbox,
} from "@eodash/stac/helpers";
import { getLayers } from "@/store/actions";
import { buildCqlFilter } from "@/eodashSTAC/cql";

/**
 * One frame per rendered moment, for the timelapse export. An api catalog
 * searches for the items to render, a static one is handed them by the
 * timeline; everything after that is the same, so the two share one build.
 *
 * @param {[string, string]} selectedRange
 * @param {import("../types").TimelineExportEventDetail["selectedRangeItems"]} selectedRangeItems
 * @param {import("vue").Ref<import("@eodash/stac").STACCollection|null>} selectedStac
 * @param {import("@/types").ItemFilterFilters} filters
 */
export async function createAnimationLayers(
  selectedRange,
  selectedRangeItems,
  selectedStac,
  filters,
) {
  const stac = selectedStac.value;
  if (!stac) {
    return [];
  }

  const reader = eodashCollections[0];
  /** @type {Array<string | import("@eodash/stac").STACItem>} */
  const frames =
    reader.kind === "api"
      ? await searchItems(reader, selectedRange, filters)
      : Object.values(selectedRangeItems)
          .flat()
          .map((dateItem) => dateItem.originalDate);

  // a layer hidden on the live map is left out of the export too
  const { collections: hiddenCollections, layers: hiddenLayers } =
    getHiddenLayers([...getLayers()]);
  const readers = eodashCollections.filter(
    (collection) => !hiddenCollections.includes(collection.stac?.id ?? ""),
  );

  // the passes below write in place, and the fallback is shared app state
  const baseLayers = structuredClone(defaultBaseLayers.value);

  return await Promise.all(
    frames.map(async (timeOrItem) => {
      const { layers } = await buildIndicatorLayers(mapEl.value, {
        readers,
        stac,
        timeOrItem,
        // frames are thrown away, so they must not become the readers' item
        context: { stateful: false },
        defaultBaseLayers: baseLayers,
      });
      // the export renders base, data and overlay groups only
      const frameLayers = layers.filter((layer) =>
        [BASE_LAYERS_GROUP, ANALYSIS_GROUP, OVERLAY_GROUP].includes(
          layer.properties?.id ?? "",
        ),
      );
      return {
        layers: anonimizeLayersCORS(
          restoreLayersVisibility(removeLayers(frameLayers, hiddenLayers)),
        ),
        date:
          typeof timeOrItem === "string"
            ? timeOrItem
            : /** @type {string} */ (timeOrItem.properties.datetime),
      };
    }),
  );
}
/**
 * The items an api catalog has in the selected range and the current view. The
 * reader owns the search endpoint and its own collection, so neither is passed.
 *
 * @param {Extract<import("@eodash/stac").Reader, {kind: "api"}>} reader
 * @param {[string, string]} selectedRange
 * @param {import("@/types").ItemFilterFilters} filters
 * @returns {Promise<import("@eodash/stac").STACItem[]>}
 */
async function searchItems(reader, selectedRange, filters) {
  const bbox = mapEl.value?.lonLatExtent;
  if (!bbox) {
    return [];
  }

  const [min, max] = selectedRange;
  const filter = buildCqlFilter(filters);
  const { features } = await reader
    .search({
      limit: 100,
      datetime: `${new Date(min).toISOString()}/${new Date(max).toISOString()}`,
      bbox: sanitizeBbox(bbox).join(","),
      ...(filter && { filter }),
    })
    .catch((err) => {
      console.error("[eodash] Error fetching items for animation:", err);
      return { features: [] };
    });

  if (!features?.length) {
    console.warn("[eodash] No items found for animation.");
  }
  return features ?? [];
}
/**
 * Sets anonymous crossOrigin on layer sources for export.
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
 * Resolves collection and layer IDs that are currently hidden on the map.
 *
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
        if (refId.includes(LAYER_ID_SEPARATOR)) {
          // Check if this looks like a typical eodash collection ID with separator
          const parts = refId.split(LAYER_ID_SEPARATOR);
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
 * Recursively resets layer visibility to true across the layer hierarchy.
 *
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
