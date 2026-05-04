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
    // tmp: we remove the vector layers from the globe until
    // we have better support for them
    const layers = addCorsAnonym([...getLayers()]);
    layers.forEach((layer, idx) => {
      if (layer.type === "Vector") {
        layers.splice(idx, 1);
        return;
      }
      if (layer.type === "Group") {
        const vectors = layer.layers.filter((l) => l.type === "Vector");
        if (!vectors.length) {
          return;
        }

        vectors.forEach((vectorLayer) => {
          layer.layers.splice(layer.layers.indexOf(vectorLayer), 1);
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

function getRoot() {
  const eodashComponent = document.querySelector("eo-dash");
  return eodashComponent ? eodashComponent.shadowRoot : document;
}

function hideAllPanels() {
  const root = getRoot();
  const allPanels = root?.querySelectorAll(
    "eox-layout-item:not([class='bg-panel'])",
  );

  allPanels?.forEach((panel) => {
    if (!panel || !(panel instanceof HTMLElement)) {
      return;
    }
    panel.style.display = "none";
  });

  const mapButtons = root?.querySelector(".map-buttons");
  if (mapButtons instanceof HTMLElement) {
    mapButtons.style.padding = "1rem";
  }
}

function showAllPanels() {
  const root = getRoot();
  const allPanels = root?.querySelectorAll(
    "eox-layout-item:not([class='bg-panel'])",
  );
  allPanels?.forEach((panel) => {
    if (!panel || !(panel instanceof HTMLElement)) {
      return;
    }
    panel.style.display = "";
  });

  const mapButtons = root?.querySelector(".map-buttons");
  if (mapButtons instanceof HTMLElement) {
    mapButtons.style.padding = "";
  }
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
