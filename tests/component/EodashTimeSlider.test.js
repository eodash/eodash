import { beforeEach, describe, expect, test, vi } from "vitest";
import EodashTimeSlider from "^/EodashTimeSlider/index.vue";
import { createAnimationLayers } from "^/EodashTimeSlider/methods";
import { datetime, mapEl } from "@/store/states";
import { eodashCollections } from "@/utils/states";
import { mountComponent } from "../support/mount";

// Keep the web-component tags (isCustomElement) so event bindings still work.
vi.mock("@eox/timecontrol", () => ({}));
vi.mock("@eox/itemfilter", () => ({}));
vi.mock("^/EodashTimeSlider/methods", () => ({
  createAnimationLayers: vi.fn(),
}));

// vi.hoisted runs before imports, so these shared handles exist when the mock factory evaluates.
const mosaic = vi.hoisted(() => ({
  mosaicEndpoint: { value: /** @type {string | null} */ (null) },
  scheduleMosaicUpdate: vi.fn(),
  useInitMosaic: vi.fn(),
}));
vi.mock("@/eodashSTAC/mosaic", () => ({
  useInitMosaic: mosaic.useInitMosaic,
  useScheduleMosaicUpdate: () => mosaic.scheduleMosaicUpdate,
  useMosaicState: () => ({ mosaicEndpoint: mosaic.mosaicEndpoint }),
}));

/** @returns {(Element & Record<string, any>) | null} The eox-timecontrol element. */
const timecontrol = () => document.querySelector("eox-timecontrol");

const seedMultiItems = () =>
  eodashCollections.push(
    /** @type {any} */ ({
      collectionStac: { links: [{ rel: "item" }, { rel: "item" }] },
    }),
  );

const START = "2023-06-15T00:00:00.000Z";
const RANGE = ["2023-06-15T00:00:00.000Z", "2023-06-16T00:00:00.000Z"];
const FILTER_PROP = [{ keys: ["cloud"], title: "Cloud cover", type: "range" }];

describe("EodashTimeSlider", () => {
  beforeEach(() => {
    // Module singletons the widget reads at setup.
    datetime.value = START;
    mapEl.value = null;
    eodashCollections.splice(0);
    mosaic.mosaicEndpoint.value = null;
    mosaic.scheduleMosaicUpdate.mockClear();
    mosaic.useInitMosaic.mockClear();
    vi.mocked(createAnimationLayers).mockReset();
  });

  test("renders nothing when no collection has multiple items", async () => {
    await mountComponent(EodashTimeSlider);

    await expect.poll(() => timecontrol()).toBeNull();
  });

  test("renders the time control when a collection has multiple item links", async () => {
    seedMultiItems();
    await mountComponent(EodashTimeSlider);

    await expect.poll(() => timecontrol()).toBeTruthy();
  });

  test("renders the time control when a collection has an items link", async () => {
    eodashCollections.push(
      /** @type {any} */ ({ collectionStac: { links: [{ rel: "items" }] } }),
    );
    await mountComponent(EodashTimeSlider);

    await expect.poll(() => timecontrol()).toBeTruthy();
  });

  test("passes initDate derived from datetime and the default animate flag", async () => {
    seedMultiItems();
    await mountComponent(EodashTimeSlider);

    await expect.poll(() => timecontrol()?.initDate).toEqual(["2023-06-15"]);
    expect(timecontrol()?.animate).toBe(true);
  });

  test("forwards a disabled animate flag", async () => {
    seedMultiItems();
    await mountComponent(EodashTimeSlider, { props: { animate: false } });

    await expect.poll(() => timecontrol()?.animate).toBe(false);
  });

  test("renders the item filter only when filters are configured", async () => {
    seedMultiItems();
    await mountComponent(EodashTimeSlider, { props: { filters: FILTER_PROP } });

    await expect
      .poll(() => document.querySelector("eox-itemfilter"))
      .toBeTruthy();
  });

  test("omits the item filter when no filters are configured", async () => {
    seedMultiItems();
    await mountComponent(EodashTimeSlider);
    await expect.poll(() => timecontrol()).toBeTruthy();

    expect(document.querySelector("eox-itemfilter")).toBeNull();
  });

  test("sets datetime to the item closest to the selected from-date", async () => {
    seedMultiItems();
    await mountComponent(EodashTimeSlider);
    await expect.poll(() => timecontrol()).toBeTruthy();

    timecontrol()?.dispatchEvent(
      new CustomEvent("select", {
        detail: {
          date: RANGE,
          selectedItems: {
            layerA: [
              { originalDate: "2023-06-10T00:00:00.000Z" },
              { originalDate: "2023-06-14T00:00:00.000Z" },
            ],
          },
        },
      }),
    );

    await expect.poll(() => datetime.value).toBe("2023-06-14T00:00:00.000Z");
  });

  test("leaves datetime untouched when the selection has no items", async () => {
    seedMultiItems();
    await mountComponent(EodashTimeSlider);
    await expect.poll(() => timecontrol()).toBeTruthy();

    timecontrol()?.dispatchEvent(
      new CustomEvent("select", { detail: { date: RANGE, selectedItems: {} } }),
    );

    expect(datetime.value).toBe(START);
  });

  test("schedules a mosaic update instead of moving datetime when mosaic is enabled", async () => {
    mosaic.mosaicEndpoint.value = "https://mosaic";
    seedMultiItems();
    await mountComponent(EodashTimeSlider, { props: { useMosaic: true } });
    await expect.poll(() => timecontrol()).toBeTruthy();

    timecontrol()?.dispatchEvent(
      new CustomEvent("select", {
        detail: {
          date: RANGE,
          selectedItems: { a: [{ originalDate: "2023-06-14T00:00:00.000Z" }] },
        },
      }),
    );

    expect(mosaic.scheduleMosaicUpdate).toHaveBeenCalledWith(
      "https://mosaic",
      RANGE,
      {},
    );
    expect(datetime.value).toBe(START);
  });

  test("schedules a mosaic update on filter change when mosaic is enabled", async () => {
    mosaic.mosaicEndpoint.value = "https://mosaic";
    seedMultiItems();
    await mountComponent(EodashTimeSlider, {
      props: { useMosaic: true, filters: FILTER_PROP },
    });
    await expect
      .poll(() => document.querySelector("eox-itemfilter"))
      .toBeTruthy();

    // Distinct from the derived default, to prove the handler reads live selectedRange.
    const selected = ["2023-06-20T00:00:00.000Z", "2023-06-21T00:00:00.000Z"];
    timecontrol()?.dispatchEvent(
      new CustomEvent("select", {
        detail: { date: selected, selectedItems: {} },
      }),
    );

    const filters = { cloud: 20 };
    document
      .querySelector("eox-itemfilter")
      ?.dispatchEvent(new CustomEvent("filter", { detail: { filters } }));

    expect(mosaic.scheduleMosaicUpdate).toHaveBeenLastCalledWith(
      "https://mosaic",
      selected,
      filters,
    );
  });

  test("ignores filter changes when mosaic is disabled", async () => {
    seedMultiItems();
    await mountComponent(EodashTimeSlider, { props: { filters: FILTER_PROP } });
    await expect
      .poll(() => document.querySelector("eox-itemfilter"))
      .toBeTruthy();

    document
      .querySelector("eox-itemfilter")
      ?.dispatchEvent(
        new CustomEvent("filter", { detail: { filters: { cloud: 20 } } }),
      );

    expect(mosaic.scheduleMosaicUpdate).not.toHaveBeenCalled();
  });

  test("generates animation layers and calls generate on export", async () => {
    seedMultiItems();
    const mapLayers = [{ layers: [], date: "2023-06-15" }];
    vi.mocked(createAnimationLayers).mockResolvedValue(mapLayers);
    await mountComponent(EodashTimeSlider, {
      initialState: { stac: { stacEndpoint: "https://stac" } },
    });
    await expect
      .poll(() => document.querySelector("eox-timecontrol-timelapse"))
      .toBeTruthy();

    const generate = vi.fn();
    document.querySelector("eox-timecontrol-timelapse")?.dispatchEvent(
      new CustomEvent("export", {
        detail: { generate, selectedRangeItems: {}, filters: {} },
      }),
    );

    await expect.poll(() => generate).toHaveBeenCalledWith({ mapLayers });
  });

  test("does nothing on export without a stac endpoint", async () => {
    seedMultiItems();
    await mountComponent(EodashTimeSlider);
    await expect
      .poll(() => document.querySelector("eox-timecontrol-timelapse"))
      .toBeTruthy();

    const generate = vi.fn();
    document.querySelector("eox-timecontrol-timelapse")?.dispatchEvent(
      new CustomEvent("export", {
        detail: { generate, selectedRangeItems: {}, filters: {} },
      }),
    );

    expect(vi.mocked(createAnimationLayers)).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
  });

  test("skips generate when no animation layers are produced", async () => {
    seedMultiItems();
    vi.mocked(createAnimationLayers).mockResolvedValue([]);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await mountComponent(EodashTimeSlider, {
      initialState: { stac: { stacEndpoint: "https://stac" } },
    });
    await expect
      .poll(() => document.querySelector("eox-timecontrol-timelapse"))
      .toBeTruthy();

    const generate = vi.fn();
    document.querySelector("eox-timecontrol-timelapse")?.dispatchEvent(
      new CustomEvent("export", {
        detail: { generate, selectedRangeItems: {}, filters: {} },
      }),
    );

    await expect.poll(() => warn).toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
