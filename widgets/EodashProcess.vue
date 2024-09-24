<template>
  <div class="processContainer">
    <eox-jsonform v-if="jsonFormSchema"
    .schema="jsonFormSchema"
    .noShadow="true"
    ></eox-jsonform>
    <EodashChart v-if="isProcessed && chartSpec" :spec="chartSpec" />
    <span v-show="!isProcessed">
      <v-card-text> start {{ indicatorTitle }} processing </v-card-text>
      <v-btn @click="startProcess" color="primary"> start</v-btn>
    </span>
  </div>
</template>
<script setup>
import "@eox/jsonform"
import { computed, ref, watch } from "vue";
import EodashChart from "./EodashChart.vue";
import axios from "@/plugins/axios";
import { useSTAcStore } from "@/store/stac";
import { storeToRefs } from "pinia";
import { mapEl } from "@/store/States";
import { getLayers } from "@/store/Actions";
import { makePanelTransparent } from "@/composables";

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
  await handleProcesses(
    // selectedStac.value?.id !== "temperature" ? _chart : _seaIceProcess,
  );
  isProcessed.value = true;
};

/**
 *
 * @param {import("stac-ts").StacCollection} updatedSTAC
 */
async function handleProcesses(updatedSTAC) {
  const serviceLinks = updatedSTAC?.links.filter((l) => l.rel === "service");
  // const process = updatedSTAC["api:request"]
  debugger;
  

  /** @type {import("vega").Spec} */
  let spec;
  if (updatedSTAC["eodash:vegadefinition"]) {
    spec = await axios
      //@ts-expect-error eodash extention
      .get(updatedSTAC["eodash:vegadefinition"])
      .then((resp) => resp.data);
  }

  serviceLinks.forEach(async (link) => {
    // const requesttype = /** @type {RequestType} */(l.requesttype)
    if (link.type === "text/csv" && spec) {
      // @ts-expect-error url
      spec.data.url = link.href;
      chartSpec.value = spec;
    } else if (link.type === "application/geo+json") {
      let flatStyleJSON;
      const flatStyleURL = /** @type {string | undefined} */ (
        //@ts-expect-error flatstyles
        link["eox:flatstyle"]
      );

      if (flatStyleURL) {
        flatStyleJSON = await axios.get(flatStyleURL).then((resp) => resp.data);
      }

      if (mapEl.value) {
        const processLayer = {
          type: "Vector",
          properties: {
            id: link.id,
            title: "Sea Ice Demo",
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
