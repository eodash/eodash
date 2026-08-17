import { useEventBus } from "@vueuse/core";
import { eoxLayersKey } from "@/utils/keys";

/** Layer ids embed the item datetime, which would read as a new layer. */
const stableId = (/** @type {string} */ id) =>
  id
    .split(";:;")
    .filter((part) => !/^\d{4}-\d{2}-\d{2}T/.test(part))
    .join(";:;");

/** @param {any} mapEl */
const layersById = (mapEl) =>
  new Map(
    mapEl.map
      .getAllLayers()
      //@ts-expect-error todo
      .filter((layer) => layer.get("id"))
      //@ts-expect-error todo
      .map((layer) => [stableId(layer.get("id")), layer]),
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
  const sourceBefore = new Map(
    [...before].map(([id, layer]) => [id, layer.getSource?.()]),
  );
  const interactionsBefore = Object.keys(mapEl.selectInteractions ?? {});
  const counts = { layerWrites: 0, busEvents: 0 };

  const countWrite = () => (counts.layerWrites++, clock.touch());
  const countBus = () => (counts.busEvents++, clock.touch());
  mapEl.addEventListener("layerschanged", countWrite);
  const unsubscribe = useEventBus(eoxLayersKey).on(countBus);

  return {
    busy: () => tileQueue.getTilesLoading() > 0 || tileQueue.getCount() > 0,
    collect: () => {
      const after = layersById(mapEl);
      const interactions = Object.keys(mapEl.selectInteractions ?? {});
      return {
        ...counts,
        replacedLayers: [...after]
          .filter(([id, layer]) => before.has(id) && before.get(id) !== layer)
          .map(([id]) => id),
        churnedSources: [...after]
          .filter(
            ([id, layer]) =>
              before.get(id) === layer &&
              sourceBefore.get(id) !== layer.getSource?.(),
          )
          .map(([id]) => id),
        addedInteractions: interactions.filter(
          (id) => !interactionsBefore.includes(id),
        ),
        interactions: interactions.length,
        olLayers: mapEl.map.getAllLayers().length,
        payloadBytes: new TextEncoder().encode(
          JSON.stringify(mapEl.layers ?? []),
        ).length,
      };
    },
    dispose: () => {
      mapEl.removeEventListener("layerschanged", countWrite);
      unsubscribe();
    },
  };
};
