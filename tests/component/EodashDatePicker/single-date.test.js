import { beforeEach, describe, expect, test, vi } from "vitest";
import EodashDatePicker from "^/EodashDatePicker.vue";
import { datetime } from "@/store/states";
import {
  eodashCollections,
  eodashCompareCollections,
  useSTAcStore,
} from "@/store/stac";
import { mountComponent } from "../../support/mount";

vi.mock("@eox/timecontrol", () => ({}));

const FIRST = "2024-06-15T12:00:00.000Z";
const SECOND = "2024-06-15T13:00:00.000Z";

/** @param {string} id @param {string[]} dates */
function reader(id, dates) {
  return /** @type {import("@eodash/stac").Reader} */ (
    /** @type {unknown} */ ({
      stac: { id },
      getDates: vi.fn().mockResolvedValue(dates.map((date) => new Date(date))),
    })
  );
}

/** @returns {HTMLElement | null} */
const picker = () => document.querySelector(".datePicker");

/**
 * @param {string[]} dates
 * @param {string[]} [compareDates]
 * @param {boolean} [toggleCalendar]
 */
async function mountWithDates(
  dates,
  compareDates = [],
  toggleCalendar = false,
) {
  if (dates.length) eodashCollections.push(reader("main", dates));
  if (compareDates.length) {
    eodashCompareCollections.push(reader("compare", compareDates));
  }
  await mountComponent(EodashDatePicker, {
    props: { toggleCalendar },
    initialState: {
      stac: {
        selectedStac: dates.length ? { id: "main" } : null,
        selectedCompareStac: compareDates.length ? { id: "compare" } : null,
      },
    },
  });
  await expect
    .poll(() => {
      const control =
        /** @type {(HTMLElement & { controlValues?: import("@/types").DatePickerControlValue[] }) | null} */ (
          document.querySelector("eox-timecontrol")
        );
      return control?.controlValues?.length;
    })
    .toBe(Number(dates.length > 0) + Number(compareDates.length > 0));
}

describe("single-date picker visibility", () => {
  beforeEach(() => {
    datetime.value = "";
    eodashCollections.splice(0);
    eodashCompareCollections.splice(0);
  });

  test.each([false, true])(
    "hides the entire picker and arrows for one timestamp (popup=%s)",
    async (toggleCalendar) => {
      await mountWithDates([FIRST], [], toggleCalendar);

      await expect.poll(() => picker()?.checkVisibility()).toBe(false);
      const arrows = picker()?.querySelectorAll(".v-btn");
      expect(arrows).toHaveLength(2);
      for (const arrow of arrows ?? []) {
        expect(arrow.checkVisibility()).toBe(false);
      }
    },
  );

  test("does not count duplicate timestamps as additional dates", async () => {
    await mountWithDates([FIRST, FIRST]);

    await expect.poll(() => picker()?.checkVisibility()).toBe(false);
  });

  test("hides when main and compare share their only timestamp", async () => {
    await mountWithDates([FIRST], [FIRST]);

    await expect.poll(() => picker()?.checkVisibility()).toBe(false);
  });

  test("stays visible for distinct timestamps on the same day", async () => {
    await mountWithDates([FIRST, SECOND]);

    await expect.poll(() => picker()?.checkVisibility()).toBe(true);
  });

  test("stays visible when main and compare have different single dates", async () => {
    await mountWithDates([FIRST], [SECOND]);

    await expect.poll(() => picker()?.checkVisibility()).toBe(true);
  });

  test("hides when only the compare collection provides one date", async () => {
    await mountWithDates([], [FIRST]);

    await expect.poll(() => picker()?.checkVisibility()).toBe(false);
  });

  test("updates visibility when switching between single-date and multi-date collections", async () => {
    await mountWithDates([FIRST]);
    await expect.poll(() => picker()?.checkVisibility()).toBe(false);

    const store = useSTAcStore();
    eodashCollections.splice(
      0,
      eodashCollections.length,
      reader("multi", [FIRST, SECOND]),
    );
    store.selectedStac = /** @type {import("@eodash/stac").STACCollection} */ (
      /** @type {unknown} */ ({ id: "multi" })
    );
    await expect.poll(() => picker()?.checkVisibility()).toBe(true);

    eodashCollections.splice(
      0,
      eodashCollections.length,
      reader("single", [FIRST]),
    );
    store.selectedStac = /** @type {import("@eodash/stac").STACCollection} */ (
      /** @type {unknown} */ ({ id: "single" })
    );
    await expect.poll(() => picker()?.checkVisibility()).toBe(false);
  });

  test("leaves existing no-date behavior unchanged", async () => {
    await mountWithDates([]);

    await expect.poll(() => picker()?.checkVisibility()).toBe(true);
  });
});
