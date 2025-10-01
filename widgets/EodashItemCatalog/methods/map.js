import { mapEl } from "@/store/states";
import { onMounted, onUnmounted } from "vue";

/**
 *
 * @param {import("@/types").GeoJsonFeature[]} features
 */
export function renderItemsFeatures(features) {
  const analysisLayers =
    /** @type {import("@eox/map/src/layers").EOxLayerTypeGroup} */ (
      mapEl.value?.layers?.find((l) => l.properties?.id === "AnalysisGroup")
    );
  if (!mapEl.value || !analysisLayers || !features) {
    return;
  }

  const stacItemsLayer = {
    type: "Group",
    properties: {
      id: "stac-items",
      title: "STAC Items",
    },
    layers: features?.map((feature) => ({
      type: "Vector",
      properties: {
        id: "item-" + feature.id,
        title: feature.id,
      },
      source: {
        type: "Vector",
        url:
          "data:application/geo+json," +
          encodeURIComponent(JSON.stringify(feature)),
        format: "GeoJSON",
      },
      style: {
        "fill-color": "transparent",
        "stroke-color": "#003170",
      },
      interactions: [
        {
          type: "select",
          options: {
            id: feature.id,
            condition: "click",
            style: {
              "stroke-color": "white",
              "stroke-width": 3,
            },
          },
        },
      ],
    })),
  };
  const exists = analysisLayers.layers.some(
    (l) => l.properties?.id === "stac-items",
  );
  if (exists) {
    //@ts-expect-error todo
    mapEl.value.addOrUpdateLayer(stacItemsLayer);
    return;
  } else {
    //@ts-expect-error todo
    analysisLayers.layers.unshift(stacItemsLayer);
    mapEl.value.layers = [...mapEl.value.layers].reverse();
  }
}

/**
 * @param {import("vue").Ref<import("@eox/itemfilter").EOxItemFilter>} itemFilter
 * @param {boolean} bboxFilter
 */
export const useSearchOnMapMove = (itemFilter,bboxFilter) => {
  if(!bboxFilter){
    return;
  }
  const handler = () => {
    //@ts-expect-error  todo
    itemFilter.value?.search();
  };
  onMounted(() => {
    mapEl.value?.map.on("moveend", handler);
  });
  onUnmounted(() => {
    mapEl.value?.map.un("moveend", handler);
  });
};
