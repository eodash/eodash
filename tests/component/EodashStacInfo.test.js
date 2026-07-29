import { beforeEach, describe, expect, test, vi } from "vitest";
import EodashStacInfo from "^/EodashStacInfo.vue";
import { currentUrl } from "@/store/states";
import { mountComponent } from "../support/mount";

vi.mock("@eox/stacinfo", () => ({}));

const stacInfoFor = () =>
  /** @type {(HTMLElement & { for?: string }) | null} */ (
    document.querySelector("eox-stacinfo")
  )?.for;

describe("EodashStacInfo", () => {
  beforeEach(() => {
    // currentUrl is a module singleton.
    currentUrl.value = "";
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

  test("item level uses the href of a link-like item", async () => {
    await mountComponent(EodashStacInfo, {
      props: { level: "item" },
      initialState: {
        stac: {
          selectedItem: { href: "https://example.test/item.json", rel: "item" },
        },
      },
    });

    await expect
      .poll(() => stacInfoFor())
      .toBe("https://example.test/item.json");
  });

  test("item level uses the self link of a full STAC item", async () => {
    await mountComponent(EodashStacInfo, {
      props: { level: "item" },
      initialState: {
        stac: {
          selectedItem: {
            collection: "c",
            id: "i",
            properties: {},
            links: [{ rel: "self", href: "https://example.test/self.json" }],
          },
        },
      },
    });

    await expect
      .poll(() => stacInfoFor())
      .toBe("https://example.test/self.json");
  });

  test("item level creates a blob url when a full item has no self link", async () => {
    await mountComponent(EodashStacInfo, {
      props: { level: "item" },
      initialState: {
        stac: {
          selectedItem: { collection: "c", id: "i", properties: {}, links: [] },
        },
      },
    });

    await expect.poll(() => stacInfoFor()).toMatch(/^blob:/);
  });
});
