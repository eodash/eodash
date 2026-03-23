<template>
  <div ref="container">
    <div class="chart-frame">
      <button
        v-if="usedChartData && usedChartSpec"
        class="chart-toggle"
        @click="toggleLayout"
        v-tooltip="areChartsSeparateLayout ? 'Minimize' : 'Maximize'"
      >
        <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
          <path :d="toggleIcon" />
        </svg>
      </button>
      <eox-chart
        class="pa-2"
        v-if="usedChartData && usedChartSpec"
        .spec="toRaw(usedChartSpec)"
        :key="chartRenderKey"
        .dataValues="toRaw(usedChartData)"
        @click:item="handleChartItemClick"
        :style="chartStyles"
        .opt="vegaEmbedOptions"
      />
    </div>
  </div>
</template>
<script setup>
import "@eox/chart";
import {
  computed,
  toRaw,
  useTemplateRef,
  ref,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { onChartClick } from "./EodashProcess/methods/handling";
import {
  chartData,
  compareChartData,
  chartSpec,
  compareChartSpec,
  areChartsSeparateLayout,
  activeProcessDatetime,
} from "@/store/states";
import { getOverlayParent } from "@/utils";
import { mdiArrowCollapse, mdiArrowExpand } from "@mdi/js";

const { enableCompare, vegaEmbedOptions } = defineProps({
  enableCompare: {
    type: Boolean,
    default: false,
  },
  vegaEmbedOptions: {
    type: Object,
    default() {
      return { actions: true };
    },
  },
});

const usedChartData = computed(() => {
  return enableCompare ? compareChartData.value : chartData.value;
});

const usedChartSpec = computed(() => {
  const baseSpec = enableCompare ? compareChartSpec.value : chartSpec.value;
  if (!baseSpec || !activeProcessDatetime.value) return baseSpec;

  // Clone to avoid mutating the store (structuredClone fails on Vue proxies)
  const spec = JSON.parse(JSON.stringify(toRaw(baseSpec)));
  const activeDt = activeProcessDatetime.value;

  // Custom _highlight flag to identify this layer for replacement on updates.
  // Vega-Lite ignores unknown top-level layer properties.
  const highlightLayer = {
    _highlight: true,
    mark: {
      type: "rule",
      color: "red",
      strokeDash: [4, 4],
      strokeWidth: 2,
    },
    data: { values: [{ _hl: activeDt }] },
    encoding: { x: { field: "_hl", type: "temporal" } },
  };

  // If spec is already layered, append/replace the highlight layer
  if (Array.isArray(spec.layer)) {
    const nonHighlight = spec.layer.filter((/** @type {any} */ l) => l._highlight !== true);
    return { ...spec, layer: [...nonHighlight, highlightLayer] };
  }

  // Convert single-view to layered: encoding stays in FIRST layer
  // (not at top level) to avoid Vega-Lite inheriting y-encoding
  // into the rule layer which would silently suppress the rule mark.
  const { mark, encoding, transform, selection, params, ...restSpec } = spec;
  return {
    ...restSpec,
    layer: [
      {
        mark,
        encoding,
        ...(transform && { transform }),
        ...(selection && { selection }),
        ...(params && { params }),
      },
      highlightLayer,
    ],
  };
});

const chartRenderKey = ref(0);
const frameHeight = ref(225);
const containerEl = useTemplateRef("container");

/**
@type { MutationObserver | null}
*/
let observer = null;

onMounted(() => {
  const el = containerEl.value;
  if (!el) return;

  const parent = el.parentElement?.parentElement;
  if (parent) {
    const parentHeight = parent.getBoundingClientRect().height;
    frameHeight.value = Math.max(225, Math.floor(parentHeight));
  }

  // for mobile view, the overlay panel containing chart is initially hidden
  // we create an observer when display of overlay is not none anymore
  const overlay = getOverlayParent(el);
  if (!overlay) return;

  observer = new MutationObserver(async () => {
    const style = getComputedStyle(overlay);
    const visible = style.display !== "none";
    if (visible) {
      // forcibly rerender chart, otherwise size of canvas is 0
      chartRenderKey.value = Math.random();
    }
  });

  observer.observe(overlay, {
    attributes: true,
    attributeFilter: ["style", "class"],
  });
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

const chartStyles = computed(() => {
  const styles = {
    height: `${frameHeight.value}px`,
  };
  return styles;
});

const toggleIcon = computed(() =>
  areChartsSeparateLayout.value ? mdiArrowCollapse : mdiArrowExpand,
);

function toggleLayout() {
  areChartsSeparateLayout.value = !areChartsSeparateLayout.value;
}

/** @param {CustomEvent} evt */
function handleChartItemClick(evt) {
  onChartClick(/** @type {any} */ (evt), enableCompare);
}
</script>
<style scoped>
.chart-frame {
  position: relative;
}

.chart-toggle {
  position: absolute;
  top: 18px;
  right: 46px;
  z-index: 2;
  cursor: pointer;
}
</style>
