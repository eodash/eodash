<template>
  <div ref="container" class="process-container">
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
      :style="chartStyles"
    />
    <v-container>
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
        <v-btn
          v-if="processResults.length && isProcessed"
          color="primary"
          @click="downloadResults"
        >
          Download
        </v-btn>
      </span>
    </v-container>
  </div>
</template>
<script setup>
import "@eox/chart";
import "@eox/drawtools";
import "@eox/jsonform";

import { computed, onMounted, ref, toRaw, useTemplateRef } from "vue";
import { useSTAcStore } from "@/store/stac";
import { storeToRefs } from "pinia";
import { mapEl } from "@/store/states";
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

const containerEl = useTemplateRef("container");

const loading = ref(false);

const autoExec = ref(false);

const isPolling = ref(false);
/** @type {import("vue").Ref<any[]>} */
const processResults = ref([]);

const downloadResults = () => {
  processResults.value.forEach((result) => {
    if (!result) {
      return;
    }
    let url = "";
    let downloadFile = "";
    if (typeof result === "string") {
      url = result;
      //@ts-expect-error TODO
      downloadFile = url.includes("/") ? url.split("/").pop() : url;
      downloadFile = downloadFile.includes("?")
        ? downloadFile.split("?")[0]
        : downloadFile;
    } else {
      result = JSON.stringify(result);
      const blob = new Blob([result], { type: "text" });
      url = URL.createObjectURL(blob);
      downloadFile = selectedStac.value?.id + "_process_results.json";
    }
    const link = document.createElement("a");
    if (confirm(`Would you like to download ${downloadFile}?`)) {
      link.href = url;
      link.download = downloadFile;
      link.click();
    }
    URL.revokeObjectURL(url);
    link.remove();
  });
};
onMounted(async () => {
  // wait for the layers to be rendered
  if (mapEl.value?.layers.length > 1) {
    await initProcess({
      //@ts-expect-error TODO
      selectedStac,
      jsonformEl,
      jsonformSchema,
      chartSpec,
      isProcessed,
      processResults,
      loading,
      isPolling,
    });
  } else {
    layersEvents.once(async () => {
      await initProcess({
        //@ts-expect-error TODO
        selectedStac,
        jsonformEl,
        jsonformSchema,
        chartSpec,
        isProcessed,
        loading,
        processResults,
        isPolling,
      });
    });
  }
});

useOnLayersUpdate(async (evt, _payload) => {
  if (evt === "layers:updated") {
    await initProcess({
      //@ts-expect-error TODO
      selectedStac,
      jsonformEl,
      jsonformSchema,
      chartSpec,
      isProcessed,
      processResults,
      loading,
      isPolling,
    });
  }
});

const startProcess = async () => {
  /** @param {*} jsonformSchema */
  const getDrawToolsProperty = (jsonformSchema) => {
    for (const property in jsonformSchema.properties) {
      if (jsonformSchema.properties[property]?.options?.drawtools) {
        return property;
      }
    }
  };
  const drawToolsProperty = getDrawToolsProperty(jsonformSchema.value);
  const propertyIsEmpty =
  //@ts-expect-error TODO
    drawToolsProperty && !jsonformEl.value?.value[drawToolsProperty].length;

  if (propertyIsEmpty) {
    isProcessed.value = false;
    chartSpec.value = null;
    return;
  }
  const errors = jsonformEl.value?.editor.validate();
  if (errors?.length) {
    console.warn("[eodash] Form validation failed", errors);
    return;
  }
  processResults.value = [];
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
    processResults,
  });
  isProcessed.value = true;
};
useAutoExec(autoExec, jsonformEl, jsonformSchema, startProcess);

const chartStyles = computed(() => {
  /** @type {Record<string,string> }*/
  const styles = {};
  if (!chartSpec.value?.["height"]) {
    styles["height"] =
      Math.max(
        (containerEl.value?.offsetHeight ?? 0) -
          (jsonformEl.value?.offsetHeight ?? 0),
        200,
      ) + "px";
  }
  return styles;
});
</script>
<style>
.process-container {
  height: 100%;
  overflow-y: auto;
}
eox-chart {
  --background-color: transparent;
}
eox-jsonform {
  padding: 0.7em;
}
</style>
