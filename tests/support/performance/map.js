import { useEventBus } from "@vueuse/core";
import { eoxLayersKey } from "@/utils/keys";

/**
 * Keyed on the whole id, which carries the item datetime: a layer whose id
 * changed is a different layer, not the same one rebuilt.
 * @param {any} mapEl
 */
const layersById = (mapEl) =>
  new Map(
    mapEl.map
      .getAllLayers()
      //@ts-expect-error todo
      .filter((layer) => layer.get("id"))
      //@ts-expect-error todo
      .map((layer) => [layer.get("id"), layer]),
  );

/**
 * What only the app can report, taken from its own events and public state. The
 * tile queue counts towards quiescence because image tiles are in flight before
 * the protocol reports them.
 *
 * @param {any} mapEl a mounted `eox-map`
 * @param {ReturnType<typeof import("./clock").createClock>} clock
 */
export const observeMap = (mapEl, clock) => {
  const tileQueue = mapEl.map.tileQueue_;
  if (typeof tileQueue?.getTilesLoading !== "function") {
    throw new Error("`map.tileQueue_` is gone; quiescence would be blind");
  }

  const before = layersById(mapEl);
  // Both only hold the window open while the app is still working.
  const touch = () => clock.touch();
  mapEl.addEventListener("layerschanged", touch);
  const unsubscribe = useEventBus(eoxLayersKey).on(touch);

  return {
    busy: () => tileQueue.getTilesLoading() > 0 || tileQueue.getCount() > 0,
    collect: () => {
      const after = layersById(mapEl);
      return {
        replacedLayers: [...after]
          .filter(([id, layer]) => before.has(id) && before.get(id) !== layer)
          .map(([id]) => id),
      };
    },
    dispose: () => {
      mapEl.removeEventListener("layerschanged", touch);
      unsubscribe();
    },
  };
};
