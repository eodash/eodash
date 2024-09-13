<template>
  <span ref="rootEl">
    <v-card class="d-flex flex-column pa-2">
      <!-- <v-expand-transition> -->
        <EodashChart v-if="isProcessed && chartSpec" :spec="chartSpec" />
        <span v-show="!isProcessed">
          <v-card-text> start {{ indicatorTitle }} processing </v-card-text>
          <v-btn @click="startProcess" color="primary"> start</v-btn>
        </span>
      <!-- </v-expand-transition> -->
    </v-card>
  </span>
</template>
<script setup>
// import "@eox/jsonform"
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

const _seaIceProcess = {
  stac_version: "1.1.0",
  type: "Collection",
  // "auth:schemes": {...},
  // "eodash:jsonform": "<link jsonform>",
  links: [
    {
      id: "featuresonmap_process",
      href: "https://gist.githubusercontent.com/wavded/1200773/raw/e122cf709898c09758aecfef349964a8d73a83f3/sample.json",
      rel: "service",
      method: "GET",
      // "headers": {...},
      body: "...",
      type: "application/geo+json",
      "eox:flatstyle":
        "https://raw.githubusercontent.com/eurodatacube/eodash-assets/c08ecb89e64badd2057465282c427966d90a36a5/collections/Polartep_SeaIce_demo/style.json",
      // "auth:refs": [...]
    },
  ],
};

const _chart = {
  stac_version: "1.1.0",
  type: "Collection",
  // "auth:schemes": {...},
  // "eodash:jsonform": "<link jsonform>",
  "eodash:vegadefinition":
    "https://vega.github.io/editor/spec/vega-lite/line.vl.json",
  links: [
    {
      id: "dataset_process",
      href: "https://vega.github.io/vega-lite/data/stocks.csv",
      rel: "service",
      method: "GET",
      // "headers": {...},
      body: "...",
      type: "text/csv",
      // "auth:refs": [...]
    },
  ],
};

const startProcess = async () => {
  await handleProcesses(
    selectedStac.value?.id !== "temperature" ? _chart : _seaIceProcess,
  );
  isProcessed.value = true;
};

/**
 *
 * @param {typeof _chart|typeof _seaIceProcess} updatedSTAC
 */
async function handleProcesses(updatedSTAC) {
  const serviceLinks = updatedSTAC?.links.filter((l) => l.rel === "service");
  // const process = updatedSTAC["api:request"]
  /** @type {import("vega").Spec} */
  let spec;
  //@ts-expect-error eodash extention
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

makePanelTransparent(rootEl);

watch(selectedStac, () => {
  reset();
});
</script>
<style>
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
