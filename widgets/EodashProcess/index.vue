<template>
  <div ref="container" class="process-container">
    <ProcessList />

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
      @click:item="onChartClick"
      :style="chartStyles"
    />
    <div style="text-align: right">
      <v-btn
        v-if="!autoExec"
        :loading="loading"
        style="margin-right: 20px"
        @click="startProcess"
        color="primary"
      >
        Execute
      </v-btn>
      <v-btn
        v-if="processResults.length && isProcessed && !isAsync"
        color="primary"
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
import { computed, ref, toRaw, useTemplateRef } from "vue";
import ProcessList from "./ProcessList.vue";
import { handleProcesses, onChartClick } from "./methods/handling";
import { useInitProcess, useAutoExec } from "./methods/composables";
import { jobs, updateJobsStatus } from "./methods/async";
import { indicator } from "@/store/states";
import { download } from "./methods/utils";

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
const isAsync = computed(()=>selectedStac.value?.links.filter(
  (l) => l.endpoint === "eoxhub_workspaces",
).length);
const containerEl = useTemplateRef("container");

const loading = ref(false);

const autoExec = ref(false);

const isPolling = ref(false);
/** @type {import("vue").Ref<any[]>} */
const processResults = ref([]);

const { selectedStac } = storeToRefs(useSTAcStore());

useInitProcess({
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
      fileName = selectedStac.value?.id + "_process_results.json";
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
  if(isAsync.value) updateJobsStatus(jobs, indicator);

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
