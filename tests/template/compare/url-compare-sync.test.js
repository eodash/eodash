import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  activeTemplate,
  compareIndicator,
  comparePoi,
  indicator,
  poi,
} from "@/store/states";
import { bootTemplate, TIMEOUT } from "../../support/template";

const STAC_ENDPOINT =
  "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json";

describe("compare template - deep link restores indicator and compareindicator", () => {
  const MAIN_ID = "N1_NO2_monthly";
  const COMPARE_ID = "N2_CO2_mean";
  const DEEP_LINK = `?template=compare&indicator=${MAIN_ID}&compareindicator=${COMPARE_ID}`;
  /** @type {Awaited<ReturnType<typeof bootTemplate>>} */
  let ctx;

  beforeAll(async () => {
    ctx = await bootTemplate({
      endpoint: STAC_ENDPOINT,
      initialUrl: DEEP_LINK,
    });
  });

  afterAll(() => ctx?.app.unmount());

  test("restores both main and compare indicators from the url", async () => {
    await expect
      .poll(() => ctx.store.selectedStac?.id, { timeout: TIMEOUT })
      .toBe(MAIN_ID);
    await expect
      .poll(() => ctx.store.selectedCompareStac?.id, { timeout: TIMEOUT })
      .toBe(COMPARE_ID);

    expect(indicator.value).toBe(MAIN_ID);
    expect(compareIndicator.value).toBe(COMPARE_ID);
    expect(activeTemplate.value).toBe("compare");
  });
});

describe("compare template - deep link restores poi and comparepoi", () => {
  const INDICATOR_ID = "N3a2_chl_concentration_tri_esa";
  const MAIN_POI = "NorthAdriatic";
  const COMPARE_POI = "RhoneDelta";
  const DEEP_LINK = `?template=compare&indicator=${INDICATOR_ID}&poi=${MAIN_POI}&compareindicator=${INDICATOR_ID}&comparepoi=${COMPARE_POI}`;
  /** @type {Awaited<ReturnType<typeof bootTemplate>>} */
  let ctx;

  beforeAll(async () => {
    ctx = await bootTemplate({
      endpoint: STAC_ENDPOINT,
      initialUrl: DEEP_LINK,
    });
  });

  afterAll(() => ctx?.app.unmount());

  test("restores both main and compare POIs from the url", async () => {
    await expect
      .poll(() => ctx.store.selectedStac?.id, { timeout: TIMEOUT })
      .toBe(MAIN_POI);
    await expect
      .poll(() => ctx.store.selectedCompareStac?.id, { timeout: TIMEOUT })
      .toBe(COMPARE_POI);

    expect(poi.value).toBe(MAIN_POI);
    expect(comparePoi.value).toBe(COMPARE_POI);
    expect(indicator.value).toBe(INDICATOR_ID);
    expect(compareIndicator.value).toBe(INDICATOR_ID);
  });
});

describe("compare template - url updates when compare state changes", () => {
  /** @type {Awaited<ReturnType<typeof bootTemplate>>} */
  let ctx;

  beforeAll(async () => {
    ctx = await bootTemplate({
      endpoint: STAC_ENDPOINT,
      initialUrl: "?template=expert",
    });
  });

  afterAll(() => ctx?.app.unmount());

  test("updates url query parameters when compareIndicator and comparePoi are set", async () => {
    compareIndicator.value = "N2_CO2_mean";
    await expect
      .poll(() =>
        new URLSearchParams(window.location.search).get("compareindicator"),
      )
      .toBe("N2_CO2_mean");

    comparePoi.value = "NorthAdriatic";
    await expect
      .poll(() => new URLSearchParams(window.location.search).get("comparepoi"))
      .toBe("NorthAdriatic");
  });

  test("cleans up url query parameters when compare is reset", async () => {
    await ctx.store.resetSelectedCompareSTAC();

    await expect
      .poll(() =>
        new URLSearchParams(window.location.search).has("compareindicator"),
      )
      .toBe(false);
    await expect
      .poll(() => new URLSearchParams(window.location.search).has("comparepoi"))
      .toBe(false);
  });
});
