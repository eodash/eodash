import { beforeEach, describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import EodashDatePicker from "^/EodashDatePicker.vue";
import { datetime } from "@/store/states";
import { eodashCollections, eodashCompareCollections } from "@/utils/states";
import { mountComponent, stubCustomElement } from "../support/mount";

// Keep the web-component tags (isCustomElement) so property bindings still work.
vi.mock("@eox/timecontrol", () => ({}));

/** @type {[string, string][]} Ranges the widget pushed into the calendar. */
const dateChanges = [];

stubCustomElement(
  "eox-timecontrol",
  class extends HTMLElement {
    /** @param {[string, string]} range */
    dateChange = (range) => dateChanges.push(range);
    getTimeControlPicker() {
      return this.querySelector("eox-timecontrol-picker");
    }
  },
);

stubCustomElement(
  "eox-timecontrol-date",
  class extends HTMLElement {
    connectedCallback() {
      if (!this.shadowRoot) {
        this.attachShadow({ mode: "open" }).innerHTML =
          '<button style="height:40px;width:40px"></button>' +
          "<input readonly />" +
          '<button style="height:40px;width:40px"></button>';
      }
    }
  },
);

const calls = { show: 0, hide: 0 };

/**
 * Give the stubbed picker a calendar to open.
 * @returns {HTMLElement} The stand-in popup.
 */
const stubCalendar = () => {
  const mainElement = document.createElement("div");
  document.body.append(mainElement);
  const el = picker();
  if (el) {
    el.cal = {
      show: () => calls.show++,
      hide: () => calls.hide++,
      context: { mainElement },
    };
  }
  return mainElement;
};

/**
 * @param {number} x
 * @param {number} y
 */
const moveTo = (x, y) =>
  dateField()?.dispatchEvent(
    new MouseEvent("mousemove", { clientX: x, clientY: y, bubbles: true }),
  );

/** @returns {DOMRect} The date field's box, which drives the hover check. */
const fieldBox = () => {
  const box = dateField()
    ?.shadowRoot?.querySelector("input")
    ?.getBoundingClientRect();
  if (!box) throw new Error("date field not rendered");
  return box;
};

/** @returns {(Element & Record<string, any>) | null} The eox-timecontrol element. */
const timecontrol = () => document.querySelector("eox-timecontrol");

/** @returns {(Element & Record<string, any>) | null} The calendar element. */
const picker = () => document.querySelector("eox-timecontrol-picker");

/** @returns {(Element & Record<string, any>) | null} The date field. */
const dateField = () => document.querySelector("eox-timecontrol-date");

/**
 * Dispatch the `select` event eox fires once a date is picked.
 * @param {string} iso
 */
const selectDate = (iso) =>
  timecontrol()?.dispatchEvent(
    new CustomEvent("select", {
      detail: { date: [new Date(iso), new Date(iso)] },
    }),
  );

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
    dateChanges.length = 0;
    calls.show = 0;
    calls.hide = 0;
  });

  test("renders the calendar", async () => {
    await mountComponent(EodashDatePicker);

    await expect.poll(() => picker()).toBeTruthy();
  });

  test("reflects the global datetime in the date field", async () => {
    datetime.value = "2024-06-15T12:00:00.000Z";
    await mountComponent(EodashDatePicker);

    await expect
      .poll(() => timecontrol()?.initDate)
      .toEqual(["2024-06-15T12:00:00.000Z"]);
  });

  test("passes no initDate while the datetime is empty", async () => {
    await mountComponent(EodashDatePicker);

    // An empty datetime reaches the date field as a literal "Invalid Date".
    await expect.poll(() => timecontrol()?.initDate).toBeNull();
  });

  test("writes a valid selected date to the global datetime", async () => {
    datetime.value = "2024-06-15T12:00:00.000Z";
    await mountComponent(EodashDatePicker);

    selectDate("2024-03-10T00:00:00.000Z");

    await expect.poll(() => datetime.value).toMatch(/^2024-03-10/);
  });

  test("ignores an unparseable selected date", async () => {
    datetime.value = "2024-06-15T12:00:00.000Z";
    await mountComponent(EodashDatePicker);

    selectDate("not-a-date");

    // The customRef setter validates and no-ops on NaN, so datetime is unchanged.
    expect(datetime.value).toBe("2024-06-15T12:00:00.000Z");
  });

  test("hides the input field when hideInputField is set", async () => {
    await mountComponent(EodashDatePicker, { props: { hideInputField: true } });

    await expect.poll(() => picker()).toBeTruthy();
    expect(dateField()).toBeNull();
  });

  test("renders the two jump-date arrow buttons by default", async () => {
    await mountComponent(EodashDatePicker);

    await expect
      .poll(() => document.querySelectorAll(".datePicker .v-btn").length)
      .toBe(2);
  });

  test("hides the arrow buttons when hideArrows is set", async () => {
    await mountComponent(EodashDatePicker, { props: { hideArrows: true } });

    await expect.poll(() => picker()).toBeTruthy();
    expect(document.querySelectorAll(".datePicker .v-btn")).toHaveLength(0);
    // The same flag turns off eox's own prev/next stepper.
    expect(dateField()?.navigation).toBe(false);
  });

  test("reflects the datetime in toggleCalendar (popup) mode", async () => {
    datetime.value = "2024-06-15T12:00:00.000Z";
    await mountComponent(EodashDatePicker, { props: { toggleCalendar: true } });

    await expect.poll(() => picker()?.popup).toBe(true);
    expect(timecontrol()?.initDate).toEqual(["2024-06-15T12:00:00.000Z"]);
  });

  describe("datetime sync", () => {
    test("pushes a datetime change made elsewhere into the calendar", async () => {
      datetime.value = "2024-06-15T12:00:00.000Z";
      await mountComponent(EodashDatePicker);
      await expect.poll(() => timecontrol()).toBeTruthy();

      datetime.value = "2024-08-01T09:00:00.000Z";

      await expect
        .poll(() => dateChanges.at(-1))
        .toEqual(["2024-08-01T09:00:00.000Z", "2024-08-01T09:00:00.000Z"]);
    });

    test("does not echo a selection back into the calendar", async () => {
      datetime.value = "2024-06-15T12:00:00.000Z";
      await mountComponent(EodashDatePicker);
      await expect.poll(() => timecontrol()).toBeTruthy();

      selectDate("2024-03-10T00:00:00.000Z");

      await expect.poll(() => datetime.value).toBe("2024-03-10T00:00:00.000Z");
      expect(dateChanges).toEqual([]);
    });

    test("skips the push when the datetime stays on the same UTC day", async () => {
      datetime.value = "2024-03-10T00:00:00.000Z";
      await mountComponent(EodashDatePicker);
      await expect.poll(() => timecontrol()).toBeTruthy();
      selectDate("2024-03-10T00:00:00.000Z");

      datetime.value = "2024-03-10T18:30:00.000Z";

      await expect.poll(() => dateChanges).toEqual([]);
    });
  });

  describe("hover", () => {
    /** Mount in popup mode with a calendar ready to open. */
    const mountHoverable = async () => {
      await mountComponent(EodashDatePicker, {
        props: { toggleCalendar: true },
      });
      await expect.poll(() => picker()).toBeTruthy();
      return stubCalendar();
    };

    test("opens the calendar when the pointer is over the field", async () => {
      await mountHoverable();
      const box = fieldBox();

      moveTo(box.left + box.width / 2, box.top + box.height / 2);

      expect(calls.show).toBeGreaterThan(0);
    });

    test("stays closed when the pointer is beside the field", async () => {
      await mountHoverable();
      const box = fieldBox();

      // Where the arrows sit: inside the row, outside the field's own column.
      moveTo(box.right + 20, box.top + box.height / 2);

      expect(calls.show).toBe(0);
    });

    test("opens across the full height of the field's column", async () => {
      await mountHoverable();
      const box = fieldBox();

      // The field's own top edge would otherwise leave a dead strip.
      moveTo(box.left + box.width / 2, box.top - 3);

      expect(calls.show).toBeGreaterThan(0);
    });

    test("does not open the calendar outside popup mode", async () => {
      await mountComponent(EodashDatePicker);
      await expect.poll(() => picker()).toBeTruthy();
      stubCalendar();
      const box = fieldBox();

      moveTo(box.left + box.width / 2, box.top + box.height / 2);

      expect(calls.show).toBe(0);
    });

    test("closes when the pointer leaves for neither the field nor the popup", async () => {
      await mountHoverable();

      dateField()?.dispatchEvent(
        new MouseEvent("mouseleave", { relatedTarget: document.body }),
      );

      expect(calls.hide).toBe(1);
    });

    test("stays open when the pointer moves onto the popup", async () => {
      const popup = await mountHoverable();

      dateField()?.dispatchEvent(
        new MouseEvent("mouseleave", { relatedTarget: popup }),
      );

      expect(calls.hide).toBe(0);
    });
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

      // Control values build async from getDates(); retry the idempotent click.
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
