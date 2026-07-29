import { beforeEach, describe, expect, test } from "vitest";
import { mdiCog, mdiViewDashboard } from "@mdi/js";
import EodashLayoutSwitcher from "^/EodashLayoutSwitcher.vue";
import { activeTemplate } from "@/store/states";
import { mountComponent } from "../support/mount";

/** The `d` of the rendered v-icon's SVG path. */
const iconPath = () =>
  document.querySelector(".v-icon svg path")?.getAttribute("d");

describe("EodashLayoutSwitcher", () => {
  beforeEach(() => {
    // activeTemplate is a module singleton.
    activeTemplate.value = "";
  });

  test("renders the switcher icon", async () => {
    await mountComponent(EodashLayoutSwitcher);

    await expect.poll(() => document.querySelector(".v-icon")).toBeTruthy();
  });

  test("sets activeTemplate to the default target on click", async () => {
    await mountComponent(EodashLayoutSwitcher);

    /** @type {HTMLElement | null} */ (
      document.querySelector(".v-icon")
    )?.click();

    await expect.poll(() => activeTemplate.value).toBe("expert");
  });

  test("sets activeTemplate to a custom target on click", async () => {
    await mountComponent(EodashLayoutSwitcher, { props: { target: "lite" } });

    /** @type {HTMLElement | null} */ (
      document.querySelector(".v-icon")
    )?.click();

    await expect.poll(() => activeTemplate.value).toBe("lite");
  });

  test("renders the default dashboard icon", async () => {
    await mountComponent(EodashLayoutSwitcher);

    await expect.poll(() => iconPath()).toBe(mdiViewDashboard);
  });

  test("renders a custom icon from the icon prop", async () => {
    await mountComponent(EodashLayoutSwitcher, { props: { icon: mdiCog } });

    await expect.poll(() => iconPath()).toBe(mdiCog);
  });
});
