import MobileLayout from "@/components/MobileLayout.vue";
import { eodashKey } from "@/utils/keys";

describe("<MobileLayout />", () => {
  beforeEach(() => {
    cy.vMount(MobileLayout, {
      global: {
        stubs: {
          index:true,
          EodashDatePicker: true,
          EodashItemFilter: true,
          EodashMap: true,
          DynamicWebComponent: true,
          EodashLayerControl: true,
          EodashLayoutSwitcher: true,
          EodashTools: true,
          ExportState: true,
          EodashMapBtns: true,
          EodashProcess: true,
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
    cy.get("#overlay > .d-flex > .close-btn").then(($el) => {
      $el[0].click();
    });
    cy.get(".v-slide-group-item--active").should("not.exist");
  });

  it("open new tab", () => {
    cy.get("@vue").then(({ options }) => {
      const lastIdx =
        /** @type {import("@/types").Eodash} */
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
