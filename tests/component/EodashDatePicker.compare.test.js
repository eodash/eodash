import { beforeEach, describe, expect, test } from "vitest";
import EodashDatePicker from "^/EodashDatePicker.vue";
import { datetime } from "@/store/states";
import { eodashCollections, eodashCompareCollections } from "@/store/stac";
import { mountComponent } from "../support/mount";

import { createDatePickerReader } from "../support/datepicker-reader";

/** @returns {import("@eox/timecontrol").EOxTimeControl | null} */
const timecontrol = () => document.querySelector("eox-timecontrol");

describe("EodashDatePicker comparison with real EOxTimeControl", () => {
  beforeEach(() => {
    datetime.value = "2024-06-15T00:00:00.000Z";
    eodashCollections.splice(0);
    eodashCompareCollections.splice(0);
  });

  test("initializes one group for the same collection on both maps", async () => {
    eodashCollections.push(
      createDatePickerReader("shared", "Shared collection", {
        self: "./shared.json",
      }),
    );
    eodashCompareCollections.push(
      createDatePickerReader("shared", "Shared collection", {
        color: "#0000ff",
        self: "https://example.test/collections/shared.json",
      }),
    );

    await mountComponent(EodashDatePicker, {
      initialState: {
        stac: {
          selectedStac: { id: "shared" },
          selectedCompareStac: { id: "shared" },
        },
      },
    });

    await expect.poll(() => timecontrol()?.groups.length).toBe(1);
    expect(timecontrol()?.groups.getIds()).toEqual(["Shared collection"]);
    expect(timecontrol()?.items.length).toBe(1);
    await expect
      .poll(() => timecontrol()?.getTimeControlPicker()?.cal)
      .toBeTruthy();
  });

  test("initializes separate groups for different collections", async () => {
    eodashCollections.push(
      createDatePickerReader("primary", "Primary collection"),
    );
    eodashCompareCollections.push(
      createDatePickerReader("compare", "Comparison collection", {
        color: "#0000ff",
      }),
    );

    await mountComponent(EodashDatePicker, {
      initialState: {
        stac: {
          selectedStac: { id: "primary" },
          selectedCompareStac: { id: "compare" },
        },
      },
    });

    await expect.poll(() => timecontrol()?.groups.length).toBe(2);
    expect(timecontrol()?.groups.getIds()).toEqual([
      "Primary collection",
      "Comparison collection",
    ]);
    expect(timecontrol()?.items.length).toBe(2);
    await expect
      .poll(() => timecontrol()?.getTimeControlPicker()?.cal)
      .toBeTruthy();
  });
});
