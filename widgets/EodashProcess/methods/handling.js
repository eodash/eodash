import log from "loglevel";
import {
  applyProcessLayersToMap,
  extractGeometries,
  getBboxProperty,
  getDrawToolsProperty,
  updateJsonformSchemaTarget,
} from "./utils";
import {
  compareIndicator,
  comparePoi,
  datetime,
  indicator,
  poi,
  chartData,
  chartSpec,
  compareChartData,
  compareChartSpec,
} from "@/store/states";
import axios from "@/plugins/axios";
import { processCharts, processLayers, processSTAC } from "./outputs";
import { handleLayersCustomEndpoints } from "./custom-endpoints/layers";
import { handleChartCustomEndpoints } from "./custom-endpoints/chart";
import { useSTAcStore } from "@/store/stac";
import { useGetSubCodeId } from "@/composables";
import { getLayers } from "@/store/actions";

/**
 * Fetch and set the jsonform schema to initialize the process
 *
 * @export
 * @async
 * @param {Object} params
 * @param {import("vue").Ref<import("stac-ts").StacCollection | null>} params.selectedStac
 * @param {import("vue").Ref<import("@eox/jsonform").EOxJSONForm | null>} params.jsonformEl
 * @param {import("vue").Ref<Record<string,any> | null>} params.jsonformSchema
 * @param {import("vue").Ref<any[]>} params.processResults
 * @param {import("vue").Ref<boolean>} params.isProcessed
 * @param {import("vue").Ref<boolean>} params.loading
 * @param {import("vue").Ref<boolean>} params.isPolling
 * @param {boolean} params.enableCompare
 */
export async function initProcess({
  selectedStac,
  jsonformEl,
  jsonformSchema,
  isProcessed,
  processResults,
  loading,
  isPolling,
  enableCompare,
}) {
  const isPoiAlive = enableCompare ? !!comparePoi.value : !!poi.value;
  let updatedJsonform = null;
  if (selectedStac.value?.["eodash:jsonform"]) {
    updatedJsonform = await axios
      //@ts-expect-error eodash extention
      .get(selectedStac.value["eodash:jsonform"])
      .then((resp) => resp.data);
  }

  if (!updatedJsonform && isPoiAlive) {
    jsonformSchema.value = null;
    return;
  }
  resetProcess({
    loading,
    isProcessed,
    jsonformSchema,
    isPolling,
    processResults,
    enableCompare,
  });

  await jsonformEl.value?.editor.destroy();
  if (updatedJsonform) {
    // make sure correct target layer id is used in jsonform
    if (updatedJsonform.properties?.feature?.options?.drawtools?.layerId) {
      await updateJsonformIdentifier({
        jsonformSchema,
        newLayers: await getLayers(),
      });
    }
    if (enableCompare) {
      updatedJsonform = updateJsonformSchemaTarget(updatedJsonform);
    }
    jsonformSchema.value = updatedJsonform;
  }
}

/**
 * Update the jsonform schema to have the correct layer id from the map
 *
 * @export
 * @async
 * @param {Object} params
 * @param {import("vue").Ref<Record<string,any> | null>} params.jsonformSchema params.jsonformSchema
 * @param {Record<string, any>[] | undefined} params.newLayers params.newLayers
 */
export async function updateJsonformIdentifier({ jsonformSchema, newLayers }) {
  const form = jsonformSchema.value;
  if (!form) {
    return;
  }
  const drawToolsProperty = getDrawToolsProperty(form);
  if (
    drawToolsProperty &&
    newLayers &&
    form?.properties[drawToolsProperty]?.options?.drawtools?.layerId
  ) {
    // get partial or full id and try to match with correct eoxmap layer
    // check if newLayers is an array or an object with layers property
    let layers = newLayers;
    // @ts-expect-error TODO payload coming from time update sometimes is not an object with layers property
    if (newLayers.layers && Array.isArray(newLayers.layers)) {
      // @ts-expect-error TODO payload coming from time update sometimes is not an object with layers property
      layers = newLayers.layers;
    }

    const layerId =
      form.properties[drawToolsProperty].options.drawtools.layerId.split(
        ";:;",
      )[0];
    let matchedLayerId = null;
    // layers are not flat can be grouped, we need to recursively search
    const traverseLayers = (
      /** @type {Record<string, any>[] | undefined} */ layersArray,
    ) => {
      if (!layersArray) {
        return;
      }
      for (const layer of layersArray) {
        if (layer.layers) {
          // @ts-expect-error TODO payload coming from time update events is not an object with layers property
          traverseLayers(layer);
        } else {
          if (layer.properties?.id?.startsWith(layerId)) {
            matchedLayerId = layer.properties.id;
            break;
          }
        }
      }
    };
    traverseLayers(layers);
    if (matchedLayerId) {
      form.properties.feature.options.drawtools.layerId = matchedLayerId;
      // trigger jsonform update in next tick
      jsonformSchema.value = null;
      await new Promise((resolve) => setTimeout(resolve, 0));
      jsonformSchema.value = form;
    } else {
      throw new Error(
        `Could not find matching layer for processing form with id: ${layerId}`,
      );
    }
  }
}

/**
 *
 * @param {object} params
 * @param {import("vue").Ref<boolean>} params.loading
 * @param {import("vue").Ref<import("stac-ts").StacCollection | null>} params.selectedStac
 * @param {import("vue").Ref<import("@eox/jsonform").EOxJSONForm | null>} params.jsonformEl
 * @param {import("vue").Ref<Record<string,any>|null>} params.jsonformSchema
 * @param {import("vue").Ref<boolean>} params.isPolling
 * @param {import("vue").Ref<any[]>} params.processResults
 * @param {import("@eox/map").EOxMap | null} params.mapElement
 * @param {import("vue").Ref<import("../types").AsyncJob[]>} params.jobs
 */
export async function handleProcesses({
  loading,
  selectedStac,
  jsonformEl,
  jsonformSchema,
  isPolling,
  processResults,
  mapElement,
  jobs,
}) {
  if (!jsonformEl.value || !jsonformSchema.value || !selectedStac.value) {
    return;
  }
  const enableCompare = mapElement?.id === "compare";

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
    const usedChartSpec = enableCompare ? compareChartSpec : chartSpec;
    const usedChartData = enableCompare ? compareChartData : chartData;
    let tempChartSpec = null;
    [tempChartSpec, usedChartData.value] = await processCharts({
      links: serviceLinks,
      jsonformValue: { ...(jsonformValue ?? {}) },
      jsonformSchema: jsonformSchema.value,
      enableCompare,
      selectedStac: selectedStac.value,
      specUrl,
      isPolling,
      jobs,
      customEndpointsHandler: handleChartCustomEndpoints,
    });

    if (Object.keys(usedChartData.value ?? {}).length) {
      processResults.value.push(usedChartData.value);
    }

    //@ts-expect-error we assume that the spec data is of type InlineData
    if (tempChartSpec.data?.values?.length) {
      //@ts-expect-error we assume that the spec data is of type InlineData
      processResults.value.push(tempChartSpec?.data.values);
    }
    if (tempChartSpec && !("background" in tempChartSpec)) {
      tempChartSpec["background"] = "transparent";
    }
    usedChartSpec.value = tempChartSpec;

    await processSTAC(
      serviceLinks,
      jsonformValue,
      mapElement?.id === "compare",
    );

    const newLayers = await processLayers({
      isPolling,
      links: serviceLinks,
      jsonformValue: { ...(jsonformValue ?? {}) },
      jsonformSchema: jsonformSchema.value,
      selectedStac: selectedStac.value,
      enableCompare: mapElement?.id === "compare",
      layerId,
      origBbox,
      jobs,
      customLayersHandler: handleLayersCustomEndpoints,
      projection: /** @type {{name?:string}} */ (
        selectedStac.value["eodash:mapProjection"]
      )?.["name"],
    });

    // save layers results
    if (newLayers.length) {
      for (const layer of newLayers) {
        if (layer.type === "WebGLTile" && layer.source?.type === "GeoTIFF") {
          processResults.value.push(...(layer.source.sources ?? []));
          //@ts-expect-error TODO
        } else if (layer.source && "url" in layer.source) {
          //@ts-expect-error TODO
          processResults.value.push(layer.source.url);
        }
      }
    }

    applyProcessLayersToMap(mapElement, newLayers);
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
 * @param {import("vue").Ref<boolean>} params.isPolling
 * @param {import("vue").Ref<any[]>} params.processResults
 * @param {import("vue").Ref<Record<string,any>|null>} params.jsonformSchema
 * @param {boolean} params.enableCompare
 */
export function resetProcess({
  loading,
  isProcessed,
  jsonformSchema,
  processResults,
  isPolling,
  enableCompare,
}) {
  loading.value = false;
  isProcessed.value = false;
  isPolling.value = false;
  const usedChartSpec = enableCompare ? compareChartSpec : chartSpec;
  usedChartSpec.value = null;
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
  if (
    !chartSpec ||
    (!evt.detail?.item?.datum &&
    !evt.detail?.item?.datum.datum)
  ) {
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
  if (comparePoi.value) {
    if (compareIndicator.value) {
      const comparelink = stacStore.stac?.find(
        (link) => useGetSubCodeId(link) === compareIndicator.value,
      );
      stacStore.loadSelectedCompareSTAC(comparelink?.href).catch((err) => {
        console.error("[eodash] Error loading compare STAC:", err);
      });
    } else {
      stacStore.resetSelectedCompareSTAC();
    }
  }
};
