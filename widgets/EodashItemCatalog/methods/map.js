import { useOnLayersUpdate } from "@/composables";
import { onMounted, onUnmounted } from "vue";
import { createOnSelectHandler } from "./handlers";
import { tooltipAdapter } from "@/store/states";

/**
 *
 * @param {import("@/types").GeoJsonFeature[]} features
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 * @param {string[] | undefined} hoverProperties
 */
export function renderItemsFeatures(features, mapElement, hoverProperties) {
  const currentMap = mapElement.value;
  let analysisLayers =
    /** @type {import("@eox/map/src/layers").EOxLayerTypeGroup} */ (
      currentMap?.layers?.find((l) => l.properties?.id === "AnalysisGroup")
    );
  if (!currentMap || !features) {
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
    currentMap.layers = [...currentMap.layers, analysisLayers];
  }
  /** @type {import("@eox/map/src/layers").EOxLayerType<"Vector","Vector">} */
  const stacItemsLayer = {
    type: "Vector",
    properties: {
      id: "stac-items",
      title: "STAC Items",
    },
    source: {
      type: "Vector",
      //@ts-expect-error todo
      url:
        "data:application/geo+json," +
        encodeURIComponent(
          JSON.stringify({ type: "FeatureCollection", features }),
        ),
      format: "GeoJSON",
      projection: "EPSG:3857",
    },
    style: {
      "fill-color": "transparent",
      "stroke-color": "#003170",
    },
    interactions: [
      {
        type: "select",
        options: {
          id: "stac-item-hover",
          condition: "pointermove",
          tooltip: hoverProperties?.length,
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
          tooltip: false,
          style: {
            "stroke-color": "white",
            "stroke-width": 3,
          },
        },
      },
    ],
  };
  const exists = analysisLayers.layers.some(
    (l) => l.properties?.id === stacItemsLayer.properties?.id,
  );
  if (exists) {
    currentMap.addOrUpdateLayer(stacItemsLayer);
    return;
  } else {
    analysisLayers.layers.unshift(stacItemsLayer);
    currentMap.layers = [...currentMap.layers];
  }
}

/**
 * @param {import("vue").Ref<any>} itemFilter
 * @param {boolean} bboxFilter
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 */
export const useSearchOnMapMove = (itemFilter, bboxFilter, mapElement) => {
  if (!bboxFilter) {
    return;
  }
  /** @type {NodeJS.Timeout} */
  let timeout;
  const handler = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (mapElement.value?.projection == "globe") {
        return;
      }
      itemFilter.value?.search();
    }, 500);
  };
  onMounted(() => {
    mapElement.value?.map.on("moveend", handler);
  });
  onUnmounted(() => {
    mapElement.value?.map.un("moveend", handler);
  });
};
/**
 *
 * @param {import("vue").Ref<import("@/types").GeoJsonFeature[]>} currentItems
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 * @param {string[] | undefined} hoverProperties
 */
export const useRenderItemsFeatures = (
  currentItems,
  mapElement,
  hoverProperties,
) => {
  onMounted(() => {
    renderItemsFeatures(currentItems.value, mapElement, hoverProperties);
  });

  useOnLayersUpdate(() => {
    // consider cases where this is not needed
    renderItemsFeatures(currentItems.value, mapElement, hoverProperties);
  });
};
/**
 * Highlights hovered feature on map and optinally shows tooltip with properties
 * @param {import("vue").Ref<any>} itemfilterEl
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 * @param {string[]} [hoverProperties]
 */
export function useHighlightOnFeatureHover(
  itemfilterEl,
  mapElement,
  hoverProperties,
) {
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
  /**
   * @param {*} val
   */
  const formatValue = (val) => {
    if (typeof val === "number") {
      return val.toFixed(0);
    }

    if (typeof val === "string") {
      // Attempt to parse as date if string looks like ISO date
      if (val.length > 9 && /\d{4}-\d{2}-\d{2}/.test(val)) {
        const timestamp = Date.parse(val);
        if (!isNaN(timestamp)) {
          return new Date(timestamp).toUTCString();
        }
      }
    }
    return val;
  };
  /**
   * @param {string} key
   */
  const formatKey = (key) => {
    let formattedKey = key;
    if (key.includes(":")) {
      formattedKey = key.split(":")[1];
    }
    return formattedKey
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };
  onMounted(() => {
    //@ts-expect-error todo
    mapElement.value?.addEventListener("select", handler);

    tooltipAdapter.value = ({ key, value }) => {
      if (hoverProperties && hoverProperties.includes(key)) {
        return { key: formatKey(key), value: formatValue(value) };
      }
      return undefined;
    };
  });
  onUnmounted(() => {
    //@ts-expect-error todo
    mapElement.value?.removeEventListener("select", handler);
    tooltipAdapter.value = null;
  });
}

/**
 *
 * @param {import("vue").Ref<any>} itemfilterEl
 * @param {ReturnType< typeof import("@/store/stac").useSTAcStore>} store
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 * @param {boolean} enableCompare
 */
export function useRenderOnFeatureClick(
  itemfilterEl,
  store,
  mapElement,
  enableCompare,
) {
  const onSelectItem = createOnSelectHandler(store, enableCompare, mapElement);
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
    mapElement.value?.addEventListener("select", handler);
  });
  onUnmounted(() => {
    //@ts-expect-error todo
    mapElement.value?.removeEventListener("select", handler);
  });
}
