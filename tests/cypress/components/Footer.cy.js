import Footer from "@/components/Footer.vue";
import { eodashKey } from "@/utils/keys";

describe("<Footer />", () => {
  beforeEach(() => {
    cy.vMount(Footer);
  });

  it("render component and footer title", () => {
    cy.get("@vue").then(({ options, wrapper }) => {
      const footerText =
        /** @type {import("@/types").Eodash} */
        //@ts-expect-error https://github.com/Microsoft/TypeScript/issues/24587
        (options.global?.provide?.[eodashKey])?.brand.footerText ?? "";
      expect(wrapper.wrapperElement).to.include.text(footerText);
    });
  });
});
