import { beforeEach, describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import EodashDatePicker from "^/EodashDatePicker.vue";
import { datetime } from "@/store/states";
import { eodashCollections, eodashCompareCollections } from "@/utils/states";
import { mountComponent } from "../support/mount";

/**
 * @param {string} selector CSS selector for the date input.
 * @returns {HTMLInputElement | null} The matched input, if present.
 */
const input = (selector) =>
  /** @type {HTMLInputElement | null} */ (document.querySelector(selector));

const TIMEOUT = 1000 * 15;

/**
 * Stand-in EodashCollection exposing only what the datepicker reads.
 * @param {Date[]} dates
 */
const mockCollection = (dates) =>
  /** @type {import("@/eodashSTAC/EodashCollection").EodashCollection} */ (
    /** @type {unknown} */ ({
      color: "#ff0000",
      collectionStac: { id: "coll" },
      fetchCollection: vi.fn().mockResolvedValue(undefined),
      getDates: vi.fn().mockResolvedValue(dates),
    })
  );

describe("EodashDatePicker", () => {
  beforeEach(() => {
    // `datetime` and the collection arrays are module singletons; reset them.
    datetime.value = "";
    eodashCollections.splice(0, eodashCollections.length);
    eodashCompareCollections.splice(0, eodashCompareCollections.length);
  });

  test("renders the calendar", async () => {
    await mountComponent(EodashDatePicker);

    await expect
      .poll(() => document.querySelector(".vc-container"))
      .toBeTruthy();
  });

  test("reflects the global datetime in the input", async () => {
    // Midday UTC so the local-timezone formatDate stays on the same day.
    datetime.value = "2024-06-15T12:00:00.000Z";
    await mountComponent(EodashDatePicker);

    await expect
      .poll(() => input(".datePicker input")?.value)
      .toBe("2024-06-15");
  });

  test("writes a valid typed date to the global datetime", async () => {
    datetime.value = "2024-06-15T12:00:00.000Z";
    await mountComponent(EodashDatePicker);

    const field = input(".datePicker input");
    if (!field) throw new Error("date input not rendered");
    field.value = "2024-03-10";
    field.dispatchEvent(new Event("change", { bubbles: true }));

    await expect.poll(() => datetime.value).toMatch(/^2024-03-10/);
  });

  test("ignores an unparseable typed date", async () => {
    datetime.value = "2024-06-15T12:00:00.000Z";
    await mountComponent(EodashDatePicker);

    const field = input(".datePicker input");
    if (!field) throw new Error("date input not rendered");
    field.value = "not-a-date";
    field.dispatchEvent(new Event("change", { bubbles: true }));

    // The customRef setter validates and no-ops on NaN, so datetime is unchanged.
    expect(datetime.value).toBe("2024-06-15T12:00:00.000Z");
  });

  test("hides the input field when hideInputField is set", async () => {
    await mountComponent(EodashDatePicker, { props: { hideInputField: true } });

    await expect
      .poll(() => document.querySelector(".vc-container"))
      .toBeTruthy();
    expect(input(".datePicker input")).toBeNull();
  });

  test("renders the two jump-date arrow buttons by default", async () => {
    await mountComponent(EodashDatePicker);

    await expect
      .poll(() => document.querySelectorAll(".datePicker .v-btn").length)
      .toBe(2);
  });

  test("hides the arrow buttons when hideArrows is set", async () => {
    await mountComponent(EodashDatePicker, { props: { hideArrows: true } });

    await expect
      .poll(() => document.querySelector(".vc-container"))
      .toBeTruthy();
    expect(document.querySelectorAll(".datePicker .v-btn")).toHaveLength(0);
  });

  test("reflects the datetime in toggleCalendar (default-slot) mode", async () => {
    datetime.value = "2024-06-15T12:00:00.000Z";
    await mountComponent(EodashDatePicker, { props: { toggleCalendar: true } });

    await expect
      .poll(() => input(".datePicker input")?.value)
      .toBe("2024-06-15");
  });

  describe("jump-date arrows", () => {
    const DATES = [
      new Date("2024-01-01T00:00:00Z"),
      new Date("2024-06-15T00:00:00Z"),
      new Date("2024-12-31T00:00:00Z"),
    ];

    /** Mount with one dated collection; returns [oldest, latest] buttons. */
    const mountWithDates = async () => {
      const ec = mockCollection(DATES);
      eodashCollections.push(ec);
      await mountComponent(EodashDatePicker, {
        initialState: { stac: { selectedStac: { id: "coll" } } },
      });
      const [oldest, latest] = document.querySelectorAll(".datePicker .v-btn");
      return { ec, oldest, latest };
    };

    test("jumps to the latest available date from the collection", async () => {
      const { ec, latest } = await mountWithDates();

      // Attributes build async from getDates(); retry the idempotent click.
      await vi.waitFor(
        async () => {
          await userEvent.click(latest);
          expect(datetime.value).toBe("2024-12-31T00:00:00.000Z");
        },
        { timeout: TIMEOUT },
      );
      expect(ec.getDates).toHaveBeenCalled();
    });

    test("jumps to the oldest available date from the collection", async () => {
      const { oldest } = await mountWithDates();

      await vi.waitFor(
        async () => {
          await userEvent.click(oldest);
          expect(datetime.value).toBe("2024-01-01T00:00:00.000Z");
        },
        { timeout: TIMEOUT },
      );
    });
  });
});
