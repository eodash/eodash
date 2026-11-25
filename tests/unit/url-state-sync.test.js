import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createApp, nextTick } from "vue";
import { createPinia } from "pinia";
import { useURLSearchParametersSync } from "@/composables";
import { compareIndicator, comparePoi } from "@/store/states";

/** @type {import("vue").App | undefined} */
let app;
/** @type {HTMLDivElement | undefined} */
let container;
let originalUrl = "";

beforeEach(() => {
  originalUrl = window.location.href;
  history.replaceState(null, "", window.location.pathname);
  compareIndicator.value = "";
  comparePoi.value = "";
  container = document.createElement("div");
  document.body.append(container);
  app = createApp({
    setup() {
      useURLSearchParametersSync();
      return () => null;
    },
  });
  app.use(createPinia());
  app.mount(container);
});

afterEach(() => {
  app?.unmount();
  container?.remove();
  compareIndicator.value = "";
  comparePoi.value = "";
  history.replaceState(null, "", originalUrl);
});

describe("compare state URL serialization", () => {
  test("writes compareindicator and comparepoi while preserving unrelated parameters", async () => {
    history.replaceState(null, "", `${window.location.pathname}?custom=keep`);
    compareIndicator.value = "temperature";
    comparePoi.value = "vienna";
    await nextTick();

    const params = new URLSearchParams(window.location.search);
    expect(params.get("compareindicator")).toBe("temperature");
    expect(params.get("comparepoi")).toBe("vienna");
    expect(params.get("custom")).toBe("keep");
  });

  test("removes comparepoi when returning to the parent indicator", async () => {
    compareIndicator.value = "temperature";
    comparePoi.value = "vienna";
    await nextTick();

    comparePoi.value = "";
    await nextTick();

    const params = new URLSearchParams(window.location.search);
    expect(params.has("comparepoi")).toBe(false);
    expect(params.get("compareindicator")).toBe("temperature");
  });

  test("removes comparison parameters when the comparison selection is cleared", async () => {
    compareIndicator.value = "temperature";
    comparePoi.value = "vienna";
    await nextTick();

    compareIndicator.value = "";
    comparePoi.value = "";
    await nextTick();

    const params = new URLSearchParams(window.location.search);
    expect(params.has("compareindicator")).toBe(false);
    expect(params.has("comparepoi")).toBe(false);
  });
});
