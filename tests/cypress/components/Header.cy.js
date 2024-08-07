import Header from "@/components/Header.vue";
import { eodashKey } from "@/utils/keys";

describe("<Header />", () => {
  beforeEach(() => {
    cy.vMount(Header);
  });

  it("render component and app title", () => {
    cy.get("@vue").then(({ options, wrapper }) => {
      const appTitle =
        /** @type {import("@/types").Eodash} */
        (options.global?.provide?.[eodashKey])?.brand.name;
      expect(wrapper.wrapperElement).to.include.text(appTitle);
    });
  });
});
