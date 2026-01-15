import { useOnLayersUpdate } from "@/composables";
import { mapEl } from "@/store/states";
import { onMounted, onUnmounted } from "vue";

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
    mapEl.value.layers = [...mapEl.value.layers, analysisLayers];
  }

  const stacItemsLayer = {
    type: "Vector",
    properties: {
      id: "stac-items",
      title: "STAC Items",
    },
    source: {
      type: "Vector",
      url:
        "data:application/geo+json," +
        encodeURIComponent(
          JSON.stringify({ type: "FeatureCollection", features }),
        ),
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
          id: "stac-items",
          condition: "pointermove",
          style: {
            "stroke-color": "white",
            "stroke-width": 3,
          },
        },
      },
    ],
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
    analysisLayers.layers.push(stacItemsLayer);
    mapEl.value.layers = [...mapEl.value.layers];
  }
}

/**
 * @param {import("vue").Ref<any>} itemFilter
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
  onMounted(() => {
    renderItemsFeatures(currentItems.value);
  });

  useOnLayersUpdate(() => {
    // consider cases where this is not needed
    renderItemsFeatures(currentItems.value);
  });
};
/**
 *
 * @param {import("vue").Ref<any>} itemfilterEl
 */
export function useHighlightOnFeatureHover(itemfilterEl) {
  /**
   *
   * @param {CustomEvent} evt
   */
  const handler = (evt) => {
    const itemId = evt.detail?.feature?.getId();
    if (!itemId) {
      return;
    }
    const item = itemfilterEl.value.items?.find(
      //@ts-expect-error todo
      (r) => r.id === itemId,
    );
    if (item) {
      itemfilterEl.value.selectedResult = item;
    }
  };
  onMounted(() => {
    //@ts-expect-error todo
    mapEl.value?.addEventListener("select", handler);
  });
  onUnmounted(() => {
    //@ts-expect-error todo
    mapEl.value?.removeEventListener("select", handler);
  });
}
