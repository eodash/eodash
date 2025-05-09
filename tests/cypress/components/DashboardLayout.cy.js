import DashboardLayout from "@/components/DashboardLayout.vue";
import { eodashKey } from "@/utils/keys";

describe("<DashboardLayout />", () => {
  /** @type {(import("@/types").Layout | undefined)[]} */
  let layouts = [];
  beforeEach(() => {
    cy.vMount(DashboardLayout, {
      global: {
        stubs: {
          index: true,
          DynamicWebComponent: true,
          EodashDatePicker: true,
          EodashItemFilter: true,
          EodashMap: true,
          EodashMapBtns: true,
          ExportState: true,
          EodashLayerControl: true,
          EodashProcess: true,
        },
      },
    }).then(({ options }) => {
      layouts = /** @type {import("@/types").Widget[]} */ (
        options.global?.provide?.[eodashKey].template.widgets
      )?.map((w) => {
        if ("defineWidget" in w) {
          const staticWidget = w.defineWidget(null);
          return staticWidget ? staticWidget.layout : undefined;
        } else {
          return w.layout;
        }
      });
    });
  });

  it("mount successfully", () => {
    cy.get("@vue").then(() => {
      cy.get("main", { timeout: 15000 }).should("exist");
    });
  });

  it("renders background widget", () => {
    cy.get("#bg-widget").should("exist");
  });

  it("check layout elements based on X position", () => {
    layouts?.forEach((layout) => {
      if (layout) {
        cy.get(`[x="${layout.x}"]`).should("exist");
      }
    });
  });

  it("check layout elements based on Y position", () => {
    layouts?.forEach((layout) => {
      if (layout) {
        cy.get(`[y="${layout.y}"]`).should("exist");
      }
    });
  });

  it("check layout elements based on height", () => {
    layouts?.forEach((layout) => {
      if (layout) {
        cy.get(`[h="${layout.h}"]`).should("exist");
      }
    });
  });

  it("check layout elements based on width", () => {
    layouts?.forEach((layout) => {
      if (layout) {
        cy.get(`[w="${layout.w}"]`).should("exist");
      }
    });
  });
});
