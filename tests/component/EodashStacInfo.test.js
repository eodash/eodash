import { beforeEach, describe, expect, test, vi } from "vitest";
import EodashStacInfo from "^/EodashStacInfo.vue";
import { currentUrl } from "@/store/states";
import { eodashCollections } from "@/store/stac";
import { mountComponent } from "../support/mount";

vi.mock("@eox/stacinfo", () => ({}));

const stacInfoFor = () =>
  /** @type {(HTMLElement & { for?: string }) | null} */ (
    document.querySelector("eox-stacinfo")
  )?.for;

/**
 * Seed a reader that reports the given item as the one it rendered.
 * @param {Record<string, any>} item
 */
const seedRenderedItem = (item) => eodashCollections.push({ item });

describe("EodashStacInfo", () => {
  beforeEach(() => {
    // currentUrl and the readers are module singletons.
    currentUrl.value = "";
    eodashCollections.splice(0);
  });

  test("collection level binds .for to currentUrl", async () => {
    currentUrl.value = "https://example.test/collection.json";
    await mountComponent(EodashStacInfo);

    await expect
      .poll(() => stacInfoFor())
      .toBe("https://example.test/collection.json");
  });

  test("renders nothing when there is no url", async () => {
    await mountComponent(EodashStacInfo);

    await expect.poll(() => document.querySelector("eox-stacinfo")).toBeNull();
  });

  test("item level uses the self link of the rendered item", async () => {
    seedRenderedItem({
      collection: "c",
      id: "i",
      properties: {},
      links: [{ rel: "self", href: "https://example.test/self.json" }],
    });
    await mountComponent(EodashStacInfo, { props: { level: "item" } });

    await expect
      .poll(() => stacInfoFor())
      .toBe("https://example.test/self.json");
  });

  test("item level creates a blob url when the rendered item has no self link", async () => {
    seedRenderedItem({ collection: "c", id: "i", properties: {}, links: [] });
    await mountComponent(EodashStacInfo, { props: { level: "item" } });

    await expect.poll(() => stacInfoFor()).toMatch(/^blob:/);
  });
});
