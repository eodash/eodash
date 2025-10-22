<template>
  <div ref="container" class="pb-4">
    <ProcessList :map-element="mapElement" :enable-compare="enableCompare" />

    <eox-jsonform
      v-if="jsonformSchema"
      :key="jsonformKey"
      ref="jsonformEl"
      .schema="jsonformSchema"
    ></eox-jsonform>
    <eox-chart
      ref="chartElRef"
      class="chart"
      v-if="isProcessed && chartSpec"
      .spec="toRaw(chartSpec)"
      .dataValues="toRaw(chartData)"
      @click:item="onChartClick"
      :style="chartStyles"
      .opt="vegaEmbedOptions"
    />
    <div class="mt-4 text-right">
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
import { computed, ref, toRaw, useTemplateRef, watch } from "vue";
import ProcessList from "./ProcessList.vue";
import { handleProcesses, onChartClick } from "./methods/handling";
import { useInitProcess, useAutoExec } from "./methods/composables";
import { updateJobsStatus } from "./methods/async";
import {
  compareIndicator,
  indicator,
  mapCompareEl,
  mapEl,
  chartEl,
  compareChartEl,
} from "@/store/states";
import { download } from "./methods/utils";
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
/** @type {import("vue").Ref<import("vega").Spec|null>} */
const chartSpec = ref(null);

/** @type {import("vue").Ref<Record<string,any>|null>}  */
const chartData = ref(null);
const isProcessed = ref(false);

/** @type {import("vue").Ref<Record<string,any>|null>} */
const jsonformSchema = ref(null);

const jsonformEl =
  /** @type {Readonly<import("vue").ShallowRef<import("@eox/jsonform").EOxJSONForm | null>>} */ (
    useTemplateRef("jsonformEl")
  );
const chartElRef =
  /** @type {Readonly<import("vue").ShallowRef<import("@eox/chart").EOxChart | null>>} */ (
    useTemplateRef("chartElRef")
  );
const isAsync = computed(
  () =>
    selectedStac.value?.links.filter((l) => l.endpoint === "eoxhub_workspaces")
      .length,
);
const containerEl = useTemplateRef("container");

const loading = ref(false);

const autoExec = ref(false);

const isPolling = ref(false);
/** @type {import("vue").Ref<any[]>} */
const processResults = ref([]);

const showExecBtn = computed(
  () =>
    !autoExec.value &&
    (!!jsonformSchema.value || !!chartSpec.value) &&
    !!jsonformEl.value,
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
  chartSpec,
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
    drawToolsProperty &&
    //@ts-expect-error jsonfrom.value is not typed
    Array.isArray(jsonformEl.value?.value[drawToolsProperty]) &&
    //@ts-expect-error jsonfrom.value is not typed
    !jsonformEl.value?.value[drawToolsProperty].length;

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
    jobs: currentJobs,
    selectedStac: currentSelectedStac,
    jsonformEl,
    jsonformSchema,
    chartSpec,
    chartData,
    loading,
    isPolling,
    processResults,
    mapElement: mapElement.value,
  });

  isProcessed.value = true;
  if (isAsync.value) updateJobsStatus(currentJobs, currentIndicator.value);
};
useAutoExec(autoExec, jsonformEl, jsonformSchema, startProcess);

const chartStyles = computed(() => {
  /** @type {Record<string,string>} */
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

// Assign chart element to global state based on compare mode
watch(chartElRef, (newVal) => {
  if (enableCompare) {
    compareChartEl.value = newVal;
  } else {
    chartEl.value = newVal;
  }
});
</script>
<style>
eox-chart {
  --background-color: transparent;
  padding-top: 1em;
}
eox-jsonform {
  padding: 0.7em;
  min-height: 0px;
}
</style>
