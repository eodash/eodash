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
const frameHeight = ref(225);
const containerEl = useTemplateRef("container");

/**
@type { MutationObserver | null}
*/
let observer = null;
/** @type {ResizeObserver | null} */
let resizeObserver = null;
/** @type {MutationObserver | null} */
let childMutationObserver = null;

onMounted(() => {
  const el = containerEl.value;
  if (!el) return;

  const directParent = el.parentElement;
  const grandParent = directParent?.parentElement;

  const calculateHeight = () => {
    if (!grandParent) return;
    let availableHeight = grandParent.getBoundingClientRect().height;
    
    if (directParent && directParent.classList.contains('eodash-process-container')) {
       const styles = window.getComputedStyle(directParent);
       availableHeight -= (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
       
       Array.from(directParent.children).forEach(child => {
         if (child !== el) {
           const childHeight = child.getBoundingClientRect().height;
           const childStyles = window.getComputedStyle(child);
           const margins = (parseFloat(childStyles.marginTop) || 0) + (parseFloat(childStyles.marginBottom) || 0);
           availableHeight -= (childHeight + margins);
         }
       });
       
       // Subtract height of vega-bindings if they exist inside the web component
       const eoxChart = el.querySelector('eox-chart');
       if (eoxChart && eoxChart.shadowRoot) {
         const bindingsForm = eoxChart.shadowRoot.querySelector('.vega-bindings');
         if (bindingsForm) {
            const formHeight = bindingsForm.getBoundingClientRect().height;
            availableHeight -= (formHeight + 12); // Add 12px extra padding for the form
         }
       }

       // small buffer to prevent border scrollbars
       availableHeight -= 12;
    } else {
       // If maximized or in another panel
       if (directParent) {
           const styles = window.getComputedStyle(directParent);
           availableHeight -= (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
       }
       availableHeight -= 12; 
    }
    
    if (availableHeight > 0) {
      frameHeight.value = Math.max(150, Math.floor(availableHeight));
    }
  };

  calculateHeight();

  if (grandParent) {
     resizeObserver = new ResizeObserver(() => {
       calculateHeight();
     });
     resizeObserver.observe(grandParent);
     
     if (directParent) {
       resizeObserver.observe(directParent);
       Array.from(directParent.children).forEach(child => {
         if (child !== el) resizeObserver.observe(child);
       });
       
       childMutationObserver = new MutationObserver(() => {
         calculateHeight();
         Array.from(directParent.children).forEach(child => {
           if (child !== el) resizeObserver.observe(child);
         });
         
         // Also check for vega-bindings in shadow dom if not already observing
         const eoxChart = el.querySelector('eox-chart');
         if (eoxChart && eoxChart.shadowRoot && !eoxChart.dataset.observed) {
            const shadowObserver = new MutationObserver(() => calculateHeight());
            shadowObserver.observe(eoxChart.shadowRoot, { childList: true, subtree: true });
            eoxChart.dataset.observed = 'true';
         }
       });
       childMutationObserver.observe(directParent, { childList: true });
     }
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
  resizeObserver?.disconnect();
  childMutationObserver?.disconnect();
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
