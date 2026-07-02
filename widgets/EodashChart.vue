<template>
  <div ref="container" class="eodash-chart-wrapper">
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
        v-if="usedChartData && usedChartSpec"
        .spec="toRaw(usedChartSpec)"
        :key="chartRenderKey"
        .dataValues="toRaw(usedChartData)"
        @click:item="onChartClick"
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
  watch,
  nextTick,
} from "vue";
import { onChartClick } from "./EodashProcess/methods/handling";
import {
  chartData,
  compareChartData,
  chartSpec,
  compareChartSpec,
  areChartsSeparateLayout,
} from "@/store/states";
import { getOverlayParent } from "@/utils";
import { mdiArrowCollapse, mdiArrowExpand } from "@mdi/js";

const { enableCompare, vegaEmbedOptions } = defineProps({
  enableCompare: {
    type: Boolean,
    default: false,
  },
  vegaEmbedOptions: {
    /** @type {import("vue").PropType<import("vega-embed").EmbedOptions>} */
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
  return enableCompare ? compareChartSpec.value : chartSpec.value;
});

const chartRenderKey = ref(0);
const containerEl = useTemplateRef("container");

/** @type {MutationObserver | null} */
let observer = null;
/** @type {number | null} */
let styleInterval = null;

onMounted(() => {
  const el = containerEl.value;
  if (!el) return;

  // Continuously inject basic styling for the bindings form to make it look decent
  styleInterval = window.setInterval(() => {
    if (el) {
      const eoxChart = el.querySelector("eox-chart");
      if (eoxChart && eoxChart.shadowRoot) {
        if (!eoxChart.shadowRoot.querySelector('#eodash-chart-styles')) {
          const style = document.createElement("style");
          style.id = "eodash-chart-styles";
          style.innerHTML = `
            * {
              box-sizing: border-box !important;
            }
            #vis {
              
              min-height: 200px !important;
            }
            :host, .vega-embed {
              display: flex !important;
              flex-direction: column !important;
              height: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .vega-bindings {
              flex: 0 0 auto !important;
              display: flex !important;
              flex-wrap: wrap;
              gap: 2px !important;
              background: rgba(255, 255, 255, 0.85);
              padding: 6px 12px !important;
              border-radius: 6px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.15);
              margin: 0 !important;
              margin-top: -25px !important;
            }
            .vega-bindings:empty {
              display: none !important;
            }
            .vega-embed > canvas, .vega-embed > svg {
              max-height: 100% !important;
              max-width: 100% !important;
              object-fit: contain;
            }
            .vega-bind {
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 0 !important;
            }
          `;
          eoxChart.shadowRoot.appendChild(style);
        }
      }
    }
  }, 200);

  // For mobile view, handle overlay display changes
  const overlay = getOverlayParent(el);
  if (!overlay) return;

  observer = new MutationObserver(async () => {
    const style = getComputedStyle(overlay);
    const visible = style.display !== "none";
    if (visible) {
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
  return {
    height: "100%",
    width: "100%"
  };
});

const toggleIcon = computed(() =>
  areChartsSeparateLayout.value ? mdiArrowCollapse : mdiArrowExpand,
);

function toggleLayout() {
  areChartsSeparateLayout.value = !areChartsSeparateLayout.value;
}
</script>

<style>
/* Force the outer dashboard panel wrapping this component to utilize 100% height in fullscreen mode */
.bg-surface:has(.eodash-chart-wrapper) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

<style scoped>
.eodash-chart-wrapper {
  height: 100%; /* Force full height in fullscreen layout */
  flex-grow: 1;
  min-height: 80px; /* Prevent chart from becoming unusably small */
  display: flex;
  flex-direction: column;
}

.chart-frame {
  position: relative;
  flex-grow: 1;
  min-height: 80px; /* Prevent chart from becoming unusably small */
  display: flex;
  flex-direction: column;
}

eox-chart {
  flex-grow: 1;
  min-height: 0;
}

.chart-toggle {
  position: absolute;
  top: 8px;
  right: 46px;
  z-index: 2;
  cursor: pointer;
}
</style>
