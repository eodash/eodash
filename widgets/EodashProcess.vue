<template>
  <div class="process-container">
    <eox-jsonform
      v-if="jsonformSchema"
      ref="jsonformEl"
      .schema="jsonformSchema"
    ></eox-jsonform>
    <eox-chart
      class="chart"
      v-if="isProcessed && chartSpec"
      .spec="toRaw(chartSpec)"
      .dataValues="toRaw(chartData)"
    />
    <span>
      <v-btn
        v-if="!autoExec"
        :loading="loading"
        style="float: right; margin-right: 20px"
        @click="startProcess"
        color="primary"
      >
        Execute
      </v-btn>
    </span>
  </div>
</template>
<script setup>
import "@eox/chart";
import "@eox/drawtools";
import "@eox/jsonform";

import { onMounted, ref, toRaw } from "vue";
import { useSTAcStore } from "@/store/stac";
import { storeToRefs } from "pinia";
import { mapEl } from "@/store/States";
import { useOnLayersUpdate } from "@/composables";
import { useEventBus } from "@vueuse/core";
import { eoxLayersKey } from "@/utils/keys";
import {
  handleProcesses,
  initProcess,
  useAutoExec,
} from "@/composables/EodashProcess";

const layersEvents = useEventBus(eoxLayersKey);
const { selectedStac } = storeToRefs(useSTAcStore());

/** @type {import("vue").Ref<import("vega").Spec|null>} */
const chartSpec = ref(null);

/** @type {import("vue").Ref<Record<string,any>|null>}  */
const chartData = ref(null);
const isProcessed = ref(false);

/** @type {import("vue").Ref<Record<string,any>|null>} */
const jsonformSchema = ref(null);

/** @type {import("vue").Ref<import("@eox/jsonform").EOxJSONForm | null>} */
const jsonformEl = ref(null);
const loading = ref(false);

const autoExec = ref(false);

const isPolling = ref(false);

onMounted(async () => {
  // wait for the layers to be rendered
  if (mapEl.value?.layers.length <= 1) {
    layersEvents.once(async () => {
      await initProcess({
        //@ts-expect-error TODO
        selectedStac,
        jsonformEl,
        jsonformSchema,
        chartSpec,
        isProcessed,
        loading,
        isPolling,
      });
    });
  } else {
    await initProcess({
      //@ts-expect-error TODO
      selectedStac,
      jsonformEl,
      jsonformSchema,
      chartSpec,
      isProcessed,
      loading,
      isPolling,
    });
  }
});

useOnLayersUpdate(
  async () =>
    await initProcess({
      //@ts-expect-error TODO
      selectedStac,
      jsonformEl,
      jsonformSchema,
      chartSpec,
      isProcessed,
      loading,
      isPolling,
    }),
);

const startProcess = async () => {
  const errors = jsonformEl.value?.editor.validate();
  if (errors?.length) {
    console.warn("[eodash] Form validation failed", errors);
    return;
  }
  await handleProcesses({
    jsonformEl,
    jsonformSchema,
    chartSpec,
    chartData,
    loading,
    //@ts-expect-error TODO
    selectedStac,
    isProcessed,
    isPolling,
  });
  isProcessed.value = true;
};
useAutoExec(autoExec, jsonformEl, jsonformSchema, isProcessed, startProcess);
</script>
<style>
.chart {
  height: 400px;
  width: 100%;
}

.process-container {
  height: 100%;
  overflow-y: auto;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s;
  max-height: 30px;
}

.slide-enter,
.slide-leave-to {
  max-height: 0px;
}
</style>
