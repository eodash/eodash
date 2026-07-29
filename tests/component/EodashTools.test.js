import { beforeEach, describe, expect, test, vi } from "vitest";
import { mdiViewDashboard } from "@mdi/js";
import EodashTools from "^/EodashTools.vue";
import { mountComponent } from "../support/mount";

vi.mock("^/EodashItemFilter.vue", () => ({
  default: {
    name: "EodashItemFilterStub",
    inheritAttrs: false,
    props: { filtersTitle: { type: String, default: "" } },
    emits: ["select"],
    template: `<div class="item-filter-stub">
      <span>{{ filtersTitle }}</span>
      <button class="do-select" @click="$emit('select', {})">choose item</button>
    </div>`,
  },
}));

/**
 * The `d` attributes of every rendered v-icon SVG path.
 * @returns {(string | null)[]} One entry per rendered icon.
 */
const iconPaths = () =>
  [...document.querySelectorAll(".v-icon svg path")].map((p) =>
    p.getAttribute("d"),
  );

describe("EodashTools", () => {
  // v-dialog teleports its content to `body > .v-overlay-container`
  beforeEach(() => {
    document
      .querySelectorAll("body > .v-overlay-container")
      .forEach((el) => el.remove());
  });

  test("renders the indicators button and the layout switcher by default", async () => {
    const { screen } = await mountComponent(EodashTools);

    await expect.element(screen.getByText("Select indicator")).toBeVisible();
    await expect.poll(() => iconPaths()).toContain(mdiViewDashboard);
  });

  test("renders a custom indicator button text", async () => {
    const { screen } = await mountComponent(EodashTools, {
      props: { indicatorBtnText: "Pick a dataset" },
    });

    await expect.element(screen.getByText("Pick a dataset")).toBeVisible();
  });

  test("hides the indicators button when showIndicatorsBtn is false", async () => {
    await mountComponent(EodashTools, { props: { showIndicatorsBtn: false } });

    await expect
      .poll(() => document.body.textContent)
      .not.toContain("Select indicator");
  });

  test("hides the layout switcher when showLayoutSwitcher is false", async () => {
    await mountComponent(EodashTools, { props: { showLayoutSwitcher: false } });

    await expect.poll(() => iconPaths()).not.toContain(mdiViewDashboard);
  });

  test("opens the item filter when the indicators button is clicked", async () => {
    const { screen } = await mountComponent(EodashTools);

    await screen.getByText("Select indicator").click();

    await expect.element(screen.getByText("choose item")).toBeVisible();
  });

  test("closes the dialog once an item is selected in the filter", async () => {
    const { screen } = await mountComponent(EodashTools);
    await screen.getByText("Select indicator").click();

    const chooseItem = screen.getByText("choose item");
    await expect.element(chooseItem).toBeVisible();

    await chooseItem.click();

    await expect.element(chooseItem).not.toBeVisible();
  });

  test("forwards itemFilterConfig to the embedded filter", async () => {
    const { screen } = await mountComponent(EodashTools, {
      props: { itemFilterConfig: { filtersTitle: "Datasets" } },
    });

    await screen.getByText("Select indicator").click();

    await expect.element(screen.getByText("Datasets")).toBeVisible();
  });
});
