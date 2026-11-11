import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  chooseIndicator,
  drawsVector,
  enterGlobe,
  globeLayer,
  until,
} from "../../support/globe";
import { processGroup } from "../../support/layers";
import {
  bootExpert,
  drawtoolsLayerId,
  selectFeature,
  targetFeatures,
} from "../../support/template";

// Diagnostic: a feature-selection process with the globe on (point 06 in
// .agents/globe-investigation/). The process selects from a GeoJSON of point
// features; eox-map swaps URL GeoJSON to a native OpenGlobus vector once its
// own fetch resolves, and OpenGlobus draws no point geometries.

const STAC_ENDPOINT =
  "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json";
const PROCESS_ID = "predictive_maintenance";
const PROCESS_TITLE = "Transport Infrastructure Predictive Maintenance";
// Process execution fetches the timeseries/reference services over the network.
const PROCESS_TIMEOUT = 1000 * 20;

describe("expert globe - process execution", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;
  /** @type {any} */
  let mapEl;

  const resultLayerId = () =>
    processGroup(mapEl)?.layers.find((l) =>
      l.properties?.id.includes("_process"),
    )?.properties?.id;

  /**
   * The globe layer of a URL GeoJSON, once eox-map swapped it to a vector.
   * @param {string | undefined} id
   */
  const nativeVector = (id) =>
    until(
      () => globeLayer(mapEl, id)?.instanceName === "Vector",
      `native vector for ${id}`,
    ).then(() => globeLayer(mapEl, id));

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
    mapEl = ctx.query("eox-map");
    await chooseIndicator(PROCESS_TITLE);
    await until(
      () => ctx.store.selectedStac?.id === PROCESS_ID,
      `${PROCESS_ID} selected`,
    );
    await until(
      () => targetFeatures(ctx.container).length,
      "process features loaded",
    );
    await enterGlobe(ctx.container, mapEl);
  });

  afterAll(() => ctx?.app.unmount());

  test("the features the process selects from stay on the map", async () => {
    // entering 3D re-assigns every layer, which reloads this source
    await until(
      () => targetFeatures(ctx.container).length,
      "process features after entry",
    );
  });

  test("the features the process selects from are drawn on the globe", async () => {
    const layer = await nativeVector(drawtoolsLayerId(ctx.container));
    expect(drawsVector(layer)).toBe(true);
  });

  // The select event stands in for a map click, so this covers the process run
  // with the globe on, not picking a feature on the globe.
  test("selecting a feature executes the process and renders the chart", async () => {
    selectFeature(ctx.container, 0);
    await until(() => ctx.query("eox-chart"), "chart", PROCESS_TIMEOUT);
    expect(ctx.query(".v-alert")).toBeNull();
  });

  test("the process result is drawn on the globe", async () => {
    await until(resultLayerId, "result layer", PROCESS_TIMEOUT);
    const layer = await nativeVector(resultLayerId());
    expect(drawsVector(layer)).toBe(true);
  });
});
