<template>
  <div ref="container">
    <div class="chart-frame">
      <button
        v-if="usedChartData && usedChartSpec"
        class="chart-toggle"
        @click="toggleLayout"
        v-tooltip="areChartsSeparateLayout ? 'Minimize' : 'Maximize'"
      >
        <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
          <path :d="toggleIcon" />
        </svg>
      </button>
      <eox-chart
        class="pt-0"
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

onMounted(() => {
  const el = containerEl.value;
  if (!el) return;

  const parent = el.parentElement?.parentElement;
  if (parent) {
    const parentHeight = parent.getBoundingClientRect().height;
    frameHeight.value = Math.max(225, Math.floor(parentHeight));
  }

  const overlay = getOverlayParent(el);
  if (!overlay) return;

  observer = new MutationObserver(async () => {
    const style = getComputedStyle(overlay);
    const visible = style.display !== "none";
    if (visible) {
      chartRenderKey.value++;
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
</script>
<style scoped>
.chart-frame {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-toggle {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
