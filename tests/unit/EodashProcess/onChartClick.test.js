import { describe, expect, test, vi, beforeEach } from "vitest";
import { onChartClick } from "^/EodashProcess/methods/handling";
import { datetime } from "@/store/states";

describe("onChartClick", () => {
  beforeEach(() => {
    datetime.value = "";
    vi.restoreAllMocks();
  });

  const createEvent = (spec, datum, nestedDatum = null) => {
    const item = { datum };
    if (nestedDatum) {
      item.datum = { datum: nestedDatum };
    }
    return {
      target: { spec },
      detail: { item },
    };
  };

  test("does nothing if spec or datum is missing", () => {
    onChartClick({ target: {}, detail: {} });
    expect(datetime.value).toBe("");
  });

  test("updates datetime from top-level datum", () => {
    const spec = {
      encoding: {
        x: { field: "timestamp", type: "temporal" },
      },
    };
    const datum = { timestamp: "2023-01-01T12:00:00Z" };
    const evt = createEvent(spec, datum);

    onChartClick(evt);

    expect(datetime.value).toBe("2023-01-01T12:00:00.000Z");
  });

  test("updates datetime from nested datum (handling vega nesting)", () => {
    const spec = {
      encoding: {
        x: { field: "timestamp", type: "temporal" },
      },
    };
    const nestedDatum = { timestamp: "2023-02-02T10:00:00Z" };
    const evt = createEvent(spec, {}, nestedDatum);

    onChartClick(evt);

    expect(datetime.value).toBe("2023-02-02T10:00:00.000Z");
  });

  test("does nothing if no temporal field is found", () => {
    const spec = {
      encoding: {
        x: { field: "value", type: "quantitative" },
      },
    };
    const datum = { value: 100 };
    const evt = createEvent(spec, datum);

    onChartClick(evt);

    expect(datetime.value).toBe("");
  });

  test("does nothing if raw date value is missing in datum", () => {
    const spec = {
      encoding: {
        x: { field: "timestamp", type: "temporal" },
      },
    };
    const datum = { other: "2023-01-01" };
    const evt = createEvent(spec, datum);

    onChartClick(evt);

    expect(datetime.value).toBe("");
  });

  test("handles invalid date values gracefully and warns", () => {
    const spec = {
      encoding: {
        x: { field: "timestamp", type: "temporal" },
      },
    };
    const datum = { timestamp: "not-a-date" };
    const evt = createEvent(spec, datum);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    onChartClick(evt);

    expect(datetime.value).toBe("");
    expect(warnSpy).toHaveBeenCalledWith(
      "[eodash] Invalid temporal value received:",
      "not-a-date",
    );
  });

  test("does nothing if disableClickDateToMap is true", () => {
    const spec = {
      "disableClickDateToMap": true,
      encoding: {
        x: { field: "timestamp", type: "temporal" },
      },
    };
    const datum = { timestamp: "2023-01-01T12:00:00Z" };
    const evt = createEvent(spec, datum);

    onChartClick(evt);

    expect(datetime.value).toBe("");
  });
});
