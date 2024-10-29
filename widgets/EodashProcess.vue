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
import { nextTick, onMounted, ref, toRaw } from "vue";
import axios from "@/plugins/axios";
import { useSTAcStore } from "@/store/stac";
import { storeToRefs } from "pinia";
import { mapEl } from "@/store/States";
import { getLayers } from "@/store/Actions";
import mustache from "mustache";
import { extractLayerConfig } from "@/utils/helpers";
import { useOnLayersUpdate } from "@/composables";
import log from "loglevel";
import { useEventBus } from "@vueuse/core";
import { eoxLayersKey } from "@/utils/keys";

const layersEvents = useEventBus(eoxLayersKey);
const { selectedStac } = storeToRefs(useSTAcStore());
/** @type {import("vue").Ref<import("vega-embed").VisualizationSpec|null>} */
const chartSpec = ref(null);
/** @type {import("vue").Ref<Record<string,any>|null>}  */
const chartData = ref(null);
const isProcessed = ref(false);
/** @type {import("vue").Ref<Record<string,any>|null>} */
const jsonFormSchema = ref(null);
/** @type {import("vue").Ref<HTMLElement & Record<string,any>|null>} */
const jsonformEl = ref(null);
const loading = ref(false);
/** @type {(HTMLElement & Record<string,any>)| null} */
let eoxDrawTools = null;

const initProcess = async () => {
  if (selectedStac.value) {
    resetProcess(eoxDrawTools);
    if (selectedStac.value["eodash:jsonform"]) {
      // wait for the layers to be rendered
      jsonFormSchema.value = await axios
        //@ts-expect-error eodash extention
        .get(selectedStac.value["eodash:jsonform"])
        .then((resp) => resp.data);
      await nextTick(async () => {
        jsonformEl.value?.addEventListener(
          "change",
          async () => {
            eoxDrawTools =
              jsonformEl.value?.querySelector("eox-drawtools") ?? null;
            await nextTick(async () => {
              if (eoxDrawTools?.getAttribute("layer-id")) {
                eoxDrawTools?.startDrawing();
              }
            });
          },
          { once: true },
        );
      });
    } else {
      if (!jsonFormSchema.value) {
        return;
      }
      jsonFormSchema.value = null;
    }
  }
};

onMounted(async () => {
  // wait for the layers to be rendered
  if (!mapEl.value) {
    layersEvents.once(async () => {
      await initProcess();
    });
  } else {
    await initProcess();
  }
});

useOnLayersUpdate(initProcess);

const startProcess = async () => {
  if (!isProcessed.value) {
    await handleProcesses();
    isProcessed.value = true;
  }
};

async function handleProcesses() {
  log.debug("Processing...");

  const serviceLinks = selectedStac.value?.links?.filter(
    (l) => l.rel === "service",
  );
  const bboxProperty = getBboxProperty(jsonFormSchema.value);
  const origBbox = jsonformEl.value?.value[bboxProperty];
  // update bbox based on the current map projection
  const updatedValue = updateBbox(
    jsonformEl.value?.value,
    mapEl.value,
    bboxProperty,
  );

  const specUrl = /** @type {string} */ (
    selectedStac.value?.["eodash:vegadefinition"]
  );

  [chartSpec.value, chartData.value] = await getChartValues(
    serviceLinks,
    { ...(updatedValue ?? {}) },
    specUrl,
  );
  const geotiffLayer = await processGeoTiff(
    serviceLinks,
    updatedValue,
    selectedStac.value?.id ?? "",
  );
  const vectorLayers = await processVector(
    serviceLinks,
    updatedValue,
    selectedStac.value?.id ?? "",
  );

  const imageLayers = processImage(serviceLinks, updatedValue, origBbox);

  log.debug(
    "rendered layers after processing:",
    geotiffLayer,
    vectorLayers,
    imageLayers,
  );

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

/**
 * @param {(HTMLElement & Record<string,any>) | null} [eoxDrawTools]
 */
function resetProcess(eoxDrawTools) {
  isProcessed.value = false;
  chartSpec.value = null;
  jsonFormSchema.value = null;
  eoxDrawTools?.discardDrawing();
}

/**
 * @param {import("stac-ts").StacLink[] | undefined} links
 * @param {Record<string,any> | undefined} jsonformValue
 * @param {string} specUrl
 * @returns {Promise<[import("vega-embed").VisualizationSpec|null,Record<string,any>|null]>}
 **/
async function getChartValues(links, jsonformValue, specUrl) {
  if (!specUrl || !links) return [null, null];
  /** @type {import("vega-embed").VisualizationSpec} */
  const spec = await axios.get(specUrl).then((resp) => {
    return resp.data;
  });
  //@ts-expect-error NamedData
  const dataName = spec?.data?.name;
  const dataLinks = links.filter(
    (link) => link.rel === "service" && dataName && link.id === dataName,
  );

  /** @type {Record<string,any>}  */
  const dataValues = {};
  for (const link of dataLinks ?? []) {
    if (link.type === "text/csv") {
      //@ts-expect-error UrlData
      spec.data.url = mustache.render(link.href, {
        ...(jsonformValue ?? {}),
        ...(link["eox:flatstyle"] ?? {}),
      });
      continue;
    }

    dataValues[/** @type {string} */ (link.id)] = await axios
      .get(
        mustache.render(link.href, {
          ...(jsonformValue ?? {}),
          ...(link["eox:flatstyle"] ?? {}),
        }),
      )
      .then((resp) => resp.data);
  }
  return [spec, dataValues];
}

/**
 * @param {import("stac-ts").StacLink[] | undefined} links
 * @param {Record<string,any> | undefined} jsonformValue
 * @param {string} layerId
 */
async function processGeoTiff(links, jsonformValue, layerId) {
  if (!links) return;
  const geotiffLinks = links.filter(
    (link) => link.rel === "service" && link.type === "image/tiff",
  );
  let urls = [];
  let flatStyleJSON = null;
  for (const link of geotiffLinks ?? []) {
    urls.push(mustache.render(link.href, { ...(jsonformValue ?? {}) }));

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
          normalize: !style,
          sources: urls.map((url) => ({ url })),
        },
        properties: {
          id: layerId + "_geotiff_process",
          title: "Results " + layerId,
          ...(layerConfig && { layerConfig: layerConfig }),
        },
        ...(style && { style: style }),
      }
    : undefined;
}
/**
 * @param {import("stac-ts").StacLink[] | undefined} links
 * @param {Record<string,any> | undefined} jsonformValue
 * @param {string} layerId
 */
async function processVector(links, jsonformValue, layerId) {
  if (!links) return;
  /** @type {Record<string,any>[]} */
  const layers = [];
  const vectorLinks = links.filter(
    (link) => link.rel === "service" && link.type === "application/geo+json",
  );
  if (vectorLinks.length === 0) return layers;

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
          ...(jsonformValue ?? {}),
        }),
        format: "GeoJSON",
      },
      properties: {
        id: layerId + "_vector_process",
        title: "Results " + layerId,
        ...(layerConfig && { ...layerConfig, ...(style && { style: style }) }),
      },
    });
  }
  return layers;
}
/**
 * @param {import("stac-ts").StacLink[] | undefined} links
 * @param {Record<string,any>|undefined} jsonformValue
 * @param {number[]} origBbox
 */
function processImage(links, jsonformValue, origBbox) {
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
          ...(jsonformValue ?? {}),
        }),
      },
    });
  }
  return layers;
}

/**
 * @param {Record<string,any>} jsonformValue
 * @param {(HTMLElement & Record<string,any>)| null} mapElement
 * @param {string} bboxProperty
 **/
function updateBbox(jsonformValue, mapElement, bboxProperty) {
  if (!jsonformValue) {
    return;
  }
  /** @type {number[]} */
  const origBbox = jsonformValue[bboxProperty];

  // We need to convert map projection based coordinates to 4326
  const mapproj = mapElement?.getAttribute("projection") || "EPSG:3857";
  if (origBbox && mapproj) {
    const transformed = mapElement?.transformExtent(origBbox, mapproj);

    if (transformed) {
      jsonformValue[bboxProperty] = transformed;
    }
  }
  return jsonformValue;
}
/**
 * @param {Record<string,any> |null} [jsonformSchema]
 **/
function getBboxProperty(jsonformSchema) {
  return /** @type {string} */ (
    Object.keys(jsonformSchema?.properties ?? {}).find(
      (key) => jsonformSchema?.properties[key].format === "bounding-box",
    )
  );
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
