import { beforeEach, describe, expect, test, vi } from "vitest";
import { getTooltipProperties } from "../src/index.js";
import { serveUrls } from "../../../tests/support/stac.js";

// What the style documents an item links contribute, beyond the layer style
// itself. Which layer a style ends up on is pinned in assets/links.test.js.

/** Stands in for the app's axios instance. */
const client = { get: vi.fn() };

/** @param {Record<string, any>[]} links */
const itemWith = (links) =>
  /** @type {any} */ ({ id: "item", properties: {}, assets: {}, links });

describe("getTooltipProperties", () => {
  beforeEach(() => {
    client.get.mockReset();
  });

  test("collects the tooltip fields every style link declares", async () => {
    serveUrls(client, {
      "https://s/a.json": { tooltip: [{ id: "name" }] },
      "https://s/b.json": { tooltip: [{ id: "value", decimals: 2 }] },
    });

    const tooltips = await getTooltipProperties(
      itemWith([
        { rel: "style", href: "https://s/a.json" },
        { rel: "item-style", href: "https://s/b.json" },
      ]),
      { client },
    );

    expect(tooltips).toEqual([{ id: "name" }, { id: "value", decimals: 2 }]);
  });

  test("keeps one entry per id, the last style to name it winning", async () => {
    serveUrls(client, {
      "https://s/a.json": { tooltip: [{ id: "value", decimals: 2 }] },
      "https://s/b.json": { tooltip: [{ id: "value", decimals: 9 }] },
    });

    const tooltips = await getTooltipProperties(
      itemWith([
        { rel: "style", href: "https://s/a.json" },
        { rel: "style", href: "https://s/b.json" },
      ]),
      { client },
    );

    expect(tooltips).toEqual([{ id: "value", decimals: 9 }]);
  });

  test("reads nothing when the item states no style link", async () => {
    serveUrls(client, {});

    expect(await getTooltipProperties(itemWith([]), { client })).toEqual([]);
    expect(client.get).not.toHaveBeenCalled();
  });

  test("ignores a style that declares no tooltip", async () => {
    serveUrls(client, { "https://s/a.json": { variables: {} } });

    expect(
      await getTooltipProperties(
        itemWith([{ rel: "style", href: "https://s/a.json" }]),
        { client },
      ),
    ).toEqual([]);
  });
});
