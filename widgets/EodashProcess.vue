<template>
  <div class="processContainer">
    <eox-jsonform
      v-if="jsonFormSchema"
      ref="jsonformEl"
      .schema="jsonFormSchema"
      .noShadow="true"
    ></eox-jsonform>
    <EodashChart v-if="isProcessed && chartSpec" :spec="chartSpec" />
    <span>
      <v-btn
        :loading="loading"
        style="float: right; margin-right: 20px"
        @click="startProcess"
        color="primary"
      >
        Execute</v-btn
      >
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
import mustache from "mustache";

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
const loading = ref(false);

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
  const origBbox = jsonformEl.value.value.bbox;
  serviceLinks?.forEach(async (link) => {
    let currentLayers = [...getLayers()];
    let analysisGroup = currentLayers.find((l) =>
      l.properties.id.includes("AnalysisGroup"),
    );
    // const requesttype = /** @type {RequestType} */(l.requesttype)
    if (link.type === "text/csv" && spec) {
      // @ts-expect-error url
      spec.data.url = link.href;
      chartSpec.value = spec;
    } else if (link.type === "image/tiff") {
      let flatStyleJSON;
      const flatStyleURL = /** @type {string | undefined} */ (
        link["eox:flatstyle"]
      );

      if (flatStyleURL) {
        flatStyleJSON = await axios.get(flatStyleURL).then((resp) => resp.data);
      }
      const geotiffLayer = {
        type: "WebGLTile",
        source: {
          type: "GeoTIFF",
          normalize: false,
          sources: [ { "url": link.href }],
        },
        properties: {
          id: link.id,
          title: "Results " + link.id,
          layerConfig: { schema: flatStyleJSON.jsonform, type: "style" }
        },
        style: flatStyleJSON,
      }
      const prevLayerIdx = analysisGroup?.layers.findIndex(
        (l) => l.id === link.id,
      );
      if (prevLayerIdx !== -1) {
        analysisGroup?.layers.splice(prevLayerIdx, 1);
      }
      analysisGroup?.layers.push(geotiffLayer);
      mapEl.value.layers = [...currentLayers];
      

    } else if (link.type === "image/png") {
      const prevLayerIdx = analysisGroup?.layers.findIndex(
        (l) => l.id === link.id,
      );
      if (prevLayerIdx !== -1) {
        analysisGroup?.layers.splice(prevLayerIdx, 1);
      }
      analysisGroup?.layers.unshift({
        type: "Image",
        properties: {
          id: link.id,
          title: "Results " + link.id,
        },
        source: {
          type: "ImageStatic",
          imageExtent: origBbox,
          url: mustache.render(link.href, jsonformEl.value.value),
        },
      });
      mapEl.value.layers = [...currentLayers];
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

        // We need to convert map projection based coordinates to 4326
        const mapproj = mapEl.value.projection || "EPSG:3857";
        jsonformEl.value.value.bbox = mapEl.value.transformExtent(
          origBbox,
          mapproj,
        );
        const url = mustache.render(link.href, jsonformEl.value.value);
        loading.value = true;
        axios.get(url).then((resp) => {
          // Refetch current state on load finished
          currentLayers = [...getLayers()];
          analysisGroup = currentLayers.find((l) =>
            l.properties.id.includes("AnalysisGroup"),
          );
          const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(resp.data));
          const processLayer = {
            type: "Vector",
            properties: {
              id: link.id,
              title: "Results " + link.id,
            },
            source: {
              type: "Vector",
              url: dataStr,
              format: "GeoJSON",
            },
            ...(flatStyleJSON && { style: flatStyleJSON }),
          };
          if (!analysisGroup) {
            console.log("no analysis group found");
          }
          const prevLayerIdx = analysisGroup?.layers.findIndex(
            (l) => l.id === link.id,
          );
          if (prevLayerIdx !== -1) {
            analysisGroup?.layers.splice(prevLayerIdx, 1);
          }
          analysisGroup?.layers.push(processLayer);
          mapEl.value.layers = [...currentLayers];
          loading.value = false;
        });
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
.processContainer {
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
