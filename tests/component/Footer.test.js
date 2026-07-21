import { describe, expect, test } from "vitest";
import Footer from "@/components/Footer.vue";
import { mountComponent } from "../support/mount";
import { mockEodash } from "../support/eodash";

describe("Footer", () => {
  test("renders the footer text", async () => {
    const eodash = mockEodash({ brand: { footerText: "© EOX" } });
    const { screen } = await mountComponent(Footer, { eodash });

    await expect.element(screen.getByText("© EOX")).toBeInTheDocument();
  });

  test("footer text reacts to config changes after mount", async () => {
    const eodash = mockEodash({ brand: { footerText: "before" } });
    const { screen } = await mountComponent(Footer, { eodash });

    await expect.element(screen.getByText("before")).toBeInTheDocument();

    eodash.brand.footerText = "after";

    await expect.element(screen.getByText("after")).toBeInTheDocument();
  });
});
