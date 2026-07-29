import { describe, expect, test } from "vitest";
import WidgetsContainer from "^/WidgetsContainer.vue";
import { mountAsyncComponent } from "../support/mount";

// Trivial web-component widgets so the container is exercised without loading real eox elements.
const widgets = [
  {
    id: "tools",
    title: "Tools",
    type: "web-component",
    widget: {
      tagName: "div",
      link: () => Promise.resolve({}),
      properties: { class: "w-tools" },
    },
  },
  {
    id: "map",
    title: "Map",
    type: "web-component",
    widget: {
      tagName: "div",
      link: () => Promise.resolve({}),
      properties: { class: "w-map" },
    },
  },
];

describe("WidgetsContainer", () => {
  const mount = () =>
    mountAsyncComponent(WidgetsContainer, { props: { widgets } });

  test("renders a details panel per widget", async () => {
    await mount();

    await expect
      .poll(() => document.querySelectorAll("details").length)
      .toBe(widgets.length);
  });

  test("renders each widget's title in its summary", async () => {
    const { screen } = await mount();

    for (const { title } of widgets) {
      await expect.element(screen.getByText(title)).toBeInTheDocument();
    }
  });
});
