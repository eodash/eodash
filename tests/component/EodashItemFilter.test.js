import { beforeEach, describe, expect, test, vi } from "vitest";
import { useSTAcStore } from "@/store/stac";
import { isFirstLoad } from "@/utils/states";
import EodashItemFilter from "^/EodashItemFilter.vue";
import { mountAsyncComponent } from "../support/mount";

// Don't load the real eox-itemfilter; the tag still renders and we drive `select` directly.
vi.mock("@eox/itemfilter", () => ({}));

/** @param {unknown} detail */
const dispatchSelect = (detail) =>
  document
    .querySelector("eox-itemfilter")
    ?.dispatchEvent(new CustomEvent("select", { detail }));

/** The rendered eox-itemfilter element (with its bound `.items`). */
const filterEl = () =>
  /** @type {(HTMLElement & { items?: unknown[] }) | null} */ (
    document.querySelector("eox-itemfilter")
  );

describe("EodashItemFilter", () => {
  beforeEach(() => {
    // isFirstLoad is a module singleton.
    isFirstLoad.value = true;
  });

  test("loads the selected item by href in static-catalog mode", async () => {
    await mountAsyncComponent(EodashItemFilter);
    const store = useSTAcStore();
    /** @type {boolean | undefined} */
    let firstLoadWhenLoaderRan;
    vi.mocked(store.loadSelectedSTAC).mockImplementation(async () => {
      firstLoadWhenLoaderRan = isFirstLoad.value;
    });

    dispatchSelect({ href: "collection-a", rel: "child" });

    await expect
      .poll(() => store.loadSelectedSTAC)
      .toHaveBeenCalledWith("collection-a");
    // The first-load guard must flip before the loader runs, or the map jumps
    // to the initial position mid-load.
    expect(firstLoadWhenLoaderRan).toBe(false);
    expect(isFirstLoad.value).toBe(false);
  });

  test("loads the selected item by id in API mode", async () => {
    await mountAsyncComponent(EodashItemFilter, {
      initialState: { stac: { isApi: true } },
    });
    const store = useSTAcStore();

    dispatchSelect({ id: "coll-id", href: "ignored" });

    await expect
      .poll(() => store.loadSelectedSTAC)
      .toHaveBeenCalledWith("coll-id");
  });

  test("clears the selection on deselect", async () => {
    await mountAsyncComponent(EodashItemFilter, {
      initialState: { stac: { selectedStac: { id: "x" } } },
    });
    const store = useSTAcStore();

    dispatchSelect(null);

    await expect.poll(() => store.selectedStac).toBeNull();
  });

  test("loads the compare item when enableCompare is set", async () => {
    await mountAsyncComponent(EodashItemFilter, {
      props: { enableCompare: true },
    });
    const store = useSTAcStore();

    dispatchSelect({ href: "compare-coll" });

    await expect
      .poll(() => store.loadSelectedCompareSTAC)
      .toHaveBeenCalledWith("compare-coll");
  });

  test("resets the compare selection on deselect", async () => {
    await mountAsyncComponent(EodashItemFilter, {
      props: { enableCompare: true },
    });
    const store = useSTAcStore();

    dispatchSelect(null);

    await expect.poll(() => store.resetSelectedCompareSTAC).toHaveBeenCalled();
  });

  test("passes only child links to the filter in static-catalog mode", async () => {
    await mountAsyncComponent(EodashItemFilter, {
      initialState: {
        stac: {
          stac: [
            { rel: "child", id: "a", href: "a" },
            { rel: "parent", id: "b", href: "b" },
            { rel: "child", id: "c", href: "c" },
          ],
        },
      },
    });

    await expect.poll(() => filterEl()?.items?.length).toBe(2);
  });

  test("renders the default filter and results titles", async () => {
    const { screen } = await mountAsyncComponent(EodashItemFilter);

    await expect.element(screen.getByText("Indicators")).toBeInTheDocument();
    await expect.element(screen.getByText("Results")).toBeInTheDocument();
  });

  test("renders custom filter and results titles", async () => {
    const { screen } = await mountAsyncComponent(EodashItemFilter, {
      props: { filtersTitle: "Datasets", resultsTitle: "Matches" },
    });

    await expect.element(screen.getByText("Datasets")).toBeInTheDocument();
    await expect.element(screen.getByText("Matches")).toBeInTheDocument();
  });
});
