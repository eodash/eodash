import { beforeEach, describe, expect, test } from "vitest";
import { createVuetify } from "vuetify";
import EodashOverlay from "@/components/EodashOverlay.vue";
import { loading } from "@/store/states";
import pkg from "../../package.json";
import { mountComponent } from "../support/mount";

// The overlay reads computedThemes["dashboardTheme"], so vuetify must define it.
const vuetify = createVuetify({ theme: { themes: { dashboardTheme: {} } } });

/** @returns {boolean} Whether the progress bar is in its active state. */
const progressActive = () =>
  document
    .querySelector(".v-progress-linear")
    ?.classList.contains("v-progress-linear--active") ?? false;

describe("EodashOverlay", () => {
  beforeEach(() => {
    loading.activeLoads = 0;
  });

  test("shows the eodash version from package.json", async () => {
    await mountComponent(EodashOverlay, { vuetify });

    await expect
      .poll(() => document.body.textContent)
      .toContain(`eodash v${pkg.version}`);
  });

  test("links to the eodash repo and the EOX site", async () => {
    await mountComponent(EodashOverlay, { vuetify });

    await expect
      .poll(() =>
        document.querySelector('a[href="https://github.com/eodash/eodash"]'),
      )
      .toBeTruthy();
    expect(document.querySelector('a[href="https://eox.at"]')).toBeTruthy();
  });

  test("renders the EOX logo as an inline base64 SVG", async () => {
    await mountComponent(EodashOverlay, { vuetify });

    await expect
      .poll(() =>
        document.querySelector('img[src^="data:image/svg+xml;base64,"]'),
      )
      .toBeTruthy();
  });

  test("keeps the progress bar inactive while nothing is loading", async () => {
    await mountComponent(EodashOverlay, { vuetify });

    await expect
      .poll(() => document.querySelector(".v-progress-linear"))
      .toBeTruthy();
    expect(progressActive()).toBe(false);
  });

  test("activates the progress bar while a load is in flight", async () => {
    await mountComponent(EodashOverlay, { vuetify });

    loading.activeLoads = 1;

    await expect.poll(() => progressActive()).toBe(true);
  });
});
