import EodashDatePicker from "^/EodashDatePicker.vue";

describe("<EodashDatePicker/>", () => {
  describe("primary date picker", () => {
    beforeEach(() => {
      cy.vMount(EodashDatePicker);
    });

    it("render component", () => {
      cy.get("@vue").then(({ wrapper }) => {
        expect(wrapper.wrapperElement).to.exist;
      });
    });

    it("show date picker on hover", () => {
      cy.get("input").trigger("mousemove");
      cy.get(".vc-day-content").should("exist");
    });

    it("click date", () => {
      cy.get(".vc-day-content").eq(20).click();
    });
  });
});
