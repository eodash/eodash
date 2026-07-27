import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { bootExpert, selectIndicator, TIMEOUT } from "../../support/template";

const STAC_ENDPOINT =
  "https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json";
// Indicators whose STAC collection has a `service` link (includesProcess).
const PROCESS_INDICATORS = ["NO2_daily", "methane_monitoring"];

// Boot once, then switch selection through several process indicators via the
// store: this covers process rendering per indicator, not the selection UI.
describe("expert template - processes", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
  });

  afterAll(() => ctx?.app.unmount());

  test.each(PROCESS_INDICATORS)(
    "renders the process form when %s is selected",
    async (id) => {
      await selectIndicator(ctx.store, id);

      // includesProcess -> EodashProcess mounts its jsonform.
      await expect
        .poll(() => ctx.query("eox-jsonform"), { timeout: TIMEOUT })
        .toBeTruthy();
      await expect
        .poll(
          () =>
            ctx
              .query("eox-jsonform")
              ?.shadowRoot?.querySelector("eox-drawtools"),
          { timeout: TIMEOUT },
        )
        .toBeTruthy();
    },
  );
});
