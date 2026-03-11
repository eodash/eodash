import { initProcess, updateJsonformIdentifier } from "./handling";
import { updateJsonformSchemaTarget } from "./utils";
import { useEventBus } from "@vueuse/core";
import { nextTick, onMounted, watch, toRaw } from "vue";
import { eoxLayersKey } from "@/utils/keys";
import { useOnLayersUpdate } from "@/composables";
/**
 * Composable resposible of timing the Initialization of the process
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
 * @param {import("@eox/map").EOxMap | null} params.mapElement
 */
export const useInitProcess = ({
  selectedStac,
  jsonformEl,
  jsonformSchema,
  isProcessed,
  processResults,
  loading,
  isPolling,
  mapElement,
}) => {
  const layersEvents = useEventBus(eoxLayersKey);

  onMounted(async () => {
    // wait for the layers to be rendered
    if ((mapElement?.layers.length ?? 0) > 1) {
      await initProcess({
        enableCompare: mapElement?.id === "compare",
        selectedStac,
        jsonformEl,
        jsonformSchema,
        isProcessed,
        processResults,
        loading,
        isPolling,
      });
    } else {
      layersEvents.once(async () => {
        await initProcess({
          enableCompare: mapElement?.id === "compare",
          selectedStac,
          jsonformEl,
          jsonformSchema,
          isProcessed,
          loading,
          processResults,
          isPolling,
        });
      });
    }
  });
  const enableCompare = mapElement?.id === "compare";
  const evtKey = enableCompare ? "compareLayers:updated" : "layers:updated";
  useOnLayersUpdate(async (evt, _payload) => {
    if (
      evt == "layertime:updated" ||
      evt == "compareLayertime:updated" ||
      evt == "time:updated" ||
      evt == "compareTime:updated"
    ) {
      let newJsonForm = null;
      // for checking if changed in updateJsonformIdentifier later
      const originalJsonForm = JSON.stringify(toRaw(jsonformSchema.value));
      newJsonForm = await updateJsonformIdentifier({
        jsonformSchema: jsonformSchema.value,
        // @ts-expect-error TODO payload coming from time update events is not an object with layers property
        newLayers: _payload,
      });
      // we need to purge the jsonform on time change in cases when the feature selection layer was time-based, so that it attaches to a correct new layer
      const didJsonFormChange =
        originalJsonForm !== JSON.stringify(toRaw(newJsonForm));
      if (didJsonFormChange) {
        const shouldMainJsonFormUpdate =
          ["layertime:updated", "time:updated"].includes(evt) && !enableCompare;
        const shouldCompareJsonFormUpdate =
          ["compareLayertime:updated", "compareTime:updated"].includes(evt) &&
          enableCompare;
        if (shouldMainJsonFormUpdate || shouldCompareJsonFormUpdate) {
          await jsonformEl.value?.editor.destroy();
          if (shouldCompareJsonFormUpdate) {
            newJsonForm = updateJsonformSchemaTarget(newJsonForm);
          }
          jsonformSchema.value = null;
          await new Promise((resolve) => setTimeout(resolve, 0));
          jsonformSchema.value = newJsonForm;
        }
      }
    }
    if (evt !== evtKey) {
      return;
    }
    await initProcess({
      enableCompare: mapElement?.id === "compare",
      selectedStac,
      jsonformEl,
      jsonformSchema,
      isProcessed,
      processResults,
      loading,
      isPolling,
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
