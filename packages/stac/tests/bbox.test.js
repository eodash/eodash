import { describe, expect, test } from "vitest";
import { bboxToCenterZoom, sanitizeBbox } from "../src/helpers/bbox.js";

describe("bboxToCenterZoom", () => {
  test("centers on the midpoint of a bbox within range", () => {
    expect(bboxToCenterZoom([10, -10, 20, 10])).toEqual({
      center: [15, 0],
      zoom: 5,
    });
  });

  test("centers a bbox crossing the antimeridian on the far side", () => {
    expect(bboxToCenterZoom([170, -10, -170, 10])).toEqual({
      center: [-180, 0],
      zoom: 5,
    });
  });

  test("centers an uneven crossing bbox on its true middle", () => {
    expect(bboxToCenterZoom([170, -10, -160, 10])).toEqual({
      center: [-175, 0],
      zoom: 5,
    });
  });

  test("takes the zoom from longitude when the bbox is wide and short", () => {
    expect(bboxToCenterZoom([-160, -2, 160, 2]).zoom).toBe(1);
  });

  test("takes the zoom from latitude when the bbox is tall and narrow", () => {
    expect(bboxToCenterZoom([-2, -60, 2, 60]).zoom).toBe(2);
  });

  test("caps the zoom of a bbox with no area", () => {
    expect(bboxToCenterZoom([5, 5, 5, 5])).toEqual({
      center: [5, 5],
      zoom: 20,
    });
  });
});

describe("sanitizeBbox", () => {
  test("leaves a bbox within range alone", () => {
    expect(sanitizeBbox([10, -10, 20, 10])).toEqual([10, -10, 20, 10]);
  });

  test("leaves a bbox crossing the antimeridian alone", () => {
    // why bboxToCenterZoom resolves the wrap itself: nothing upstream does
    expect(sanitizeBbox([170, -10, -170, 10])).toEqual([170, -10, -170, 10]);
  });

  test("clamps coordinates beyond the world", () => {
    // the modulo alone returns -200/200 here; only the clamps bring it in range
    expect(sanitizeBbox([-200, -100, 200, 100])).toEqual([-180, -90, 180, 90]);
  });

  test("leaves the world bbox alone", () => {
    expect(sanitizeBbox([-180, -90, 180, 90])).toEqual([-180, -90, 180, 90]);
  });

  test("falls back to an empty bbox when the input is not four numbers", () => {
    expect(sanitizeBbox([1, 2, 3])).toEqual([0, 0, 0, 0]);
    expect(sanitizeBbox([])).toEqual([0, 0, 0, 0]);
  });
});
