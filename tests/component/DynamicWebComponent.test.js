import { describe, expect, test } from "vitest";
import DynamicWebComponent from "@/components/DynamicWebComponent.vue";
import { mountAsyncComponent } from "../support/mount";

// A class can only be registered under one tag name, so each test uses its own.
class DwcPlain extends HTMLElement {
  connectedCallback() {
    this.textContent = "plain-loaded";
  }
}
class DwcProbe extends HTMLElement {
  connectedCallback() {
    this.textContent = "probe-loaded";
  }
}

describe("DynamicWebComponent", () => {
  test("renders the configured tag with its bound properties", async () => {
    const { screen } = await mountAsyncComponent(DynamicWebComponent, {
      props: {
        tagName: "dwc-plain",
        link: () => customElements.define("dwc-plain", DwcPlain),
        properties: { "data-testid": "dwc-plain" },
      },
    });

    await expect.element(screen.getByTestId("dwc-plain")).toBeInTheDocument();
  });

  test("defines the element from constructorProp when the tag is unregistered", async () => {
    const { screen } = await mountAsyncComponent(DynamicWebComponent, {
      props: {
        tagName: "dwc-probe",
        link: () => ({ DwcProbe }),
        constructorProp: "DwcProbe",
        properties: { "data-testid": "dwc-probe" },
      },
    });

    await expect
      .element(screen.getByTestId("dwc-probe"))
      .toHaveTextContent("probe-loaded");
  });
});
