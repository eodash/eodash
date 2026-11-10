import { beforeEach, describe, expect, test, vi } from "vitest";
import { createEodashCollection } from "@eodash/stac";
import EodashDatePicker from "^/EodashDatePicker.vue";
import { datetime } from "@/store/states";
import {
  eodashCollections,
  eodashCompareCollections,
  useSTAcStore,
} from "@/store/stac";
import { mountComponent } from "../../support/mount";

vi.mock("@eox/timecontrol", () => ({}));

const CHILD_URL =
  "https://gtif-cerulean.github.io/cerulean-catalog/cerulean/harshness/harshness/collection.json";
const GENERATED = "2026-11-08T15:32:10.940089Z";

// Reduced metadata from the published Harshness indicator and its static child:
// the indicator's extent is a single timestamp, but neither has dated items.
/** @type {import("@eodash/stac").STACCollection} */
const CHILD = {
  type: "Collection",
  stac_version: "1.1.0",
  id: "harshness",
  title: "Harshness Index",
  description: "Static Harshness processing collection",
  license: "proprietary",
  extent: {
    spatial: { bbox: [[-179, 55, 179, 89]] },
    temporal: { interval: [[GENERATED, null]] },
  },
  links: [
    { rel: "root", href: "../../catalog.json" },
    { rel: "parent", href: "../collection.json" },
  ],
};

/** @type {import("@eodash/stac").STACCollection} */
const INDICATOR = {
  ...CHILD,
  extent: {
    ...CHILD.extent,
    temporal: { interval: [[GENERATED, GENERATED]] },
  },
  links: [{ rel: "child", href: "./harshness/collection.json" }],
};

/** @returns {HTMLElement | null} */
const picker = () => document.querySelector(".datePicker");

/** @param {boolean} compare */
async function mountHarshness(compare) {
  const get = vi
    .fn()
    .mockRejectedValue(new Error("Unexpected network request"));
  const collection = await createEodashCollection(CHILD_URL, {
    stac: CHILD,
    client: { get },
  });
  expect(await collection.getDates()).toEqual([]);
  const getDates = vi.spyOn(collection, "getDates");
  (compare ? eodashCompareCollections : eodashCollections).push(collection);

  await mountComponent(EodashDatePicker, {
    initialState: {
      stac: {
        selectedStac: compare ? null : INDICATOR,
        selectedCompareStac: compare ? INDICATOR : null,
      },
    },
  });
  await expect.poll(() => getDates).toHaveBeenCalled();
  expect(get).not.toHaveBeenCalled();
}

describe("date picker for non-temporal collections", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    datetime.value = "";
    eodashCollections.splice(0);
    eodashCompareCollections.splice(0);
  });

  test.each([false, true])(
    "hides the Harshness picker with an empty reader timeline (compare=%s)",
    async (compare) => {
      await mountHarshness(compare);

      await expect.poll(() => picker()?.checkVisibility()).toBe(false);
      const arrows = picker()?.querySelectorAll(".v-btn");
      expect(arrows).toHaveLength(2);
      for (const arrow of arrows ?? []) {
        expect(arrow.checkVisibility()).toBe(false);
      }
    },
  );

  test("shows navigation again after switching from Harshness to a dated collection", async () => {
    await mountHarshness(false);
    await expect.poll(() => picker()?.checkVisibility()).toBe(false);

    /** @type {import("@eodash/stac").STACCollection} */
    const dated = {
      ...CHILD,
      id: "dated",
      extent: {
        ...CHILD.extent,
        temporal: {
          interval: [["2024-01-01T00:00:00Z", "2024-02-01T00:00:00Z"]],
        },
      },
      links: [
        { rel: "item", href: "first.json", datetime: "2024-01-01T00:00:00Z" },
        { rel: "item", href: "last.json", datetime: "2024-02-01T00:00:00Z" },
      ],
    };
    const collection = await createEodashCollection(CHILD_URL, {
      stac: dated,
      client: {
        get: vi.fn().mockRejectedValue(new Error("Unexpected network request")),
      },
    });
    eodashCollections.splice(0, eodashCollections.length, collection);
    useSTAcStore().selectedStac = dated;

    await expect.poll(() => picker()?.checkVisibility()).toBe(true);
  });
});
