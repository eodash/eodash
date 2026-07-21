import { describe, expect, test } from "vitest";
import { h } from "vue";
import PopUp from "^/PopUp.vue";
import { mountAsyncComponent, mountComponent } from "../support/mount";

const divWidget = {
  id: "popup-widget",
  type: "web-component",
  widget: {
    tagName: "div",
    link: () => Promise.resolve({}),
    properties: { class: "injected-widget" },
  },
};

describe("PopUp", () => {
  test("renders nothing while closed", async () => {
    await mountComponent(PopUp, {
      props: { modelValue: false },
      slots: { default: () => h("div", { class: "slot-content" }, "Hidden") },
    });

    expect(document.querySelector(".slot-content")).toBeNull();
  });

  test("renders default slot content when open", async () => {
    const { screen } = await mountComponent(PopUp, {
      props: { modelValue: true },
      slots: { default: () => h("div", { class: "slot-content" }, "Visible") },
    });

    await expect.element(screen.getByText("Visible")).toBeInTheDocument();
  });

  test("renders the configured widget when open", async () => {
    await mountAsyncComponent(PopUp, {
      props: { modelValue: true, widget: divWidget },
    });

    await expect
      .poll(() => document.querySelector(".injected-widget"))
      .toBeTruthy();
  });
});
