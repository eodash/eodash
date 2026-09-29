/**
 * The EOPF explorer fixture behind the bands-editor row, and the setup that
 * opens the editor. The fixture is fetched once per run in `vitest.config.js`.
 */
import { inject } from "vitest";
import { bootBench, waitUntil } from "./bench";
import { MAP_ONLY } from "./template";

export const INDICATOR_ID = "bands";

/** The zarr door: a `style` link carrying `jsonform`, matched by `asset:keys`. */
export const { zarrAssetName, zarrAsset, style } = inject("geozarrFixture");

/** The enum a `format: "bands"` schema offers. @param {any} schema */
export const bandsOf = (schema) => schema?.items?.enum ?? schema?.enum ?? [];

const MAP_AND_CONTROL = {
  ...MAP_ONLY,
  widgets: [
    {
      id: "Layercontrol",
      type: "internal",
      title: "Layers",
      layout: { x: 0, y: 1, w: "3/3/2", h: 10 },
      widget: { name: "EodashLayerControl" },
    },
  ],
};

/**
 * Boot one indicator and open its layer's bands editor.
 *
 * @param {{get: import("vitest").Mock}} axiosMock
 * @param {{routes: Record<string, any>, hrefOf: (id: string) => string}} catalog
 */
export const openBandsEditor = async (axiosMock, catalog) => {
  const booted = await bootBench(axiosMock, catalog, {
    template: "bench",
    over: { templates: { bench: MAP_AND_CONTROL } },
  });
  const { query, store, getLayerId } = booted;

  await store.loadSelectedSTAC(catalog.hrefOf(INDICATOR_ID));
  await waitUntil(() => Boolean(getLayerId()), "the layer never rendered");

  // Two shadow hops: the control's own root, then the per-layer tools. What is
  // between them renders flat.
  const layerRow = () =>
    query("eox-layercontrol")?.shadowRoot?.querySelector(
      `li[data-layer="${getLayerId()}"]`,
    );
  await waitUntil(() => Boolean(layerRow()), "the layer row never rendered");

  // The tools accordion starts closed.
  layerRow().querySelector("nav button.action.tools")?.click();

  const editor = () =>
    layerRow()?.querySelector("eox-layercontrol-layer-tools")?.shadowRoot;
  await waitUntil(
    () => Boolean(editor()?.querySelector("[data-slot='R']")),
    "the bands editor never rendered",
  );

  /**
   * One HTML5 drag. `userEvent.dragAndDrop` performs a mouse drag, which never
   * produces `dragstart`/`drop`; both events share one `DataTransfer` so the
   * band round-trips exactly as a real drag does.
   * @param {string} band
   */
  const dropOnRed = (band) => {
    const dataTransfer = new DataTransfer();
    editor()
      .querySelector(`[data-band="${band}"]`)
      .dispatchEvent(
        new DragEvent("dragstart", { dataTransfer, bubbles: true }),
      );
    const slot = editor().querySelector("[data-slot='R']");
    slot.dispatchEvent(
      new DragEvent("dragover", {
        dataTransfer,
        bubbles: true,
        cancelable: true,
      }),
    );
    slot.dispatchEvent(new DragEvent("drop", { dataTransfer, bubbles: true }));
  };

  return { ...booted, dropOnRed };
};
