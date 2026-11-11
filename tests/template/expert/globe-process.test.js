import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import {
  chooseIndicator,
  enterGlobe,
  leaveGlobe,
  until,
} from "../../support/globe";
import { bootExpert } from "../../support/template";

// Processing is disabled in 3D: drawing and feature picking only work on the
// 2D map. The panel shows a note instead and keeps the form for the way back.

const STAC_ENDPOINT =
  "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json";
const PROCESS_ID = "predictive_maintenance";
const PROCESS_TITLE = "Transport Infrastructure Predictive Maintenance";
const NOTE = "Processing is available in the 2D map.";

describe("expert globe - processing", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;
  /** @type {any} */
  let mapEl;

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
    mapEl = ctx.query("eox-map");
    await chooseIndicator(PROCESS_TITLE);
    await until(
      () => ctx.store.selectedStac?.id === PROCESS_ID,
      `${PROCESS_ID} selected`,
    );
    await until(() => ctx.query("eox-jsonform"), "process form");
  });

  afterAll(() => ctx?.app.unmount());

  test("the processing panel shows a note instead of the form in 3D", async () => {
    await enterGlobe(ctx.container, mapEl);

    await expect.element(page.getByText(NOTE)).toBeVisible();
    expect(ctx.query(".eodash-process-container")).not.toBeVisible();
  });

  test("leaving 3D brings the form back", async () => {
    await leaveGlobe(ctx.container, mapEl);

    await expect.element(page.getByText(NOTE)).not.toBeInTheDocument();
    expect(ctx.query(".eodash-process-container")).toBeVisible();
    expect(ctx.query("eox-jsonform")).toBeTruthy();
  });
});