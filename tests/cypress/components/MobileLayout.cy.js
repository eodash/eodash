import MobileLayout from "@/components/MobileLayout.vue";
import { eodashKey } from "@/utils/keys";

describe("<MobileLayout />", () => {
  beforeEach(() => {
    cy.vMount(MobileLayout, {
      global: {
        stubs: {
          EodashDatePicker: true,
          EodashItemFilter: true,
          EodashMap: true,
          DynamicWebComponent: true,
        },
      },
    });
  });

  /** @param {import("@/types").Widget} w */
  const onlyStatic = (w) => Object.hasOwn(w, "title");

  it("renders successfully", () => {
    cy.get("main", { timeout: 10000 }).should("exist");
  });

  it("renders static widgets titles in tabs ", () => {
    cy.get("@vue").then(({ options }) => {
      /** @type {import("@/types").StaticWidget[]} */
      const widgets =
        //@ts-expect-error https://github.com/microsoft/TypeScript/issues/1863
        options.global?.provide?.[eodashKey].template.widgets.filter(
          onlyStatic,
        );

      widgets.forEach((widget, idx) => {
        cy.get(`button[value="${idx}"]`).contains(widget.title ?? "");
      });
    });
  });

  it("render background widget", () => {
    cy.get("#bg-widget").should("exist");
  });

  it("close opened tab", () => {
    cy.get("#overlay > .close-btn").then(($el) => {
      $el[0].click();
    });
    cy.get(".v-slide-group-item--active").should("not.exist");
  });

  it("open new tab", () => {
    cy.get("@vue").then(({ options }) => {
      const lastIdx =
        /** @type {import("@/types").Eodash} */
        //@ts-expect-error https://github.com/microsoft/TypeScript/issues/1863
        (options.global?.provide?.[eodashKey])?.template.widgets.filter(
          onlyStatic,
        ).length - 1;
      cy.get(`.v-slide-group__content button[value=${lastIdx}]`).click({
        force: true,
      });

      cy.get("#overlay").should("exist");
    });
  });
});
