<template>
  <div class="processContainer">
    <eox-jsonform
      v-if="jsonFormSchema"
      ref="jsonformEl"
      .schema="jsonFormSchema"
      .noShadow="true"
    ></eox-jsonform>
    <eox-chart
      class="chart"
      v-if="isProcessed && chartSpec"
      .spec="toRaw(chartSpec)"
      .dataValues="toRaw(chartData)"
    />
    <span>
      <v-btn
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
import { ref, toRaw } from "vue";
import axios from "@/plugins/axios";
import { useSTAcStore } from "@/store/stac";
import { storeToRefs } from "pinia";
import { mapEl } from "@/store/States";
import { getLayers } from "@/store/Actions";
import mustache from "mustache";
import { extractLayerConfig } from "@/utils/helpers";
import { useOnLayersUpdate } from "@/composables";


const { selectedStac } = storeToRefs(useSTAcStore());
/** @type {import("vue").Ref<import("vega").Spec|null>} */
const chartSpec = ref(null);
/** @type {import("vue").Ref<Record<string,any>|null>}  */
const chartData = ref(null);
const isProcessed = ref(false);
/** @type {import("vue").Ref<Record<string,any>|null>} */
const jsonFormSchema = ref(null);
/** @type {import("vue").Ref<Record<string,any>|null>} */
const jsonformEl = ref(null);
const loading = ref(false);


useOnLayersUpdate(async()=>{
    if (selectedStac.value) {
      reset();
      if (selectedStac.value["eodash:jsonform"]) {
        // wait for the layers to be rendered
        // setTimeout(async () => {
          jsonFormSchema.value = await axios
          //@ts-expect-error eodash extention
          .get(selectedStac.value["eodash:jsonform"])
          .then((resp) => resp.data);
        // }, 200);
      } else {
        if (!jsonFormSchema.value) {
          return;
        }
        jsonFormSchema.value.value = null;
      }
    }
});

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
  // update bbox based on the current map projection
  const origBbox = updateBbox();

  [chartSpec.value, chartData.value] = await getChartValues(serviceLinks);
  const geotiffLayer = await processGeoTiff(serviceLinks);
  const vectorLayers = await processVector(serviceLinks);
  const imageLayers = processImage(serviceLinks,origBbox);
  console.log("layers", geotiffLayer, vectorLayers, imageLayers);
  if (geotiffLayer || vectorLayers?.length || imageLayers?.length) {
    // const prevLayerIdx = analysisGroup?.layers.findIndex(
    //   //@ts-expect-error TODO
    //   (l) => l.id === link.id,
    // );
    // if (prevLayerIdx !== -1) {
    //   analysisGroup?.layers.splice(prevLayerIdx, 1);
    // }
    const layers = [
      ...(geotiffLayer ? [geotiffLayer] : []),
      ...(vectorLayers ?? []),
      ...(imageLayers ?? []),
    ];
    let currentLayers = [...getLayers()];
    let analysisGroup = currentLayers.find((l) =>
      l.properties.id.includes("AnalysisGroup"),
    );
    analysisGroup?.layers.push(...layers);
    //@ts-expect-error TODO
    mapEl.value.layers = [...currentLayers];
  }
}

function reset() {
  isProcessed.value = false;
  chartSpec.value = null;
  jsonFormSchema.value = null;
}

/**
 * @param {import("stac-ts").StacLink[] | undefined} links
 * @returns {Promise<[import("vega").Spec|null,Record<string,any>|null]>}
 **/
async function getChartValues(links) {
  const specUrl = /** @type {string} */ (
    selectedStac.value?.["eodash:vegadefinition"]
  );
  if (!specUrl || !links) return [null, null];
  const spec = await axios.get(specUrl).then((resp) => {
    return resp.data;
  });
  const dataName = spec.data.name;
  const dataLinks = links.filter(
    (link) => link.rel === "service" && link.id === dataName,
  );
  /** @type {Record<string,any>}  */
  const dataValues = {};
  for (const link of dataLinks ?? []) {
    let url = link.href;
    if (jsonFormSchema.value) {
      if ("eox:flatstyle" in (link ?? {})) {
        url = mustache.render(url, { ...(link["eox:flatstyle"] ?? {}) });
      } else {
        if ("feature" in (jsonFormSchema.value.value ?? {}))
          url = mustache.render(url, {
            ...(jsonformEl.value?.value ?? {}),
            feature: jsonformEl.value?.value.feature[0],
          });
        else url = mustache.render(url, { ...(jsonformEl.value?.value ?? {}) });
      }
    }
    dataValues[/** @type {string} */ (link.id)] = await axios
      .get(url)
      .then((resp) => resp.data);
  }
  return [spec, dataValues];
}

/**
 * @param {import("stac-ts").StacLink[] | undefined} links
 */
async function processGeoTiff(links) {
  if (!links) return;
  const geotiffLinks = links.filter(
    (link) => link.rel === "service" && link.type === "image/tiff",
  );
  let urls = [];
  let flatStyleJSON = null;
  for (const link of geotiffLinks ?? []) {
    urls.push(
      mustache.render(link.href, { ...(jsonformEl.value?.value ?? {}) }),
    );

    if ("eox:flatstyle" in (link ?? {})) {
      flatStyleJSON = await axios
        .get(/** @type {string} */ (link["eox:flatstyle"]))
        .then((resp) => resp.data);
    }
  }
  /** @type {Record<string,any>|undefined} */
  let layerConfig;
  /** @type {Record<string,any>|undefined} */
  let style;
  if (flatStyleJSON) {
    const extracted = extractLayerConfig(flatStyleJSON);
    layerConfig = extracted.layerConfig;
    style = extracted.style;
  }
  return urls.length
    ? {
        type: "WebGLTile",
        source: {
          type: "GeoTIFF",
          normalize: false,
          sources: urls.map((url) => ({ url })),
        },
        properties: {
          id: selectedStac.value?.id + "_geotiff_process",
          title: "Results " + selectedStac.value?.id,
          ...(layerConfig && { layerConfig: layerConfig }),
        },
        ...(style && { style: style }),
      }
    : undefined;
}
/**
 * @param {import("stac-ts").StacLink[] | undefined} links
 */
async function processVector(links) {
  if (!links) return;
  const layers = [];
  const vectorLinks = links.filter(
    (link) => link.rel === "service" && link.type === "application/geo+json",
  );
  if (vectorLinks.length === 0) return;

  let flatStyleJSON = null;

  for (const link of vectorLinks) {
    if ("eox:flatstyle" in (link ?? {})) {
      flatStyleJSON = await axios
        .get(/** @type {string} */ (link["eox:flatstyle"]))
        .then((resp) => resp.data);
    }

    /** @type {Record<string,any>|undefined} */
    let layerConfig;
    /** @type {Record<string,any>|undefined} */
    let style;
    if (flatStyleJSON) {
      const extracted = extractLayerConfig(flatStyleJSON);
      layerConfig = extracted.layerConfig;
      style = extracted.style;
    }

    layers.push({
      type: "Vector",
      source: {
        type: "Vector",
        url: mustache.render(link.href, {
          ...(jsonformEl.value?.value ?? {}),
          bbox: jsonformEl.value?.value.bbox[0],
        }),
        format: "GeoJSON",
      },
      properties: {
        id: selectedStac.value?.id + "_vector_process",
        title: "Results " + selectedStac.value?.id,
        ...(layerConfig && { ...layerConfig, ...(style && { style: style }) }),
      },
    });
  }
  return layers;
}
/**
 * @param {import("stac-ts").StacLink[] | undefined} links
 * @param {number[]} origBbox
 */
function processImage(links,origBbox) {
  if (!links) return;
  const imageLinks = links.filter(
    (link) => link.rel === "service" && link.type === "image/png",
  );
  const layers = [];
  for (const link of imageLinks) {
    layers.push({
      type: "Image",
      properties: {
        id: link.id,
        title: "Results " + link.id,
      },
      source: {
        type: "ImageStatic",
        imageExtent: origBbox,
        url: mustache.render(link.href, {
          ...(jsonformEl.value?.value ?? {}),
        }),
      },
    });
  }
  return layers;
}
function updateBbox(){
  const bBoxProperty = /** @type {string} */ (
    Object.keys(jsonFormSchema.value?.properties ?? {}).find(
      (key) => jsonFormSchema.value?.properties[key].format === "bounding-box",
    )
  );
  const origBbox = jsonformEl.value?.value[bBoxProperty]?.[0];

  // We need to convert map projection based coordinates to 4326
  const mapproj = mapEl.value?.getAttribute("projection") || "EPSG:3857";
  if (origBbox && mapproj) {
    //@ts-expect-error TODO
    jsonformEl.value.value[bBoxProperty] = mapEl.value?.transformExtent(
      origBbox,
      mapproj,
    );
  }
  return origBbox;
}
</script>
<style>
.chart {
  height: 400px;
  width: 100%;
}

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
