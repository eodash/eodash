<template>
  <div ref="container" class="py-0">
    <ProcessList :map-element="mapElement" :enable-compare="enableCompare" />
    <eox-jsonform
      v-if="jsonformSchema"
      :key="jsonformKey"
      ref="jsonformEl"
      .schema="jsonformSchema"
    ></eox-jsonform>
    <EodashChart
      v-if="!areChartsSeparateLayout"
      :vega-embed-options="vegaEmbedOptions"
      :enable-compare="enableCompare"
    >
    </EodashChart>
    <div class="mt-2 text-right">
      <v-btn
        v-if="showExecBtn"
        :loading="loading"
        style="margin-right: 20px"
        :append-icon="[mdiCogPlayOutline]"
        @click="startProcess"
        color="primary"
      >
        Execute
      </v-btn>
      <v-btn
        v-if="processResults.length && isProcessed && !isAsync"
        color="primary"
        :append-icon="[mdiDownloadCircleOutline]"
        @click="downloadResults"
      >
        Download
      </v-btn>
    </div>
  </div>
</template>
<script setup>
import "@eox/chart";
import "@eox/drawtools";
import "@eox/jsonform";
import { useSTAcStore } from "@/store/stac";
import { storeToRefs } from "pinia";
import { computed, ref, useTemplateRef } from "vue";
import ProcessList from "./ProcessList.vue";
import EodashChart from "../EodashChart.vue";
import { handleProcesses } from "./methods/handling";
import { useInitProcess, useAutoExec } from "./methods/composables";
import { updateJobsStatus } from "./methods/async";
import {
  compareIndicator,
  indicator,
  mapCompareEl,
  mapEl,
  chartSpec,
  compareChartSpec,
  areChartsSeparateLayout,
} from "@/store/states";
import { download, getDrawToolsProperty } from "./methods/utils";
import { compareJobs, jobs } from "./states";
import { mdiCogPlayOutline, mdiDownloadCircleOutline } from "@mdi/js";

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

const isProcessed = ref(false);

/** @type {import("vue").Ref<Record<string,any>|null>} */
const jsonformSchema = ref(null);

const jsonformEl =
  /** @type {Readonly<import("vue").ShallowRef<import("@eox/jsonform").EOxJSONForm | null>>} */ (
    useTemplateRef("jsonformEl")
  );

const isAsync = computed(
  () =>
    selectedStac.value?.links.filter((l) => l.endpoint === "eoxhub_workspaces")
      .length,
);

const loading = ref(false);

const autoExec = ref(false);

const isPolling = ref(false);
/** @type {import("vue").Ref<any[]>} */
const processResults = ref([]);

const showExecBtn = computed(
  () => !autoExec.value && !!jsonformSchema.value && !!jsonformEl.value,
);
const { selectedStac, selectedCompareStac } = storeToRefs(useSTAcStore());
const currentSelectedStac = enableCompare ? selectedCompareStac : selectedStac;
const mapElement = enableCompare ? mapCompareEl : mapEl;
const currentIndicator = enableCompare ? compareIndicator : indicator;
const currentJobs = enableCompare ? compareJobs : jobs;

const jsonformKey = computed(
  () => currentIndicator.value + mapElement.value?.id,
);

useInitProcess({
  selectedStac: currentSelectedStac,
  mapElement: mapElement.value,
  jsonformEl,
  jsonformSchema,
  isProcessed,
  processResults,
  loading,
  isPolling,
});

const downloadResults = () => {
  processResults.value.forEach((result) => {
    if (!result) {
      return;
    }
    let fileName = "";
    if (typeof result === "string") {
      fileName = result.includes("/")
        ? (result.split("/").pop() ?? "")
        : result;
      fileName = fileName.includes("?") ? fileName.split("?")[0] : fileName;
    } else {
      fileName = currentSelectedStac.value?.id + "_process_results.json";
    }
    download(fileName, result);
  });
};

const startProcess = async () => {
  const drawToolsProperty = getDrawToolsProperty(jsonformSchema.value);
  const propertyIsEmpty =
    drawToolsProperty &&
    //@ts-expect-error jsonfrom.value is not typed
    Array.isArray(jsonformEl.value?.value[drawToolsProperty]) &&
    //@ts-expect-error jsonfrom.value is not typed
    !jsonformEl.value?.value[drawToolsProperty].length;

  if (propertyIsEmpty) {
    isProcessed.value = false;
    const usedChartSpec = enableCompare ? compareChartSpec : chartSpec;
    usedChartSpec.value = null;
    return;
  }
  const errors = jsonformEl.value?.editor.validate();
  if (errors?.length) {
    console.warn("[eodash] Form validation failed", errors);
    return;
  }

  processResults.value = [];

  await handleProcesses({
    jobs: currentJobs,
    selectedStac: currentSelectedStac,
    jsonformEl,
    jsonformSchema,
    loading,
    isPolling,
    processResults,
    mapElement: mapElement.value,
  });

  isProcessed.value = true;
  if (isAsync.value) updateJobsStatus(currentJobs, currentIndicator.value);
};
useAutoExec(autoExec, jsonformEl, jsonformSchema, startProcess);
</script>
<style>
eox-jsonform {
  padding: 0.7em;
  min-height: 0px;
}
</style>
