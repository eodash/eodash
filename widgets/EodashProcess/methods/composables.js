import { initProcess, updateJsonformIdentifier } from "./handling";
import { nextTick, onMounted, watch } from "vue";
import { useOnLayersUpdate } from "@/composables";
import { getCompareLayers, getLayers } from "@/store/actions";
/**
 * Composable resposible of timing the Initialization of the process
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
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} params.mapElement
 */
export const useInitProcess = ({
  selectedStac,
  jsonformSchema,
  isProcessed,
  processResults,
  loading,
  isPolling,
  mapElement,
}) => {
  onMounted(async () => {
    await initProcess({
      enableCompare: mapElement.value?.id === "compare",
      selectedStac,
      jsonformSchema,
      isProcessed,
      processResults,
      loading,
      isPolling,
      mapElement: mapElement.value,
    });
  });

  useOnLayersUpdate(async (evt, _payload) => {
    const enableCompare = mapElement.value?.id === "compare";
    const layerUpdatedKey = enableCompare
      ? "compareLayers:updated"
      : "layers:updated";
    const timeUpdatedKeys = enableCompare
      ? ["compareLayertime:updated", "compareTime:updated"]
      : ["layertime:updated", "time:updated"];

    if (timeUpdatedKeys.some((key) => key === evt)) {
      // we need to update jsonform on time change in cases
      // when the feature selection layer was time-based,
      // so that it attaches to a correct new layer
      const newJsonForm = updateJsonformIdentifier({
        jsonformSchema: jsonformSchema.value,
        newLayers: enableCompare ? getCompareLayers() : getLayers() ,
        enableCompare,
        mapElement: mapElement.value,
      });

      if (newJsonForm) {
        jsonformSchema.value = newJsonForm;
      }
    }

    if (evt !== layerUpdatedKey) {
      return;
    }
    await initProcess({
      enableCompare,
      selectedStac,
      jsonformSchema,
      isProcessed,
      processResults,
      loading,
      isPolling,
      mapElement: mapElement.value,
    });
  });
};

/**
 * Auto execute the process when the jsonform has the execute option
 *
 * @param {import("vue").Ref<boolean>} autoExec
 * @param {import("vue").Ref<import("@eox/jsonform").EOxJSONForm | null>} jsonformEl
 * @param {import("vue").Ref<Record<string,any> | null>} jsonformSchema
 * @param {() => Promise<void>} startProcess
 **/
export function useAutoExec(
  autoExec,
  jsonformEl,
  jsonformSchema,
  startProcess,
) {
  /**
   * @param {CustomEvent} _e
   **/
  const onJsonFormChange = async (_e) => {
    await startProcess();
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
