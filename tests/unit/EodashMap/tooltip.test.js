import { describe, expect, test } from "vitest";
import { ref } from "vue";
import { useEventBus } from "@vueuse/core";
import { eoxLayersKey } from "@/utils/keys";
import { useUpdateTooltipProperties } from "^/EodashMap/methods";

describe("useUpdateTooltipProperties", () => {
  test("extracts location tooltip from collection metadata even when item has no tooltips", async () => {
    const tooltipProperties = ref([]);
    const layersBus = useEventBus(eoxLayersKey);

    // Mock reader with locations: true on collection (ec.stac) and an item without style tooltips
    const mockReader = {
      stac: {
        id: "test-collection",
        locations: true,
        links: [],
      },
      item: {
        id: "test-item",
        links: [],
        properties: {},
      },
    };

    useUpdateTooltipProperties([mockReader], tooltipProperties, false);

    // Trigger layers update event
    layersBus.emit("layers:updated");

    // Poll until tooltipProperties contains the Location tooltip
    await expect
      .poll(() => tooltipProperties.value)
      .toEqual([{ id: "title", title: "Location" }]);
  });
});
