import { useOnLayersUpdate } from "@/composables";
import { mapEl } from "@/store/states";
import { onMounted, onUnmounted, watch } from "vue";

/**
 *
 * @param {import("@/types").GeoJsonFeature[]} features
 */
export function renderItemsFeatures(features) {
  let analysisLayers =
    /** @type {import("@eox/map/src/layers").EOxLayerTypeGroup} */ (
      mapEl.value?.layers?.find((l) => l.properties?.id === "AnalysisGroup")
    );
  if (!mapEl.value || !features) {
    return;
  }
  if (!analysisLayers) {
    analysisLayers = {
      type: "Group",
      properties: {
        id: "AnalysisGroup",
        title: "Data Layers",
      },
      layers: [],
    };
    mapEl.value.layers = [analysisLayers, ...mapEl.value.layers.reverse()];
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
export const useSearchOnMapMove = (itemFilter, bboxFilter) => {
  if (!bboxFilter) {
    return;
  }
  /** @type {NodeJS.Timeout} */
  let timeout;
  const handler = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      //@ts-expect-error  todo
      itemFilter.value?.search();
    }, 800); // 800ms debounce
  };
  onMounted(() => {
    mapEl.value?.map.on("moveend", handler);
  });
  onUnmounted(() => {
    mapEl.value?.map.un("moveend", handler);
  });
};
/**
 *
 * @param {import("vue").Ref<import("@/types").GeoJsonFeature[]>} currentItems
 */
export const useRenderItemsFeatures = (currentItems) => {
  const renderOnUpdate = () =>
    useOnLayersUpdate(() => {
      console.log("[eodash] map layers updated, re-rendering items...");
      // consider cases where this is not needed
      renderItemsFeatures(currentItems.value);
    });
  onMounted(() => {
    if (!mapEl.value) {
      console.log("[eodash] waiting for map to be ready...");

      watch(
        mapEl,
        () => {
          console.log("[eodash] map is ready, rendering items...");
          renderItemsFeatures(currentItems.value);
          renderOnUpdate();
        },
        { once: true, immediate: false },
      );

      return;
    }
    console.log("[eodash] map was found, rendering items...");

    renderItemsFeatures(currentItems.value);
    renderOnUpdate();
  });
};
