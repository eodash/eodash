import log from "loglevel";
import { extractGeometries, getBboxProperty } from "./utils";
import { datetime, mapEl } from "@/store/states";
import axios from "@/plugins/axios";
import { getLayers } from "@/store/actions";
import {
  getChartValues,
  processGeoTiff,
  processImage,
  processVector,
} from "./outputs";

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
  if (!selectedStac.value) {
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
  if (selectedStac.value["eodash:jsonform"]) {
    jsonformEl.value?.editor.destroy();
    // wait for the layers to be rendered
    jsonformSchema.value = await axios
      //@ts-expect-error eodash extention
      .get(selectedStac.value["eodash:jsonform"])
      .then((resp) => resp.data);
    // remove borders from jsonform
  } else {
    if (!jsonformSchema.value) {
      return;
    }
    jsonformSchema.value = null;
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

    [chartSpec.value, chartData.value] = await getChartValues(
      serviceLinks,
      { ...(jsonformValue ?? {}) },
      specUrl,
    );
    console.log("chartData", chartData.value);
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

    const geotiffLayer = await processGeoTiff(
      serviceLinks,
      jsonformValue,
      selectedStac.value?.id ?? "",
      isPolling,
      //@ts-expect-error TODO
      selectedStac.value?.["eodash:mapProjection"]?.["name"] ?? null,
    );

    if (geotiffLayer && geotiffLayer.source?.sources.length) {
      processResults.value.push(
        ...(geotiffLayer.source?.sources?.map((source) => source.url) ?? []),
      );
    }
    // 3. vector geojson
    const vectorLayers = await processVector(
      serviceLinks,
      jsonformValue,
      selectedStac.value?.id ?? "",
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
      geotiffLayer,
      vectorLayers,
      imageLayers,
    );

    if (geotiffLayer || vectorLayers?.length || imageLayers?.length) {
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

      if (mapEl.value) {
        mapEl.value.layers = [...currentLayers];
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
    const temporalValue = new Date(vegaItem.datum.datum[temporalKey]);
    datetime.value = temporalValue.toISOString();
  } catch (error) {
    console.warn(
      "[eodash] Error while setting datetime from eox-chart:",
      error,
    );
  }
};
