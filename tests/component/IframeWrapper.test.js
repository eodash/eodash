import { describe, expect, test } from "vitest";
import IframeWrapper from "@/components/IframeWrapper.vue";
import { mountComponent } from "../support/mount";

const HELLO_HTML =
  '<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>Hello World</title></head><body><h2 id="hw">Hello World</h2></body></html>';

describe("IframeWrapper", () => {
  test("renders external html inside the iframe", async () => {
    const url = URL.createObjectURL(
      new Blob([HELLO_HTML], { type: "text/html" }),
    );

    try {
      await mountComponent(IframeWrapper, { props: { src: url } });
      await expect
        .poll(
          () =>
            document.querySelector("iframe")?.contentDocument?.body
              ?.textContent,
          { timeout: 10000 },
        )
        .toContain("Hello World");
    } finally {
      URL.revokeObjectURL(url);
    }
  });
});
