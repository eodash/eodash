<template>
  <div
    ref="container"
    class="eodash-chart-wrapper"
    :class="{ 
      'fit-x-layout': isFitX, 
      'maximized': areChartsSeparateLayout,
      'fit-x-maximized': isFitX && areChartsSeparateLayout
    }"
  >
    <button
      v-if="usedChartData && usedChartSpec"
      v-tooltip="areChartsSeparateLayout ? 'Minimize' : 'Maximize'"
      class="chart-toggle"
      @click="toggleLayout"
    >
      <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
        <path :d="toggleIcon" />
      </svg>
    </button>
    <div
      class="chart-frame"
      :class="{ 'fit-x-layout': isFitX }"
      :style="{ paddingBottom: hasBindings ? '25px' : '0px' }"
    >
      <eox-chart
        v-if="usedChartData && renderedChartSpec"
        :key="chartRenderKey"
        .spec="toRaw(renderedChartSpec)"
        .dataValues="toRaw(usedChartData)"
        :style="chartStyles"
        :class="{ 'fit-x-layout': isFitX }"
        .opt="vegaEmbedOptions"
        @click:item="onChartClick"
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

/**
 * @param {any} spec
 * @returns {boolean}
 */
function hasImageMark(spec) {
  if (!spec) return false;
  if (spec.mark === "image" || spec.mark?.type === "image") return true;
  if (Array.isArray(spec.layer)) {
    return spec.layer.some(
      (/** @type {any} */ layer) => layer.mark === "image" || layer.mark?.type === "image"
    );
  }
  return false;
}

const isImageChart = computed(() => {
  return hasImageMark(usedChartSpec.value);
});

const isFitX = computed(() => {
  const spec = usedChartSpec.value;
  if (!spec) return false;
  const autosize = /** @type {any} */ (spec.autosize);
  const fitX = spec.autosize === "fit-x" || autosize?.type === "fit-x";
  return fitX && isImageChart.value;
});

const hasBindings = computed(() => {
  const spec = usedChartSpec.value;
  if (!spec) return false;

  // Recursively search for any object with a 'bind' key that represents a physical UI input
  let found = false;
  /** @param {any} obj */
  const searchBindings = (obj) => {
    if (found || !obj || typeof obj !== "object") return;

    // UI bindings that take up physical DOM space are objects with an 'input' property.
    if (
      "bind" in obj &&
      typeof obj.bind === "object" &&
      obj.bind !== null &&
      "input" in obj.bind
    ) {
      found = true;
      return;
    }
    Object.values(obj).forEach(searchBindings);
  };
  searchBindings(spec);
  return found;
});

const renderedChartSpec = ref(null);

/**
 * @param {any} data
 * @param {any} spec
 * @returns {string | null}
 */
function getImageUrl(data, spec) {
  let url = findUrlInArray(data);
  if (url) return url;

  if (spec && spec.data && Array.isArray(spec.data.values)) {
    url = findUrlInArray(spec.data.values);
    if (url) return url;
  }
  return null;
}

/**
 * @param {any} arr
 * @returns {string | null}
 */
function findUrlInArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const firstItem = arr[0];
  if (!firstItem || typeof firstItem !== "object") return null;
  for (const key of Object.keys(firstItem)) {
    const val = firstItem[key];
    if (typeof val === "string" && (val.startsWith("http") || val.startsWith("/"))) {
      return val;
    }
  }
  return null;
}

const aspectRatio = ref(1.414); // Sensible fallback (A4 ratio)
const containerWidth = ref(400); // Default placeholder

watch(
  [usedChartData, usedChartSpec],
  ([newData, newSpec]) => {
    const url = getImageUrl(newData, newSpec);
    if (!url) return;

    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        aspectRatio.value = img.naturalHeight / img.naturalWidth;
      }
    };
    img.src = url;
  },
  { immediate: true },
);

const dynamicFitHeight = computed(() => {
  return Math.round(containerWidth.value * aspectRatio.value);
});

function updateWidth() {
  const el = containerEl.value;
  if (el) {
    const frame = el.querySelector(".chart-frame");
    containerWidth.value = (frame ? frame.clientWidth : el.clientWidth) || 400;
  }
}

watch(
  [usedChartSpec, aspectRatio],
  ([newSpec]) => {
    if (!newSpec) {
      renderedChartSpec.value = null;
      return;
    }

    // Create a deep copy so we can safely mutate it
    const adjustedSpec = JSON.parse(JSON.stringify(newSpec));

    // Force the chart to be fully responsive to its CSS container width
    adjustedSpec.width = "container";

    // Set height dynamically based on container width and aspect ratio if fit-x,
    // otherwise use "container" or custom numeric height.
    const specAny = /** @type {any} */ (newSpec);
    if (isFitX.value) {
      adjustedSpec.height = dynamicFitHeight.value;
    } else if (typeof specAny.height === "number") {
      adjustedSpec.height = specAny.height;
    } else {
      adjustedSpec.height = "container";
    }

    // Delay passing the spec to eox-chart until the next DOM update cycle.
    // This ensures the dynamic chartStyles are physically applied
    // to the container BEFORE Vega calculates its canvas size.
    nextTick(() => {
      renderedChartSpec.value = adjustedSpec;
      chartRenderKey.value = Math.random(); // Force eox-chart to completely remount

      // Force a browser-level resize event after the chart mounts.
      // This tells Vega to re-read the container dimensions once the CSS has finished painting.
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 150);
    });
  },
  { immediate: true },
);

const chartRenderKey = ref(0);
const containerEl = useTemplateRef("container");

/** @type {MutationObserver | null} */
let observer = null;
/** @type {number | null} */
let styleInterval = null;

onMounted(() => {
  const el = containerEl.value;
  if (!el) return;

  updateWidth();
  window.addEventListener("resize", updateWidth);

  // Continuously inject basic styling for the bindings form to make it look decent
  styleInterval = window.setInterval(() => {
    if (el) {
      const eoxChart = el.querySelector("eox-chart");
      if (eoxChart && eoxChart.shadowRoot) {
        if (!eoxChart.shadowRoot.querySelector("#eodash-chart-styles")) {
          const style = document.createElement("style");
          style.id = "eodash-chart-styles";
          style.innerHTML = `
            * {
              box-sizing: border-box !important;
            }
            #vis {
              min-height: 100px !important;
              flex: 1 1 auto !important;
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
              margin-top: -10px !important;
              z-index: 10;
            }
            .vega-bindings:empty {
              display: none !important;
            }
            .vega-embed > canvas, .vega-embed > svg {
              height: 100% !important;
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
  window.removeEventListener("resize", updateWidth);
  observer?.disconnect();
  if (styleInterval) window.clearInterval(styleInterval);
});

const chartStyles = computed(() => {
  if (isFitX.value) {
    return {
      "--fit-height": `${dynamicFitHeight.value}px`,
      height: `${dynamicFitHeight.value}px`,
      width: "100%",
    };
  }
  return {
    height: "100%",
    width: "100%",
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
  position: relative; /* Base for absolute toggle positioning */
  height: 100%; /* Force full height in fullscreen layout */
  flex-grow: 1;
  min-height: 180px; /* Prevent chart from becoming unusably small */
  display: flex;
  flex-direction: column;
}
.eodash-chart-wrapper.fit-x-layout {
  height: auto !important;
}
.eodash-chart-wrapper.fit-x-maximized {
  padding: 16px 10%; /* Elegant breathing room on the sides */
  align-items: center; /* Center the document */
  background: rgba(0, 0, 0, 0.03); /* Soft paper-like surrounding background */
  overflow-y: auto; /* Enable scrolling on the wrapper itself if needed */
}

.chart-frame {
  position: relative;
  flex-grow: 1;
  min-height: 180px; /* Prevent chart from becoming unusably small */
  display: flex;
  flex-direction: column;
}
.chart-frame.fit-x-layout {
  height: auto !important;
}
.eodash-chart-wrapper.fit-x-maximized .chart-frame {
  width: 100%;
  max-width: 900px; /* Perfect max-width for an A4/portrait plot to stay sharp and readable */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Elegant paper-like shadow */
  background: white;
  border-radius: 8px;
}

eox-chart {
  flex-grow: 1;
  min-height: 0;
}
eox-chart.fit-x-layout {
  height: var(--fit-height) !important;
}

.chart-toggle {
  position: absolute;
  top: 8px;
  right: 46px;
  z-index: 2;
  cursor: pointer;
}
</style>
