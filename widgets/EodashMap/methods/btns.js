import { setActiveTemplate } from "@/store/actions";
import { useSTAcStore } from "@/store/stac";
import {
  activeTemplate,
  availableMapProjection,
  isGlobe,
  mapEl,
} from "@/store/states";
import { easeOut } from "ol/easing.js";
import { storeToRefs } from "pinia";
import { ref } from "vue";

export const switchGlobe = () => {
  if (!mapEl.value) {
    return;
  }
  // exit using the selected collection's projection
  mapEl.value.projection = isGlobe.value
    ? availableMapProjection.value || "EPSG:3857"
    : "globe";
  isGlobe.value = !isGlobe.value;
};

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
  const { selectedCompareStac } = storeToRefs(useSTAcStore());
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
};

export const onGeolocationClick = () => {
  const map = mapEl.value?.map;
  if (!map) return;
  const control = /** @type {any} */ (
    map
      .getControls()
      .getArray()
      .find((c) => !!(/** @type {any} */ (c).centerOnPosition))
  );
  if (control) {
    control.centerOnPosition();
  }
};
