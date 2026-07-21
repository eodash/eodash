import { beforeEach, describe, expect, test } from "vitest";
import EodashDatePicker from "^/EodashDatePicker.vue";
import { datetime } from "@/store/states";
import { mountComponent } from "../support/mount";

/**
 * @param {string} selector CSS selector for the date input.
 * @returns {HTMLInputElement | null} The matched input, if present.
 */
const input = (selector) =>
  /** @type {HTMLInputElement | null} */ (document.querySelector(selector));

describe("EodashDatePicker", () => {
  beforeEach(() => {
    // `datetime` is a module singleton; reset it so tests don't bleed.
    datetime.value = "";
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
});
