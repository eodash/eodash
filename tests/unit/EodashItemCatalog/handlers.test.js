import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { ref } from "vue";
import { createOnSelectHandler } from "^/EodashItemCatalog/methods/handlers";
import { useSTAcStore } from "@/store/stac";

// Node-hostile, transitively pulled in by the store/helpers chain.
vi.mock("@eox/layercontrol", () => ({
  updateVectorLayerStyle: (/** @type {Record<string, unknown>} */ s) => s,
}));
vi.mock("webfontloader", () => ({ default: { load: () => {} } }));

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

describe("createOnSelectHandler", () => {
  /** No collection is selected yet, so selecting an item loads its collection. */
  const setupStore = () => {
    const store = useSTAcStore();
    vi.spyOn(store, "loadSelectedSTAC").mockResolvedValue(undefined);
    return store;
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    axiosMock.get.mockReset();
  });

  test("fetches a result trimmed by the search in full before rendering it", async () => {
    const fullItem = { id: "i1", collection: "c1", links: [], assets: {} };
    axiosMock.get.mockResolvedValue({ data: fullItem });
    const store = setupStore();
    const onSelect = createOnSelectHandler(
      store,
      false,
      ref(null),
      ref("https://stac"),
    );

    await onSelect(
      new CustomEvent("select", { detail: { id: "i1", collection: "c1" } }),
    );

    expect(axiosMock.get).toHaveBeenCalledWith(
      "https://stac/collections/c1/items/i1",
    );
    expect(store.loadSelectedSTAC).toHaveBeenCalledWith("c1", false, fullItem);
  });

  test("renders a full search result as it is, without fetching it again", async () => {
    const item = { id: "i1", collection: "c1", links: [], assets: {} };
    const store = setupStore();
    const onSelect = createOnSelectHandler(
      store,
      false,
      ref(null),
      ref("https://stac"),
    );

    await onSelect(new CustomEvent("select", { detail: item }));

    expect(axiosMock.get).not.toHaveBeenCalled();
    expect(store.loadSelectedSTAC).toHaveBeenCalledWith("c1", false, item);
  });
});
