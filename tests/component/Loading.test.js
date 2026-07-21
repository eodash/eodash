import { describe, expect, test } from "vitest";
import Loading from "@/components/Loading.vue";
import { mockEodash } from "../support/eodash";
import { mountComponent } from "../support/mount";

const loadingWidget = {
  id: "load",
  type: "web-component",
  widget: {
    tagName: "div",
    link: () => Promise.resolve({}),
    properties: { class: "mock-loading" },
  },
};

describe("Loading", () => {
  test("falls back to the default loading text when the template has no loading widget", async () => {
    const { screen } = await mountComponent(Loading, {
      eodash: mockEodash({ template: { loading: undefined, widgets: [] } }),
    });

    await expect.element(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders the template's loading widget when configured", async () => {
    await mountComponent(Loading, {
      eodash: mockEodash({ template: { loading: loadingWidget, widgets: [] } }),
    });

    await expect
      .poll(() => document.querySelector(".mock-loading"))
      .toBeTruthy();
  });
});
