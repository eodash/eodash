import { useOnLayersUpdate } from "@/composables";
import { mapEl } from "@/store/states";
import { onMounted, onUnmounted } from "vue";
import { createOnSelectHandler } from "./handlers";

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
    return;
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
      {
        type: "select",
        options: {
          id: "stac-items",
          condition: "click",
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
    analysisLayers.layers.unshift(stacItemsLayer);
    mapEl.value.layers = [...mapEl.value.layers].reverse();
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
    }, 800);
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
      // consider cases where this is not needed
      /** @type {import("@/types").GeoJsonFeature[]} */
      const features = currentItems.value.map((f) => ({
        geometry: f.geometry,
        properties: {
          id: f.id,
          title: f.properties?.title,
        },
        id: f.id,
        type: "Feature",
      }));
      renderItemsFeatures(features);
    });
  onMounted(() => {
    renderItemsFeatures(currentItems.value);
    renderOnUpdate();
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
    if (evt.detail.originalEvent.type !== "pointermove") {
      return;
    }
    const itemId = evt.detail?.feature?.getId();
    if (!itemId) {
      return;
    }
    const item = itemfilterEl.value.results?.find(
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

/**
 *
 * @param {import("vue").Ref<any>} itemfilterEl
 * @param {import("@/store/stac").STACStore} store
 */
export function useRenderOnFeatureClick(itemfilterEl, store) {
  const onSelectItem = createOnSelectHandler(store);
  /**
   *
   * @param {CustomEvent} evt
   */
  const handler = (evt) => {
    if (evt.detail.originalEvent.type !== "click") {
      return;
    }
    const itemId = evt.detail?.feature?.getId();
    if (!itemId) {
      return;
    }
    const item = itemfilterEl.value.results?.find(
      //@ts-expect-error todo
      (r) => r?.id === itemId,
    );

    if (item) {
      onSelectItem(new CustomEvent("select", { detail: item }));
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
