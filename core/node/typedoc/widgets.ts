/**
 * Internal widget components, documented as classes with fully-expanded props.
 *
 * Each widget's default export is re-exported as a named const so TypeScript
 * resolves `typeof __VLS_export` back into a direct DefineComponent reference,
 * which typedoc-plugin-vue requires to render a widget as a class with
 * expanded prop members.
 *
 * Prop descriptions and defaults come from the source `.vue` defineProps via
 * the `fix-vue-props-jsdoc.js` plugin — not from hand-written interfaces here.
 * `EodashLayerControl` is the exception: it uses slots, so vue-tsc wraps its
 * type in `__VLS_WithSlots<DefineComponent, Slots>`, which the plugin does not
 * recognise. It is re-exported cast to a plain `DefineComponent` of its own
 * `$props`, so it renders as a class with expanded props like the others.
 *
 * @module Widgets
 */

import type { DefineComponent } from "vue";

// Directory widgets (index.vue)
import _EodashMap from "../../../dist/types/widgets/EodashMap/index.vue";
import _EodashItemCatalog from "../../../dist/types/widgets/EodashItemCatalog/index.vue";
import _EodashProcess from "../../../dist/types/widgets/EodashProcess/index.vue";
import _EodashTimeSlider from "../../../dist/types/widgets/EodashTimeSlider/index.vue";

// File widgets (.vue)
import _EodashItemFilter from "../../../dist/types/widgets/EodashItemFilter.vue";
import _EodashStacInfo from "../../../dist/types/widgets/EodashStacInfo.vue";
import _EodashDatePicker from "../../../dist/types/widgets/EodashDatePicker.vue";
import _EodashLayerControl from "../../../dist/types/widgets/EodashLayerControl.vue";
import _EodashLayoutSwitcher from "../../../dist/types/widgets/EodashLayoutSwitcher.vue";
import _EodashTools from "../../../dist/types/widgets/EodashTools.vue";
import _EodashChart from "../../../dist/types/widgets/EodashChart.vue";
import _WidgetsContainer from "../../../dist/types/widgets/WidgetsContainer.vue";

export const EodashMap = _EodashMap;
export const EodashItemCatalog = _EodashItemCatalog;
export const EodashProcess = _EodashProcess;
export const EodashTimeSlider = _EodashTimeSlider;
export const EodashItemFilter = _EodashItemFilter;
export const EodashStacInfo = _EodashStacInfo;
export const EodashDatePicker = _EodashDatePicker;
export const EodashLayerControl =
  _EodashLayerControl as unknown as DefineComponent<
    InstanceType<typeof _EodashLayerControl>["$props"]
  >;
export const EodashLayoutSwitcher = _EodashLayoutSwitcher;
export const EodashTools = _EodashTools;
export const EodashChart = _EodashChart;
export const WidgetsContainer = _WidgetsContainer;
