import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  chooseIndicator,
  dragRangeMinToMax,
  enterGlobe,
  globeLayer,
  until,
} from "../../support/globe";
import { analysisGroup } from "../../support/layers";
import { bootExpert, TIMEOUT } from "../../support/template";

// Diagnostic: how COG styles reach the globe, where eox-map renders COGs
// natively as OpenGlobus GeoTIFF layers and translates the OL style into
// render options (points 08 and 09 in .agents/globe-investigation/).
// Three collections share this indicator:
// - cooling_degree_days: `(band3 - vmin) / (vmax - vmin)`, values inside the range
// - heating_degree_days: masked `band2 <= 0`, band 2 is 0 in these files
// - citytemperaturecollection: `(band1 - 273.15 - vmin) / (vmax - vmin)`, Kelvin data

const STAC_ENDPOINT =
  "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json";
const INDICATOR_ID = "city_temperature_indicator";
const INDICATOR_TITLE =
  "Temperature Forecast, Cooling/Heating Degree Days for Cities in Austria";

describe("expert globe - COG styles", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;
  /** @type {any} */
  let mapEl;

  /** @param {string} collection */
  const layerId = (collection) =>
    analysisGroup(mapEl)?.layers.find((l) =>
      l.properties?.id.startsWith(`${collection};:;`),
    )?.properties?.id;

  /** @param {string} collection */
  const renderOptions = (collection) =>
    globeLayer(mapEl, layerId(collection))?._renderOptions;

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
    mapEl = ctx.query("eox-map");
    await chooseIndicator(INDICATOR_TITLE);
    await until(
      () => ctx.store.selectedStac?.id === INDICATOR_ID,
      "indicator selected",
    );
    // the child collections hydrate their dates from parquet first
    await until(
      () =>
        layerId("cooling_degree_days") &&
        layerId("heating_degree_days") &&
        layerId("citytemperaturecollection"),
      "the three COG layers",
    );
    await enterGlobe(ctx.container, mapEl);
  });

  afterAll(() => ctx?.app.unmount());

  test("each COG is a native GeoTIFF layer on the globe", async () => {
    for (const collection of [
      "cooling_degree_days",
      "heating_degree_days",
      "citytemperaturecollection",
    ]) {
      await expect
        .poll(() => globeLayer(mapEl, layerId(collection))?.instanceName, {
          timeout: TIMEOUT,
        })
        .toBe("GeoTIFFLayer");
    }
  });

  test("moving the style range sets the same range on the globe", async () => {
    const id = layerId("cooling_degree_days");
    const value = await dragRangeMinToMax(id);

    // OL first: the layer control applied the new variables
    await expect
      .poll(() => mapEl.getLayerById(id).styleVariables_.vmin, {
        timeout: TIMEOUT,
      })
      .toBe(value);
    const { vmin, vmax } = mapEl.getLayerById(id).styleVariables_;
    await expect
      .poll(() => renderOptions("cooling_degree_days")?.single?.domain, {
        timeout: TIMEOUT,
      })
      .toEqual([vmin, vmax]);
  });

  // waits for eox-map: style masks are dropped for the globe
  test.skip("the `band <= 0` mask reaches the globe", () => {
    // in 2D the heating layer is fully masked; on the globe it is one flat
    // colour while the mask is dropped (points 08, 09)
    const options = renderOptions("heating_degree_days");
    expect(options?.single?.displayRange ?? options?.nodata ?? null).not.toBe(
      null,
    );
  });

  // waits for eox-map: style arithmetic is dropped for the globe
  test.skip("the Kelvin offset in the style reaches the globe", () => {
    // OpenGlobus applies arithmetic through `single.expression`; without it the
    // Kelvin band is compared with a Celsius range (point 08)
    expect(
      renderOptions("citytemperaturecollection")?.single?.expression ?? "",
    ).toContain("273.15");
  });
});
