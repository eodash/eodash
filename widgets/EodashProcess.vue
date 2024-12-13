<template>
  <div class="process-container">
    <eox-jsonform
      v-if="jsonFormSchema"
      ref="jsonformEl"
      .schema="jsonFormSchema"
    ></eox-jsonform>
    <eox-chart
      class="chart"
      v-if="isProcessed && chartSpec"
      .spec="toRaw(chartSpec)"
      .dataValues="toRaw(chartData)"
    />
    <span>
      <v-btn
        v-if="!autoExec"
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

import { nextTick, onMounted, ref, toRaw, watch } from "vue";
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
import { isMulti } from "@eox/jsonform/src/custom-inputs/spatial/utils";

const layersEvents = useEventBus(eoxLayersKey);
const { selectedStac } = storeToRefs(useSTAcStore());

/** @type {import("vue").Ref<import("vega").Spec|null>} */
const chartSpec = ref(null);

/** @type {import("vue").Ref<Record<string,any>|null>}  */
const chartData = ref(null);
const isProcessed = ref(false);

/** @type {import("vue").Ref<Record<string,any>|null>} */
const jsonFormSchema = ref(null);

/** @type {import("vue").Ref<import("@eox/jsonform").EOxJSONForm | null>} */
const jsonformEl = ref(null);
const loading = ref(false);

const autoExec = ref(false);
useAutoExec(autoExec, jsonformEl, jsonFormSchema);

const initProcess = async () => {
  if (selectedStac.value) {
    resetProcess();
    if (selectedStac.value["eodash:jsonform"]) {
      jsonformEl.value?.editor.destroy();
      // wait for the layers to be rendered
      jsonFormSchema.value = await axios
        //@ts-expect-error eodash extention
        .get(selectedStac.value["eodash:jsonform"])
        .then((resp) => resp.data);
      // remove borders from jsonform
      await nextTick(() => {
        injectJsonformCSS(jsonformEl.value);
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
  if (mapEl.value?.layers.length < 1 ) {
    layersEvents.once(async () => {
      await initProcess();
    });
  } else {
    await initProcess();
  }
});

useOnLayersUpdate(initProcess);

const startProcess = async () => {
  const errors = jsonformEl.value?.editor.validate();
  if(errors?.length) {
    return;
  }
  await handleProcesses();
  isProcessed.value = true;
};

async function handleProcesses() {
  log.debug("Processing...");

  const serviceLinks = selectedStac.value?.links?.filter(
    (l) => l.rel === "service",
  );
  const bboxProperty = getBboxProperty(jsonFormSchema.value);
  const jsonformValue = /** @type {Record<string,any>} */ (
    jsonformEl.value?.value
  );

  extractGeometries(jsonformValue, jsonFormSchema.value);

  const origBbox = jsonformValue[bboxProperty];

  const specUrl = /** @type {string} */ (
    selectedStac.value?.["eodash:vegadefinition"]
  );

  [chartSpec.value, chartData.value] = await getChartValues(
    serviceLinks,
    { ...(jsonformValue ?? {}) },
    specUrl,
  );
  const geotiffLayer = await processGeoTiff(
    serviceLinks,
    jsonformValue,
    selectedStac.value?.id ?? "",
  );
  const vectorLayers = await processVector(
    serviceLinks,
    jsonformValue,
    selectedStac.value?.id ?? "",
  );

  const imageLayers = processImage(serviceLinks, jsonformValue, origBbox);

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

function resetProcess() {
  isProcessed.value = false;
  chartSpec.value = null;
  jsonFormSchema.value = null;
}

/**
 * @param {import("stac-ts").StacLink[] | undefined} links
 * @param {Record<string,any> | undefined} jsonformValue
 * @param {string} specUrl
 * @returns {Promise<[import("vega").Spec|null,Record<string,any>|null]>}
 **/
async function getChartValues(links, jsonformValue, specUrl) {
  if (!specUrl || !links) return [null, null];
  /** @type {import("vega").Spec} */
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
    if (link.type && ["application/json", "text/csv"].includes(link.type)) {
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
 * @param {Record<string,any> |null} [jsonformSchema]
 **/
function getBboxProperty(jsonformSchema) {
  return /** @type {string} */ (
    Object.keys(jsonformSchema?.properties ?? {}).find(
      (key) => jsonformSchema?.properties[key].format === "bounding-box",
    )
  );
}

/**
 * Auto execute the process when the jsonform has the execute option
 *
 * @param {import("vue").Ref<boolean>} autoExec
 * @param {import("vue").Ref<import("@eox/jsonform").EOxJSONForm | null>} jsonformEl
 * @param {import("vue").Ref<Record<string,any> | null>} jsonformSchema
 **/
function useAutoExec(autoExec, jsonformEl, jsonformSchema) {
  /**
   * @param {CustomEvent} _e
   **/
  const onJsonFormChange = async (_e) => {
    if (!isProcessed.value) {
      await startProcess();
    }
  };

  const addEventListener = async () => {
    await nextTick(() => {
      //@ts-expect-error TODO
      jsonformEl.value?.addEventListener("change", onJsonFormChange);
    });
  };
  const removeEventListener = () => {
    //@ts-expect-error TODO
    jsonformEl.value?.removeEventListener("change", onJsonFormChange);
  };

  watch(jsonformSchema, (updatedSchema) => {
    autoExec.value = updatedSchema?.options?.["execute"] || false;
  });

  onMounted(() => {
    watch(
      autoExec,
      async (exec) => {
        if (exec) {
          await addEventListener();
        } else {
          removeEventListener();
        }
      },
      { immediate: true },
    );
  });
}

/**
 * Extracts the keys of type "geojson" from the jsonform schema
 * @param {Record<string,any> |null} [jsonformSchema]
 **/
function getGeoJsonProperties(jsonformSchema) {
  return /** @type {string[]} */ (
    Object.keys(jsonformSchema?.properties ?? {}).filter(
      (key) => jsonformSchema?.properties[key].type === "geojson",
    )
  );
}

/**
 * Converts jsonform geojson values to stringified geometries
 * @param {Record<string,any> |null} [jsonformSchema]
 * @param {Record<string,any>} jsonformValue
 **/
function extractGeometries(jsonformValue, jsonformSchema) {
  const geojsonKeys = getGeoJsonProperties(jsonformSchema);

  for (const key of geojsonKeys) {
    if (!jsonformValue[key]) {
      continue;
    }

    if (isMulti(jsonformSchema?.properties[key])) {
      // jsonformValue[key] is a feature collection
      jsonformValue[key] =
        /** @type {import("ol/format/GeoJSON").GeoJSONFeatureCollection} */ (
          jsonformValue[key]
        ).features.map((feature) => JSON.stringify(feature.geometry));
    } else {
      // jsonformValue[key] is a single feature
      jsonformValue[key] = JSON.stringify(jsonformValue[key].geometry);
    }
  }
}

/**
 * @param {import("@eox/jsonform").EOxJSONForm | null} jsonFormEl
 **/
function injectJsonformCSS(jsonFormEl) {
  if (!jsonFormEl?.shadowRoot) {
    console.error("jsonform has no shadowRoot");
    return;
  }
  const stylesheet = new CSSStyleSheet();
  stylesheet.replaceSync(`.je-indented-panel {
    border: none !important;
  }`);
  jsonFormEl.shadowRoot.adoptedStyleSheets = [stylesheet];
}
</script>
<style>
.chart {
  height: 400px;
  width: 100%;
}

.process-container {
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
