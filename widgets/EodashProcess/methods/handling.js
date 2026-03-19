import log from "loglevel";
import {
  applyProcessLayersToMap,
  EOXHUB_WORKSPACES_ENDPOINT,
  extractGeometries,
  findClosestDatetimeIndex,
  findTemporalField,
  getBboxProperty,
  getDrawToolsProperties,
  updateJsonformSchemaTarget,
  updateProcessLayerStyleVars,
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
  activeProcessDatetime,
  mapEl,
  mapCompareEl,
} from "@/store/states";
import { processCharts, processLayers, processSTAC } from "./outputs";
import { handleLayersCustomEndpoints } from "./custom-endpoints/layers";
import { handleChartCustomEndpoints } from "./custom-endpoints/chart";
import { useSTAcStore } from "@/store/stac";
import { useGetSubCodeId } from "@/composables";
import { getLayers, getCompareLayers } from "@/store/actions";

/**
 * Fetch and set the jsonform schema to initialize the process
 *
 * @export
 * @async
 * @param {Object} params
 * @param {import("vue").Ref<import("stac-ts").StacCollection | null>} params.selectedStac
 * @param {import("vue").Ref<Record<string,any> | null>} params.jsonformSchema
 * @param {import("vue").Ref<any[]>} params.processResults
 * @param {import("vue").Ref<boolean>} params.isProcessed
 * @param {import("vue").Ref<boolean>} params.loading
 * @param {import("vue").Ref<boolean>} params.isPolling
 * @param {boolean} params.enableCompare
 */
export async function initProcess({
  selectedStac,
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
    updatedJsonform = await fetch(
      //@ts-expect-error eodash extention
      selectedStac.value["eodash:jsonform"],
    ).then((resp) => resp.json());
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

  if (updatedJsonform) {
    // make sure correct target layer id is used in jsonform
    const newJsonForm = await updateJsonformIdentifier({
      jsonformSchema: updatedJsonform,
      newLayers: enableCompare ? getCompareLayers() : getLayers(),
      enableCompare,
    });
    // trigger jsonform update in next tick
    jsonformSchema.value = null;
    await new Promise((resolve) => setTimeout(resolve, 0));
    jsonformSchema.value = newJsonForm;
  }
}

/**
 * Update the jsonform schema to have the correct layer id from the map
 *
 * @export
 * @async
 * @param {Object} params
 * @param {Record<string,any> | null} params.jsonformSchema params.jsonformSchema
 * @param {Record<string, any>[] | undefined} params.newLayers params.newLayers
 * @param { boolean } params.enableCompare params.enableCompare
 * @returns {Promise<Record<string,any> | null>} updated jsonform schema
 */
export async function updateJsonformIdentifier({
  jsonformSchema,
  newLayers,
  enableCompare,
}) {
  const form = jsonformSchema;
  if (!form) {
    return null;
  }
  const drawToolsProperties = getDrawToolsProperties(form);
  drawToolsProperties.forEach((drawToolsProperty) => {
    if (
      drawToolsProperty &&
      form?.properties[drawToolsProperty]?.options?.drawtools?.for &&
      enableCompare
    ) {
      form.properties[drawToolsProperty].options.drawtools.for =
        "eox-map#compare";
    }
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
          if (layer.type === "Group" && Array.isArray(layer.layers)) {
            traverseLayers(layer.layers);
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
        form.properties[drawToolsProperty].options.drawtools.layerId =
          matchedLayerId;
      } else {
        console.warn(
          `Could not find matching layer for processing form with id: ${layerId}`,
        );
      }
    }
  });
  return form;
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
    // Preserve raw form value before extractGeometries mutates it.
    // Needed so POST multiQuery can iterate original GeoJSON Feature objects.
    // Uses JSON round-trip instead of structuredClone to handle OL Feature
    // objects from drawtools (which contain non-cloneable methods).
    const rawJsonformValue = JSON.parse(
      JSON.stringify(
        /** @type {Record<string, any>} */ (jsonformEl.value?.value ?? {}),
      ),
    );
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

    // Detect async eoxhub_workspaces endpoints before running processCharts.
    // For these indicators the chart data only exists after the async process
    // completes, so we must NOT render the chart from the pre-fetched Vega spec
    // (which still points to the "latest" cached URL from a previous run).
    const hasEoxhubEndpoints =
      serviceLinks?.some(
        (l) =>
          l.rel === "service" && l.endpoint === EOXHUB_WORKSPACES_ENDPOINT,
      ) ?? false;

    let tempChartSpec = null;
    [tempChartSpec, usedChartData.value] = await processCharts({
      links: serviceLinks,
      jsonformValue: { ...(jsonformValue ?? {}) },
      rawJsonformValue,
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
    if (Object.keys(tempChartSpec?.data?.values ?? {}).length) {
      //@ts-expect-error we assume that the spec data is of type InlineData
      processResults.value.push(tempChartSpec?.data.values);
    }
    if (tempChartSpec && !("background" in tempChartSpec)) {
      tempChartSpec["background"] = "transparent";
    }
    // Only immediately publish the chart spec for non-eoxhub indicators.
    // For eoxhub indicators, the chart will be rendered (with correct data)
    // by the eoxhub endpoint handler after async polling completes.
    if (!hasEoxhubEndpoints) {
      usedChartSpec.value = tempChartSpec;
    } else {
      usedChartSpec.value = null;
    }

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
  activeProcessDatetime.value = null;
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
 * @param {boolean} [enableCompare=false] - Whether the click comes from the compare chart.
 */
export const onChartClick = (evt, enableCompare = false) => {
  const evtChartSpec = evt.target?.spec;
  if (
    !evtChartSpec ||
    (!evt.detail?.item?.datum && !evt.detail?.item?.datum?.datum)
  ) {
    return;
  }

  const temporalKey = findTemporalField(evtChartSpec);
  if (!temporalKey) {
    return;
  }

  try {
    const vegaItem = evt.detail.item;
    const datum = vegaItem.datum?.datum ?? vegaItem.datum;
    const datestring = datum?.[temporalKey];
    if (!datestring) {
      return; // Clicked a mark without the expected temporal field (e.g. highlight rule)
    }
    const temporalValue = new Date(datestring);
    if (Number.isNaN(temporalValue.getTime())) {
      return;
    }

    // Check if there are process GeoTIFF layers with datetimes metadata.
    // If so, update time_step style variable instead of datetime.value
    // to avoid STAC reload which would wipe the AnalysisGroup.
    const currentLayers = enableCompare ? getCompareLayers() : getLayers();
    const analysisGroup = currentLayers?.find((l) =>
      l.properties?.id?.includes("AnalysisGroup"),
    );
    if (analysisGroup?.layers) {
      const processGeoTiffLayers = analysisGroup.layers.filter(
        (l) =>
          l.type === "WebGLTile" &&
          l.source?.type === "GeoTIFF" &&
          l.properties?.id?.includes("_process") &&
          l.properties?.datetimes?.length > 0,
      );
      if (processGeoTiffLayers.length > 0) {
        const datetimes = processGeoTiffLayers[0].properties.datetimes;
        const bestIdx = findClosestDatetimeIndex(datetimes, temporalValue);
        const timeStep = bestIdx + 1;

        // Update ALL sibling process layers (not just those with datetimes)
        // so that layers like methane results also update their time_step.
        const mapElement = enableCompare ? mapCompareEl.value : mapEl.value;
        if (mapElement?.map) {
          updateProcessLayerStyleVars(
            mapElement.map,
            (id) => id.includes("_process"),
            { time_step: timeStep },
          );
        }

        // Track the active datetime for the chart highlight line
        activeProcessDatetime.value = datetimes[bestIdx] ?? null;

        return; // Don't set datetime.value — AnalysisGroup is preserved
      }
    }

    // Fallback: set datetime.value for standard STAC indicators
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
