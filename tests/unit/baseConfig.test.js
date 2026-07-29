import { describe, it, expect, vi } from "vitest";

// expert.js/compare.js import "@/store/actions", which needs the full Vue/Pinia stack; mock it out.
vi.mock("@/store/actions", () => ({
  includesProcess: vi.fn(),
  shouldShowChartWidget: vi.fn(),
}));

// Import after the mock is registered.
const { getBaseConfig } = await import("../../templates/baseConfig.js");

describe("getBaseConfig - array replacement semantics", () => {
  it("user collectionsPalette replaces base palette, not appends to it", () => {
    const userPalette = ["#ff0000", "#00ff00"];
    const result = getBaseConfig({
      brand: { theme: { collectionsPalette: userPalette } },
    });
    expect(result.brand.theme.collectionsPalette).toEqual(userPalette);
    expect(result.brand.theme.collectionsPalette).toHaveLength(2);
  });

  it("user supportedUpscalingEndpoints replaces base list, not appends", () => {
    const userEndpoints = ["custom.example.com"];
    const result = getBaseConfig({
      stacEndpoint: {
        endpoint: "https://example.com/catalog.json",
        supportedUpscalingEndpoints: userEndpoints,
      },
    });
    expect(result.stacEndpoint.supportedUpscalingEndpoints).toEqual(
      userEndpoints,
    );
    expect(result.stacEndpoint.supportedUpscalingEndpoints).toHaveLength(1);
  });

  it("omitting an array key keeps the base array intact", () => {
    const result = getBaseConfig({ brand: { name: "Custom" } });
    expect(result.brand.theme.collectionsPalette).toHaveLength(9);
  });
});

describe("getBaseConfig - isolated output (no shared references)", () => {
  it("mutating returned brand.theme does not affect a second call", () => {
    const first = getBaseConfig({});
    first.brand.theme.colors.primary = "#mutated";
    const second = getBaseConfig({});
    expect(second.brand.theme.colors.primary).toBe("#002742");
  });

  it("mutating returned collectionsPalette does not affect a second call", () => {
    const first = getBaseConfig({});
    first.brand.theme.collectionsPalette[0] = "#mutated";
    const second = getBaseConfig({});
    expect(second.brand.theme.collectionsPalette[0]).toBe("#009E73");
  });

  it("returned stacEndpoint is not the same reference as baseConfig singleton", () => {
    const result = getBaseConfig({});
    const originalEndpoint = result.stacEndpoint.endpoint;
    result.stacEndpoint.endpoint = "https://mutated.example.com";
    const second = getBaseConfig({});
    expect(second.stacEndpoint.endpoint).toBe(originalEndpoint);
  });
});

describe("getBaseConfig - stacEndpoint string override", () => {
  it("string stacEndpoint from user replaces the base object entirely", () => {
    const result = getBaseConfig({
      stacEndpoint: "https://my-api.example.com",
    });
    expect(result.stacEndpoint).toBe("https://my-api.example.com");
  });
});

describe("getBaseConfig - partial deep merge preserved", () => {
  it("user brand.name overrides base while keeping other brand fields", () => {
    const result = getBaseConfig({ brand: { name: "My Brand" } });
    expect(result.brand.name).toBe("My Brand");
    expect(result.brand.footerText).toBe("Demo configuration of eodash client");
    expect(result.brand.theme.colors.primary).toBe("#002742");
  });

  it("call with no config returns a config with the default id", () => {
    const result = getBaseConfig();
    expect(result.id).toBe("demo");
  });
});
