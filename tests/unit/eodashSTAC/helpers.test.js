import { describe, expect, test } from "vitest";
import { applyTitilerUpscaling } from "@/eodashSTAC/helpers";

describe("applyTitilerUpscaling", () => {
  const url = "https://api.example.com/tiles/{z}/{x}/{y}?assets=data";

  test("returns null if no endpoint matches", () => {
    const upscalingEndpoints = ["https://other-api.com"];
    expect(applyTitilerUpscaling(url, upscalingEndpoints)).toBeNull();
  });

  test("applies v1 upscaling (default)", () => {
    const upscalingEndpoints = ["https://api.example.com"];
    const result = applyTitilerUpscaling(url, upscalingEndpoints);
    expect(result.url).toBe("https://api.example.com/tiles/{z}/{x}/{y}@2x?assets=data");
    expect(result.tileSize).toEqual([512, 512]);
  });

  test("applies v1 upscaling with scaleFactor", () => {
    const upscalingEndpoints = [
      { url: "https://api.example.com", titilerVersion: 1, scaleFactor: 3 }
    ];
    const result = applyTitilerUpscaling(url, upscalingEndpoints);
    // scaleFactor 3 -> exponent = Math.round(2 * 3) = 6
    expect(result.url).toBe("https://api.example.com/tiles/{z}/{x}/{y}@6x?assets=data");
  });

  test("applies v2 upscaling", () => {
    const upscalingEndpoints = [
      { url: "https://api.example.com", titilerVersion: 2 }
    ];
    const result = applyTitilerUpscaling(url, upscalingEndpoints);
    expect(result.url).toBe("https://api.example.com/tiles/{z}/{x}/{y}?assets=data&tilesize=512");
    expect(result.tileSize).toEqual([512, 512]);
  });

  test("applies v2 upscaling with decimal scaleFactor", () => {
    const upscalingEndpoints = [
      { url: "https://api.example.com", titilerVersion: 2, scaleFactor: 1.5 }
    ];
    const result = applyTitilerUpscaling(url, upscalingEndpoints);
    // 512 * 1.5 = 768
    expect(result.url).toBe("https://api.example.com/tiles/{z}/{x}/{y}?assets=data&tilesize=768");
  });

  test("applies v1 upscaling with decimal scaleFactor (rounded)", () => {
    const upscalingEndpoints = [
      { url: "https://api.example.com", titilerVersion: 1, scaleFactor: 1.4 }
    ];
    const result = applyTitilerUpscaling(url, upscalingEndpoints);
    // scaleFactor 1.4 -> exponent = Math.round(2 * 1.4) = Math.round(2.8) = 3
    expect(result.url).toBe("https://api.example.com/tiles/{z}/{x}/{y}@3x?assets=data");
  });

  test("handles plain string as v1 with scaleFactor 1", () => {
    const upscalingEndpoints = ["https://api.example.com"];
    const result = applyTitilerUpscaling(url, upscalingEndpoints);
    expect(result.url).toContain("@2x");
  });
});
