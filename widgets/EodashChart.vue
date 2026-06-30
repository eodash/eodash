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
        class="pa-2"
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

  // Continuously enforce the layout structure and the form offset
  styleInterval = window.setInterval(() => {
    if (el) {
      const eoxChart = el.querySelector("eox-chart");
      if (eoxChart && eoxChart.shadowRoot) {
        if (!eoxChart.shadowRoot.querySelector('#eodash-chart-styles')) {
          const style = document.createElement("style");
          style.id = "eodash-chart-styles";
          style.innerHTML = `
            .vega-embed {
              position: relative !important;
              display: flex !important;
              flex-direction: column !important;
              height: 100% !important;
            }
            .vega-bindings {
              position: absolute !important;
              top: 0 !important;
              left: 10px !important;
              display: flex !important;
              flex-wrap: wrap;
              gap: 10px;
              background: rgba(255, 255, 255, 0.85);
              padding: 6px 12px;
              border-radius: 6px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.15);
              z-index: 100 !important;
              max-width: calc(100% - 90px) !important;
            }
            .vega-bindings:empty {
              display: none !important;
            }
            .vega-bind {
              display: flex;
              align-items: center;
              gap: 6px;
            }
          `;
          eoxChart.shadowRoot.appendChild(style);
        }

        // Dynamically pull the form up by its own height and pad the container
        const bindingsEl = eoxChart.shadowRoot.querySelector('.vega-bindings');
        const embedEl = eoxChart.shadowRoot.querySelector('.vega-embed');
        
        if (bindingsEl && bindingsEl.children.length > 0) {
          const height = bindingsEl.getBoundingClientRect().height;
          // Apply a smaller negative margin to pull it up slightly, 
          // and a matching padding to the container to push the chart down.
          const newMargin = `-${height + 5}px`;
          const newPadding = `${height + 5}px`;
          if (bindingsEl.style.marginTop !== newMargin) {
             bindingsEl.style.marginTop = newMargin;
             if (embedEl) embedEl.style.paddingTop = newPadding;
          }
        } else if (bindingsEl) {
          if (bindingsEl.style.marginTop !== '') {
             bindingsEl.style.marginTop = '';
             if (embedEl) embedEl.style.paddingTop = '';
          }
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
  if (styleInterval) window.clearInterval(styleInterval);
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
<style scoped>
.eodash-chart-wrapper {
  height: 100%; /* Force full height in fullscreen layout */
  flex-grow: 1;
  min-height: 0; /* Critical for flex shrinking */
  display: flex;
  flex-direction: column;
}

.chart-frame {
  position: relative;
  flex-grow: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

eox-chart {
  flex-grow: 1;
  min-height: 0;
}

.chart-toggle {
  position: absolute;
  top: -4px;
  right: 46px;
  z-index: 2;
  cursor: pointer;
}
</style>
