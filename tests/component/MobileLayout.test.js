import { beforeEach, describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import MobileLayout from "@/components/MobileLayout.vue";
import { mountComponent } from "../support/mount";
import { mockEodash, mockTemplate } from "../support/eodash";

describe("MobileLayout", () => {
  const template = mockTemplate();

  beforeEach(async () => {
    // Rest of the suite runs at the large-laptop default; mobile layout needs a phone viewport.
    await page.viewport(390, 844);
  });

  const mount = () =>
    mountComponent(MobileLayout, { eodash: mockEodash({ template }) });

  test("renders the main container and background widget", async () => {
    await mount();

    await expect.poll(() => document.querySelector("main")).toBeTruthy();
    await expect.poll(() => document.querySelector("#bg-widget")).toBeTruthy();
  });

  test("renders a tab per configured widget", async () => {
    const { screen } = await mount();

    for (const { title } of template.widgets) {
      await expect.element(screen.getByText(title)).toBeInTheDocument();
    }
  });

  test("toggles a widget's tab (and overlay) active on tab click", async () => {
    const { screen } = await mount();
    const tab = screen.getByText(template.widgets[0].title);

    // activeIdx starts at -1 -> no active tab, no visible overlay.
    await expect
      .poll(() => document.querySelector(".tabs a.active"))
      .toBeFalsy();

    await tab.click();
    await expect
      .poll(() => document.querySelector(".tabs a.active"))
      .toBeTruthy();

    // Clicking the active tab again collapses it (activeIdx -> -1).
    await tab.click();
    await expect
      .poll(() => document.querySelector(".tabs a.active"))
      .toBeFalsy();
  });
});
