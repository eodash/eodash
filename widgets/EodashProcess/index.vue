<template>
  <div ref="container" class="eodash-process-container">
    <div class="eodash-process-content">
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
    </div>
    <div
      v-if="
        showExecBtn ||
        (processResults.length && isProcessed && !isAsync) ||
        hasCustomProcessState
      "
      class="eodash-process-actions d-flex justify-space-between align-center"
    >
      <div>
        <v-btn
          v-if="hasCustomProcessState"
          v-tooltip="'Reset process form to default'"
          :icon="[mdiRestore]"
          density="comfortable"
          size="small"
          variant="text"
          @click="resetProcessCustomization"
        />
      </div>
      <div>
        <v-btn
          v-if="showExecBtn"
          :loading="loading"
          style="margin-right: 8px"
          :append-icon="[mdiCogPlayOutline]"
          density="comfortable"
          size="small"
          @click="startProcess"
        >
          Execute
        </v-btn>
        <v-btn
          v-if="processResults.length && isProcessed && !isAsync"
          color="primary"
          style="margin-right: 8px"
          :append-icon="[mdiDownloadCircleOutline]"
          size="small"
          density="comfortable"
          @click="downloadResults"
        >
          Download
        </v-btn>
      </div>
    </div>
  </div>
</template>
<script setup>
import "@eox/chart";
import "@eox/drawtools";
import "@eox/jsonform";
import { useSTAcStore } from "@/store/stac";
import { storeToRefs } from "pinia";
import { computed, onUnmounted, ref, useTemplateRef, watch } from "vue";
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
import { download, getDrawToolsProperties } from "./methods/utils";
import {
  compareJobs,
  jobs,
  activeProcessFormValue,
  activeCompareProcessFormValue,
  baselineProcessDefaults,
  baselineCompareProcessDefaults,
} from "./states";
import {
  restoredCompareProcessState,
  restoredProcessState,
} from "@/utils/states";
import {
  diffFormValues,
  extractSchemaDefaults,
} from "@/utils/process-state-helpers";
import {
  mdiCogPlayOutline,
  mdiDownloadCircleOutline,
  mdiRestore,
} from "@mdi/js";

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

const isProcessed = ref(false);

/** @type {import("vue").Ref<Record<string,any>|null>} */
const jsonformSchema = ref(null);

const jsonformEl =
  /** @type {Readonly<import("vue").ShallowRef<import("@eox/jsonform").EOxJSONForm | null>>} */ (
    useTemplateRef("jsonformEl")
  );

// Inject custom styles into the eox-jsonform shadow DOM to make eox-drawtools inline
watch(jsonformEl, (el) => {
  if (el) {
    // Capture initial form values as fallback baseline defaults if not already captured from schema
    const targetBaseline = enableCompare
      ? baselineCompareProcessDefaults
      : baselineProcessDefaults;
    const form = /** @type {{ value?: Record<string, any> } | null} */ (el);
    if (!targetBaseline.value && form?.value) {
      targetBaseline.value = { ...form.value };
    }

    const onFormChange = () => {
      const current = form?.value || {};
      const targetState = enableCompare
        ? activeCompareProcessFormValue
        : activeProcessFormValue;
      targetState.value = { ...current };
    };
    el.addEventListener("change", onFormChange);
  }
  if (el && el.shadowRoot) {
    const styleId = "eodash-drawtools-inline-style";
    if (!el.shadowRoot.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        /* Compact standard form elements */
        .form-control, .form-group {
          margin-bottom: 8px !important;
        }
        .form-control > label, .form-group > label {
          margin-bottom: 2px !important;
          font-size: 0.9em;
        }
        
        /* Specific layout for drawtools */
        .form-control:has(eox-drawtools) {
          position: relative;
          padding: 8px 12px !important;
          border: none !important;
          background: transparent !important;
          margin-bottom: 8px !important;
        }
        .form-control:has(eox-drawtools) > label {
          position: absolute;
          left: 12px;
          top: 8px;
          margin: 0 !important;
          width: calc(100% - 180px); /* Give label maximum available width */
          line-height: 1.2;
          display: flex;
          align-items: flex-start;
          padding-top: 8px;
          pointer-events: none; /* Let clicks pass through to buttons if they overlap slightly */
        }
        .form-control:has(eox-drawtools) > eox-drawtools {
          display: block;
          width: 100%;
        }
      `;
      el.shadowRoot.appendChild(style);
    }

    const injectDrawtoolsStyle = () => {
      const drawtools = el?.shadowRoot?.querySelector("eox-drawtools");
      if (drawtools && drawtools.shadowRoot) {
        if (
          !drawtools.shadowRoot.getElementById("eodash-drawtools-indent-style")
        ) {
          const dtStyle = document.createElement("style");
          dtStyle.id = "eodash-drawtools-indent-style";
          dtStyle.textContent = `
            eox-drawtools-controller {
              display: flex;
              justify-content: flex-end; /* Push buttons to the right */
              min-height: 40px;
              width: 100%;
            }
            eox-drawtools-list {
              display: block;
              margin-top: 10px;
              width: 100%;
            }
          `;
          drawtools.shadowRoot.appendChild(dtStyle);
          return true;
        }
      }
      return false;
    };

    if (!injectDrawtoolsStyle()) {
      const observer = new MutationObserver(() => {
        if (injectDrawtoolsStyle()) {
          observer.disconnect();
        }
      });
      observer.observe(el.shadowRoot, { childList: true, subtree: true });
    }
  }
});

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
  () =>
    currentIndicator.value +
    mapElement.value?.id +
    JSON.stringify(jsonformSchema.value),
);

useInitProcess({
  selectedStac: currentSelectedStac,
  mapElement,
  jsonformSchema,
  jsonformEl,
  isProcessed,
  processResults,
  loading,
  isPolling,
});

// Seed restored values onto schema defaults when present, while capturing true baseline schema defaults
watch(
  [
    jsonformSchema,
    () =>
      enableCompare
        ? restoredCompareProcessState.value
        : restoredProcessState.value,
  ],
  ([schema, restored]) => {
    if (!schema) return;

    const targetBaseline = enableCompare
      ? baselineCompareProcessDefaults
      : baselineProcessDefaults;
    // Capture clean baseline defaults from the untouched schema if not yet recorded
    if (!targetBaseline.value && schema.properties) {
      targetBaseline.value = extractSchemaDefaults(schema);
    }

    if (
      restored &&
      typeof restored === "object" &&
      Object.keys(restored).length
    ) {
      if (schema.properties) {
        for (const [key, val] of Object.entries(restored)) {
          if (schema.properties[key]) {
            schema.properties[key].default = val;
          }
        }
      }
    }
  },
  { immediate: true },
);

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
  const drawToolsProperties = getDrawToolsProperties(jsonformSchema.value);

  const anyDrawtoolPropertyEmpty = drawToolsProperties.some(
    (drawToolsProperty) => {
      //@ts-expect-error jsonform.value is not typed
      const val = jsonformEl.value?.value?.[drawToolsProperty];
      if (Array.isArray(val) && !val.length) return true;
      if (typeof val === "string" && val.trim() === "") return true;
      if (!val) return true;
      return false;
    },
  );

  if (anyDrawtoolPropertyEmpty) {
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
const hasCustomProcessState = computed(() => {
  const targetRestored = enableCompare
    ? restoredCompareProcessState.value
    : restoredProcessState.value;
  if (targetRestored && Object.keys(targetRestored).length) return true;

  const targetActive = enableCompare
    ? activeCompareProcessFormValue.value
    : activeProcessFormValue.value;
  const targetBaseline = enableCompare
    ? baselineCompareProcessDefaults.value
    : baselineProcessDefaults.value;

  if (targetActive && Object.keys(targetActive).length) {
    const delta = diffFormValues(targetActive, targetBaseline || {});
    return Object.keys(delta).length > 0;
  }
  return false;
});

const resetProcessCustomization = () => {
  const targetRestored = enableCompare
    ? restoredCompareProcessState
    : restoredProcessState;
  const targetActive = enableCompare
    ? activeCompareProcessFormValue
    : activeProcessFormValue;
  const targetBaseline = enableCompare
    ? baselineCompareProcessDefaults
    : baselineProcessDefaults;

  targetRestored.value = null;
  targetActive.value = null;

  if (jsonformEl.value?.editor && targetBaseline.value) {
    jsonformEl.value.editor.setValue({ ...targetBaseline.value });
  }
};

useAutoExec(autoExec, jsonformEl, jsonformSchema, startProcess);

onUnmounted(() => {
  if (enableCompare) {
    activeCompareProcessFormValue.value = null;
    baselineCompareProcessDefaults.value = null;
    restoredCompareProcessState.value = null;
  } else {
    activeProcessFormValue.value = null;
    baselineProcessDefaults.value = null;
    restoredProcessState.value = null;
  }
});
</script>
<style>
eox-jsonform {
  padding: 0 12px;
  min-height: 0px;
  flex-shrink: 0;
}

/* Force the specific panel wrapping this component to utilize 100% height */
.bg-surface:has(.eodash-process-container) {
  height: calc(100% - 30px);
  overflow: hidden;
}

/* Make sure this container takes up full height and acts as a flex column */
.eodash-process-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.eodash-process-content {
  flex-grow: 1;
  overflow-y: auto;
  scrollbar-gutter: stable;
  display: flex;
  flex-direction: column;
}

.eodash-process-content > .eodash-chart-wrapper:not(.fit-x-layout) {
  height: auto;
  flex: 1 1 0;
  min-height: 180px;
}

.eodash-process-content > .eodash-chart-wrapper.fit-x-layout {
  height: auto !important;
  flex: none;
}

.eodash-process-actions {
  text-align: right;
  padding: 4px 12px;
  flex-shrink: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: inherit;
}
</style>
