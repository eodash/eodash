import { describe, expect, test } from "vitest";
import Header from "@/components/Header.vue";
import { mountComponent } from "../support/mount";
import { mockEodash } from "../support/eodash";

describe("Header", () => {
  test("renders the brand name", async () => {
    const eodash = mockEodash({ brand: { name: "Acme EO" } });
    const { screen } = await mountComponent(Header, { eodash });

    await expect.element(screen.getByText("Acme EO")).toBeInTheDocument();
  });

  test("brand name is captured once and does not react to later changes", async () => {
    const eodash = mockEodash({ brand: { name: "Original" } });
    const { screen } = await mountComponent(Header, { eodash });

    await expect.element(screen.getByText("Original")).toBeInTheDocument();

    eodash.brand.name = "Changed";

    // Header reads brand.name into a non-reactive const at setup (.agents/12-branding-theming.md).
    await expect.element(screen.getByText("Original")).toBeInTheDocument();
  });
});
