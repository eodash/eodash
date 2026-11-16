import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import {
  chooseIndicator,
  deepQuery,
  enterGlobe,
  globeButton,
  globeLayer,
  inGlobe,
  layerControlRow,
  leaveGlobe,
  leftGlobe,
  slide,
  staysInGlobe,
  takesPointer,
  until,
} from "../../support/globe";
import { dataLayerId, getLayer } from "../../support/layers";
import { bootExpert, TIMEOUT } from "../../support/template";

// Diagnostic: records which layer interactions reach the 3D globe. The journey
// picks an indicator in 2D, enters the globe through the map button and drives
// the widgets. Each check reads the OL layer first and the globe layer second,
// so a failure tells a broken widget apart from a change that never reached the
// globe. Findings: .agents/globe-investigation/.

const STAC_ENDPOINT =
  "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json";
// A time-enabled XYZ data layer: a native OpenGlobus layer type.
const NO2_ID = "N1_NO2_monthly";
const NO2_TITLE = "Nitrogen Dioxide (Monthly)";
const NEXT_ID = "client_side_rendering";
const NEXT_TITLE = "Client Side Rendering Example";

/** @param {any} mapEl @param {string | undefined} id */
const olUrl = (mapEl, id) =>
  mapEl.getLayerById(id)?.getSource()?.getUrls()?.[0];

/**
 * The indicator's base layers. Indicators bring their own; the template's only
 * apply when they bring none.
 * @param {any} mapEl
 * @returns {any[]}
 */
const baseLayers = (mapEl) => getLayer(mapEl, "BaseLayersGroup")?.layers ?? [];

describe("expert globe - layers", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;
  /** @type {any} */
  let mapEl;

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
    mapEl = ctx.query("eox-map");
    await chooseIndicator(NO2_TITLE);
    await until(() => ctx.store.selectedStac?.id === NO2_ID, "NO2 selected");
    await until(() => dataLayerId(mapEl), "data layer");
    await enterGlobe(ctx.container, mapEl);
  });

  afterAll(() => ctx?.app.unmount());

  test("the globe holds the shown base layer and the data layer", () => {
    const shown = baseLayers(mapEl).find((l) =>
      mapEl.getLayerById(l.properties.id)?.getVisible(),
    );
    expect(globeLayer(mapEl, shown?.properties.id)).toBeTruthy();
    expect(globeLayer(mapEl, dataLayerId(mapEl))).toBeTruthy();
  });

  test("switching the base layer in the layer control switches it on the globe", async () => {
    const isShown = (/** @type {any} */ l) =>
      mapEl.getLayerById(l.properties.id)?.getVisible();
    const previous = baseLayers(mapEl).find(isShown)?.properties.id;
    // an XYZ base, so the switch does not depend on a live WMS
    const next = baseLayers(mapEl).find(
      (l) => !isShown(l) && l.source?.type === "XYZ",
    )?.properties.id;
    deepQuery(await layerControlRow(next), ".visibility input").click();

    await expect
      .poll(() => mapEl.getLayerById(next).getVisible(), { timeout: TIMEOUT })
      .toBe(true);
    expect(mapEl.getLayerById(previous).getVisible()).toBe(false);
    await expect
      .poll(() => globeLayer(mapEl, next)?.getVisibility(), {
        timeout: TIMEOUT,
      })
      .toBe(true);
    expect(globeLayer(mapEl, previous)?.getVisibility()).toBe(false);

    // restore the indicator's default for the steps after this one
    deepQuery(await layerControlRow(previous), ".visibility input").click();
    await expect
      .poll(() => mapEl.getLayerById(previous).getVisible(), {
        timeout: TIMEOUT,
      })
      .toBe(true);
  });

  test("hiding the layer in the layer control hides it on the globe", async () => {
    const id = dataLayerId(mapEl);
    // a DOM click: the toggle input is styled invisible
    const checkbox = deepQuery(await layerControlRow(id), ".visibility input");
    checkbox.click();

    await expect
      .poll(() => mapEl.getLayerById(id).getVisible(), { timeout: TIMEOUT })
      .toBe(false);
    await expect
      .poll(() => globeLayer(mapEl, id)?.getVisibility(), { timeout: TIMEOUT })
      .toBe(false);

    checkbox.click();
    await expect
      .poll(() => globeLayer(mapEl, id)?.getVisibility(), { timeout: TIMEOUT })
      .toBe(true);
  });

  test("the opacity slider sets the opacity on the globe", async () => {
    const id = dataLayerId(mapEl);
    slide(
      deepQuery(
        await layerControlRow(id),
        '[slot="opacity-content"] input[type="range"]',
      ),
      0.4,
    );

    await expect
      .poll(() => mapEl.getLayerById(id).getOpacity(), { timeout: TIMEOUT })
      .toBe(0.4);
    await expect
      .poll(() => globeLayer(mapEl, id)?.opacity, { timeout: TIMEOUT })
      .toBe(0.4);
  });

  test("jumping to the oldest date loads that date's tiles on the globe", async () => {
    const before = olUrl(mapEl, dataLayerId(mapEl));
    await userEvent.click(ctx.query("#eodash-date-oldest"));

    await expect
      .poll(() => olUrl(mapEl, dataLayerId(mapEl)), { timeout: TIMEOUT })
      .not.toBe(before);
    // the id changes with the date, so read the current one each time
    await expect
      .poll(() => globeLayer(mapEl, dataLayerId(mapEl))?.url, {
        timeout: TIMEOUT,
      })
      .toBe(olUrl(mapEl, dataLayerId(mapEl)));
  });

  test("layers rebuilt in 3D are built for the 2D view, not for the globe", () => {
    // eodash passes `mapEl.projection` ("globe" in 3D) as the view projection,
    // which ends up in layer ids and extents (point 01)
    /** @type {string[]} */
    const ids = mapEl.map
      .getAllLayers()
      .map((/** @type {any} */ l) => String(l.get("id")));
    expect(ids.filter((id) => id.endsWith(";:;globe"))).toEqual([]);
  });

  test("picking another indicator replaces its layer on the globe", async () => {
    const previous = dataLayerId(mapEl);
    await chooseIndicator(NEXT_TITLE);

    await expect
      .poll(() => ctx.store.selectedStac?.id, { timeout: TIMEOUT })
      .toBe(NEXT_ID);
    await expect
      .poll(() => dataLayerId(mapEl), { timeout: TIMEOUT })
      .not.toBe(previous);
    await expect
      .poll(() => globeLayer(mapEl, dataLayerId(mapEl)), { timeout: TIMEOUT })
      .toBeTruthy();
    expect(globeLayer(mapEl, previous)).toBeFalsy();
  });

  test("the interactions above leave the map in 3D", async () => {
    expect(await staysInGlobe(mapEl)).toBe(true);
  });

  test("the switch to 2D button takes a pointer click", () => {
    // the toolbar moves to the right-hand panels' column in 3D (point 14)
    const button = globeButton(ctx.container, "switch to 2D");
    if (!button) throw new Error("no 2D button");
    expect(takesPointer(button)).toBe(true);
  });

  test("switching back to 2D tears the globe down and keeps the data layer", async () => {
    const id = dataLayerId(mapEl);
    await leaveGlobe(ctx.container, mapEl);

    expect(leftGlobe(mapEl)).toBe(true);
    expect(inGlobe(mapEl)).toBe(false);
    expect(mapEl.getLayerById(id)).toBeTruthy();
    expect(ctx.query(".v-alert")).toBeNull();
  });
});
