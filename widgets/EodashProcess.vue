<template>
  <div class="processContainer">
    <eox-jsonform v-if="jsonFormSchema"
    ref="jsonformEl"
    .schema="jsonFormSchema"
    .noShadow="true"
    ></eox-jsonform>
    <EodashChart v-if="isProcessed && chartSpec" :spec="chartSpec" />
    <span v-show="!isProcessed">
      <v-btn style="float: right; margin-right: 20px;" @click="startProcess" color="primary"> Execute</v-btn>
    </span>
  </div>
</template>
<script setup>
import "@eox/drawtools";
import "@eox/jsonform";
import { computed, ref, watch } from "vue";
import EodashChart from "./EodashChart.vue";
import axios from "@/plugins/axios";
import { useSTAcStore } from "@/store/stac";
import { storeToRefs } from "pinia";
import { mapEl } from "@/store/States";
import { getLayers } from "@/store/Actions";
import { makePanelTransparent } from "@/composables";
import { h } from 'vue'

/** @type {import("vue").Ref<HTMLSpanElement | null>} */
const rootEl = ref(null);
const { selectedStac } = storeToRefs(useSTAcStore());
const indicatorTitle = computed(() =>
  /** @type {string} */ (selectedStac.value?.title)?.toLowerCase(),
);

/** @type {import("vue").Ref<import("vega").Spec|undefined>} */
const chartSpec = ref();
const isProcessed = ref(false);
const jsonFormSchema = ref(null);
const jsonformEl = ref(null);

watch(
  selectedStac,
  async (updatedStac, previousStac) => {
    if (updatedStac && previousStac?.id !== updatedStac.id) {
      if (updatedStac["eodash:jsonform"]) {
        jsonFormSchema.value = await axios
          //@ts-expect-error eodash extention
          .get(updatedStac["eodash:jsonform"])
          .then((resp) => resp.data);
      }
    }
  },
  { immediate: true },
);


const startProcess = async () => {
  await handleProcesses();
  isProcessed.value = true;
};

/**
 *
 */
async function handleProcesses() {
  const coll = selectedStac.value;
  const serviceLinks = coll?.links?.filter((l) => l.rel === "service");

  /** @type {import("vega").Spec} */
  let spec;
  if (coll && coll["eodash:vegadefinition"]) {
    spec = await axios
      //@ts-expect-error eodash extention
      .get(coll["eodash:vegadefinition"])
      .then((resp) => resp.data);
  }

  serviceLinks?.forEach(async (link) => {
    // const requesttype = /** @type {RequestType} */(l.requesttype)
    if (link.type === "text/csv" && spec) {
      // @ts-expect-error url
      spec.data.url = link.href;
      chartSpec.value = spec;
    } else if (link.type === "application/geo+json") {
      let flatStyleJSON;
      const flatStyleURL = /** @type {string | undefined} */ (
        link["eox:flatstyle"]
      );

      if (flatStyleURL) {
        flatStyleJSON = await axios.get(flatStyleURL).then((resp) => resp.data);
      }

      if (mapEl.value) {
        // Apply template to url
        const tmp = h("{{'hello'}}");
        debugger;

        console.log(jsonformEl);
        const template = link.href;
        const processLayer = {
          type: "Vector",
          properties: {
            id: link.id,
            title: "Processing results",
          },
          source: {
            type: "Vector",
            url: link.href,
            format: "GeoJSON",
          },
          ...(flatStyleJSON && { style: flatStyleJSON }),
        };

        const currentLayers = [...getLayers()];
        const analysisGroup = currentLayers.find((l) =>
          l.properties.id.includes("AnalysisGroup"),
        );

        if (!analysisGroup) {
          console.log("no analysis group found");
        }

        analysisGroup?.layers.unshift(processLayer);

        mapEl.value.layers = [];
        mapEl.value.layers = [...currentLayers];
      }
    }
  });
}

const reset = () => {
  isProcessed.value = false;
  chartSpec.value = undefined;
};

// makePanelTransparent(rootEl);

watch(selectedStac, () => {
  reset();
});
</script>
<style>
.processContainer{
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
