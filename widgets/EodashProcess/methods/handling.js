import log from "loglevel";
import { extractGeometries, getBboxProperty } from "./utils";
import { datetime, indicator, mapEl, poi } from "@/store/states";
import axios from "@/plugins/axios";
import { getLayers } from "@/store/actions";
import {
  getChartValues,
  processGeoTiff,
  processImage,
  processSTAC,
  processVector,
} from "./outputs";
import { handleGeotiffCustomEndpoints } from "./custom-endpoints/geotiff";
import { handleChartCustomEndpoints } from "./custom-endpoints/chart";
import { useSTAcStore } from "@/store/stac";
import { replaceLayer } from "@/eodashSTAC/helpers";
import { useEmitLayersUpdate, useGetSubCodeId } from "@/composables/index";

/**
 * Fetch and set the jsonform schema to initialize the process
 *
 * @export
 * @async
 * @param {Object} params
 * @param {import("vue").Ref<import("stac-ts").StacCollection>} params.selectedStac
 * @param {import("vue").Ref<import("@eox/jsonform").EOxJSONForm | null>} params.jsonformEl
 * @param {import("vue").Ref<Record<string,any> | null>} params.jsonformSchema
 * @param {import("vue").Ref<import("@eox/chart").EOxChart["spec"] | null>} params.chartSpec
 * @param {import("vue").Ref<any[]>} params.processResults
 * @param {import("vue").Ref<boolean>} params.isProcessed
 * @param {import("vue").Ref<boolean>} params.loading
 * @param {import("vue").Ref<boolean>} params.isPolling
 */
export async function initProcess({
  selectedStac,
  jsonformEl,
  jsonformSchema,
  chartSpec,
  isProcessed,
  processResults,
  loading,
  isPolling,
}) {
  let updatedJsonform = null;
  if (selectedStac.value["eodash:jsonform"]) {
    updatedJsonform = await axios
      //@ts-expect-error eodash extention
      .get(selectedStac.value["eodash:jsonform"])
      .then((resp) => resp.data);
  }

  if (!updatedJsonform && poi.value) {
    jsonformSchema.value = null;
    return;
  }
  resetProcess({
    loading,
    isProcessed,
    chartSpec,
    jsonformSchema,
    isPolling,
    processResults,
  });

  await jsonformEl.value?.editor.destroy();
  if (updatedJsonform) {
    jsonformSchema.value = updatedJsonform;
  }
}

/**
 *
 * @param {Object} params
 * @param {import("vue").Ref<boolean>} params.loading
 * @param {import("vue").Ref<import("stac-ts").StacCollection | null>} params.selectedStac
 * @param {import("vue").Ref<import("@eox/jsonform").EOxJSONForm | null>} params.jsonformEl
 * @param {import("vue").Ref<Record<string,any>|null>} params.jsonformSchema
 * @param {import("vue").Ref<import("@eox/chart").EOxChart["spec"] | null>} params.chartSpec
 * @param {import("vue").Ref<Record<string, any> | null>} params.chartData
 * @param {import("vue").Ref<boolean>} params.isPolling
 * @param {import("vue").Ref<any[]>} params.processResults
 */
export async function handleProcesses({
  loading,
  selectedStac,
  jsonformEl,
  jsonformSchema,
  chartSpec,
  chartData,
  isPolling,
  processResults,
}) {
  if (!jsonformEl.value || !jsonformSchema.value || !selectedStac.value) {
    return;
  }

  log.debug("Processing...");
  loading.value = true;
  try {
    const serviceLinks = selectedStac.value?.links?.filter(
      (l) => l.rel === "service",
    );

    const bboxProperty = getBboxProperty(jsonformSchema.value);
    const jsonformValue = /** @type {Record<string,any>} */ (
      jsonformEl.value?.value
    );

    extractGeometries(jsonformValue, jsonformSchema.value);

    const origBbox = jsonformValue[bboxProperty];

    const specUrl = /** @type {string} */ (
      selectedStac.value?.["eodash:vegadefinition"]
    );
    const layerId = selectedStac.value?.id ?? "";

    [chartSpec.value, chartData.value] = await getChartValues({
      links: serviceLinks,
      jsonformValue: { ...(jsonformValue ?? {}) },
      jsonformSchema: jsonformSchema.value,
      selectedStac: selectedStac.value,
      specUrl,
      isPolling,
      customEndpointsHandler: handleChartCustomEndpoints,
    });

    if (Object.keys(chartData.value ?? {}).length) {
      processResults.value.push(chartData.value);
    }

    //@ts-expect-error we assume that the spec data is of type InlineData
    if (chartSpec.value?.data?.values?.length) {
      //@ts-expect-error we assume that the spec data is of type InlineData
      processResults.value.push(chartSpec.value?.data.values);
    }

    if (chartSpec.value && !("background" in chartSpec.value)) {
      chartSpec.value["background"] = "transparent";
    }

    await processSTAC(serviceLinks, jsonformValue);

    const geotiffLayers = await processGeoTiff({
      links: serviceLinks,
      jsonformValue,
      layerId,
      isPolling,
      projection:
        //@ts-expect-error TODO
        selectedStac.value?.["eodash:mapProjection"]?.["name"] ?? null,
      jsonformSchema: jsonformSchema.value,
      selectedStac: selectedStac.value,
      customEndpointsHandler: handleGeotiffCustomEndpoints,
    });
    geotiffLayers?.forEach((geotiffLayer) => {
      if (geotiffLayer && geotiffLayer.source?.sources.length) {
        processResults.value.push(
          //@ts-expect-error TODO
          ...(geotiffLayer.source?.sources?.map((source) => source.url) ?? []),
        );
      }
    });

    const vectorLayers = await processVector(
      serviceLinks,
      jsonformValue,
      layerId,
    );

    if (vectorLayers?.length) {
      processResults.value.push(
        ...vectorLayers.map((layer) => layer.source?.url),
      );
    }

    const imageLayers = processImage(serviceLinks, jsonformValue, origBbox);
    if (imageLayers?.length) {
      processResults.value.push(
        ...imageLayers.map((layer) => layer.source?.url),
      );
    }

    log.debug(
      "rendered layers after processing:",
      geotiffLayers,
      vectorLayers,
      imageLayers,
    );

    if (geotiffLayers?.length || vectorLayers?.length || imageLayers?.length) {
      const newLayers = /** @type {import("@eox/map").EoxLayer[]} */ ([
        ...(geotiffLayers ?? []),
        ...(vectorLayers ?? []),
        ...(imageLayers ?? []),
      ]);
      let currentLayers = [...getLayers()];

      let analysisGroup =
        /*** @type {import("@eox/map/src/layers").EOxLayerTypeGroup | undefined} */ (
          currentLayers.find((l) => l.properties?.id.includes("AnalysisGroup"))
        );
      if (!analysisGroup) {
        return;
      }

      for (const layer of newLayers) {
        const exists = analysisGroup.layers.find(
          (l) => l.properties?.id === layer.properties?.id,
        );
        if (!exists) {
          analysisGroup.layers.unshift(layer);
        } else {
          analysisGroup.layers = replaceLayer(
            analysisGroup.layers,
            layer.properties?.id ?? "",
            [layer],
          );
        }
      }
      if (mapEl.value) {
        const layers = [...currentLayers];
        useEmitLayersUpdate("process:updated", mapEl.value, layers);
        mapEl.value.layers = layers;
      }
    }
    loading.value = false;
  } catch (error) {
    console.error("[eodash] Error while running process:", error);
    loading.value = false;
    throw error;
  }
}

/**
 * Reset the process state
 * @param {Object} params
 * @param {import("vue").Ref<boolean>} params.loading
 * @param {import("vue").Ref<boolean>} params.isProcessed
 * @param {import("vue").Ref<import("@eox/chart").EOxChart["spec"] | null>} params.chartSpec
 * @param {import("vue").Ref<boolean>} params.isPolling
 * @param {import("vue").Ref<any[]>} params.processResults
 * @param {import("vue").Ref<Record<string,any>|null>} params.jsonformSchema
 */
export function resetProcess({
  loading,
  isProcessed,
  chartSpec,
  jsonformSchema,
  processResults,
  isPolling,
}) {
  loading.value = false;
  isProcessed.value = false;
  isPolling.value = false;
  chartSpec.value = null;
  processResults.value = [];
  jsonformSchema.value = null;
}

/**
 * Handles the click event on a chart to extract temporal information and update the global datetime value.
 *
 * @param {object} evt - The click event object.
 * @param {object} evt.target - The target of the event, expected to have a Vega-Lite specification (`spec`).
 * @param {object} evt.target.spec - The Vega-Lite specification of the chart.
 * @param {Record<string,{type?:string;field?:string;}>} [evt.target.spec.encoding] - The encoding specification of the chart.
 * @param {object} evt.detail - The detail of the event, containing information about the clicked item.
 * @param {import("vega").Item} evt.detail.item - The Vega item that was clicked.
 */
export const onChartClick = (evt) => {
  const chartSpec = evt.target?.spec;
  if (!chartSpec) {
    return;
  }
  const encodingKey = Object.keys(chartSpec.encoding ?? {}).find(
    (key) => chartSpec.encoding?.[key].type === "temporal",
  );
  if (!encodingKey) {
    return;
  }
  const temporalKey = chartSpec.encoding?.[encodingKey].field;
  if (!temporalKey) {
    return;
  }
  try {
    const vegaItem = evt.detail.item;
    let datestring = "";
    // It seems sometimes we have datum inside datum and sometimes not    
    if (vegaItem.datum && vegaItem.datum.datum) {
      // If datum is nested, we use the nested datum
      datestring = vegaItem.datum.datum[temporalKey];
    } else {
      // Otherwise, we use the top-level datum
      datestring = vegaItem.datum[temporalKey];
    }
    const temporalValue = new Date(datestring);
    datetime.value = temporalValue.toISOString();
  } catch (error) {
    console.warn(
      "[eodash] Error while setting datetime from eox-chart:",
      error,
    );
  }
};

/**
 * Loads the main indicator of a Point of Interest (POI)
 */
export const loadPOiIndicator = () => {
  if (!indicator.value) {
    indicator.value =
      new URLSearchParams(window.location.search).get("indicator") ?? "";
  }
  const stacStore = useSTAcStore();
  const link = stacStore.stac?.find(
    (link) => useGetSubCodeId(link) === indicator.value,
  );
  stacStore.loadSelectedSTAC(link?.href);
};
