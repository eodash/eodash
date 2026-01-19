import { getLayers, setActiveTemplate } from "@/store/actions";
import { useSTAcStore } from "@/store/stac";
import { activeTemplate, isGlobe, mapEl } from "@/store/states";
import { easeOut } from "ol/easing.js";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { triggerRef } from "vue";

export const switchGlobe = () => {
  if (!mapEl.value) {
    return;
  }
  if (!isGlobe.value) {
    // mapEl.value.layers = addCorsAnonym([...getLayers()])
    // tmp hack;
    const layers = addCorsAnonym([...getLayers()]);
    layers.forEach((layer, idx) => {
      if (layer.type === "Vector") {
        layers.splice(idx, 1);
        return;
      }
      if (layer.type === "Group") {
        const vectors = layer.layers.filter((l) => l.type === "Vector");
        //@ts-expect-error todo
        const xyzLayers = layer.layers.filter((l) => l.type === "Tile" && l.source?.type === "XYZ" && l.source?.url?.includes("sentinel-2"));
        if (!vectors.length) {
          return;
        }

        vectors.forEach((vectorLayer) => {
          layer.layers.splice(layer.layers.indexOf(vectorLayer), 1);
        });
        if (!xyzLayers.length) {
          return
        }
        xyzLayers.forEach((xyzLayer) => {
          const params = new URLSearchParams(xyzLayer.source.url.split("?")[1]);
          params.set("color_formula", "gamma rgb 1.3, sigmoidal rgb 8 0.1, saturation 1.2");
          //@ts-expect-error todo
          xyzLayer.source.url = xyzLayer.source.url.split("?")[0] + "?" + params.toString();
        });
      }
    });
    mapEl.value.layers = layers;
  }
  mapEl.value.projection = isGlobe.value ? "EPSG:3857" : "globe";
  if (isGlobe.value) {
    showAllPanels();
  } else hideAllPanels();
  isGlobe.value = !isGlobe.value;
};

function hideAllPanels() {
  const eodashComponent = document.querySelector("eo-dash");
  const allPanels = eodashComponent
    ? eodashComponent.shadowRoot?.querySelectorAll(
        "eox-layout-item:not([class='bg-panel'])",
      )
    : document.querySelectorAll("eox-layout-item:not([class='bg-panel'])");

  allPanels?.forEach((panel) => {
    if (!panel || !(panel instanceof HTMLElement)) {
      return;
    }
    panel.style.display = "none";
  });
}
function showAllPanels() {
  const eodashComponent = document.querySelector("eo-dash");
  const allPanels = eodashComponent
    ? eodashComponent.shadowRoot?.querySelectorAll(
        "eox-layout-item:not([class='bg-panel'])",
      )
    : document.querySelectorAll("eox-layout-item:not([class='bg-panel'])");
  allPanels?.forEach((panel) => {
    if (!panel || !(panel instanceof HTMLElement)) {
      return;
    }
    panel.style.display = "";
  });
}
/**
 *
 * @param {import("@eox/map").EoxLayer[]} layers
 * @return {import("@eox/map").EoxLayer[]}
 */
function addCorsAnonym(layers) {
  //@ts-expect-error todo
  return layers.map((layer) => {
    if (layer.type === "Group") {
      layer.layers = addCorsAnonym([...(layer.layers ?? [])]);
      return layer;
    }
    // check if not mapbox style as a fix for ts error
    if (layer.type === "MapboxStyle") {
      return layer;
    }

    return {
      ...layer,
      ...(layer.source && {
        source: {
          ...layer.source,
          crossOrigin: "anonymous",
        },
        ...(layer.sources && {
          sources: layer.sources.map((source) => ({
            ...source,
            crossOrigin: "anonymous",
          })),
        }),
      }),
    };
  });
}

export const onMapZoomOut = () => {
  const map = mapEl.value?.map;
  const currentZoom = map?.getView().getZoom();
  if (currentZoom !== undefined && currentZoom !== null) {
    const view = map?.getView();

    if (view !== undefined && view.getZoom()) {
      view.animate({
        zoom: currentZoom - 1,
        duration: 250,
        easing: easeOut,
      });
    }
  }
};

export const onMapZoomIn = () => {
  const map = mapEl.value?.map;
  const currentZoom = map?.getView().getZoom();
  if (currentZoom !== undefined && currentZoom !== null) {
    const view = map?.getView();

    if (view !== undefined && view.getZoom()) {
      view.animate({
        zoom: currentZoom + 1,
        duration: 250,
        easing: easeOut,
      });
    }
  }
};

export const showCompareIndicators = ref(false);
/**
 *
 * @param {boolean | {
 * compareTemplate?:string;
 * fallbackTemplate?:string;
 * itemFilterConfig?:Partial<InstanceType<import("./EodashItemFilter.vue").default>["$props"]>
 * }} compareIndicators
 */
export const onSelectCompareIndicator = (compareIndicators) => {
  const compareTemplate =
    (typeof compareIndicators === "object" &&
      compareIndicators.compareTemplate) ||
    "compare";
  setActiveTemplate(compareTemplate);
  showCompareIndicators.value = !showCompareIndicators.value;
};

/**
 *
 * @param {boolean | {
 * compareTemplate?:string;
 * fallbackTemplate?:string;
 * itemFilterConfig?:Partial<InstanceType<import("./EodashItemFilter.vue").default>["$props"]>
 * }} compareIndicators
 */
export const onCompareClick = (compareIndicators) => {
  const { selectedStac, selectedCompareStac } = storeToRefs(useSTAcStore());
  const { resetSelectedCompareSTAC } = useSTAcStore();
  showCompareIndicators.value =
    activeTemplate.value !==
    ((typeof compareIndicators === "object" &&
      compareIndicators.compareTemplate) ||
      "compare");

  const fallbackTemplate =
    (typeof compareIndicators === "object" &&
      compareIndicators.fallbackTemplate) ||
    "expert";
  selectedCompareStac.value = null;
  resetSelectedCompareSTAC();
  setActiveTemplate(fallbackTemplate);
  triggerRef(selectedStac);
};
