import { describe, expect, test } from "vitest";
import DashboardLayout from "@/components/DashboardLayout.vue";
import { mountComponent } from "../support/mount";
import { mockEodash, mockTemplate } from "../support/eodash";

describe("DashboardLayout", () => {
  const template = mockTemplate();

  // Awaited so a render-time throw fails the test, not an unhandled rejection.
  const mount = () =>
    mountComponent(DashboardLayout, { eodash: mockEodash({ template }) });

  test("renders the eox-layout container inside v-main", async () => {
    await mount();

    await expect.poll(() => document.querySelector("main")).toBeTruthy();
    await expect.poll(() => document.querySelector("eox-layout")).toBeTruthy();
  });

  test("renders the background widget", async () => {
    await mount();

    await expect.poll(() => document.querySelector("#bg-widget")).toBeTruthy();
  });

  test("places each configured widget at its grid position", async () => {
    await mount();

    for (const { layout } of template.widgets) {
      await expect
        .poll(() =>
          document.querySelector(
            `eox-layout-item[x="${layout.x}"][y="${layout.y}"][w="${layout.w}"][h="${layout.h}"]`,
          ),
        )
        .toBeTruthy();
    }
  });
});
