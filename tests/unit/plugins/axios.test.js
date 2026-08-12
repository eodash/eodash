import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { commands } from "vitest/browser";
import axios from "@/plugins/axios";
import { errorState } from "@/store/states";
import { fetchPreAggregations } from "@/eodashSTAC/helpers";

// Requests are answered by routing the browser, so axios itself is never
// stubbed: it runs its real adapter and builds the real `AxiosError` the
// interceptor branches on. Urls are unique per test to bypass the cache.

/** @param {string} name */
const url = (name) => `https://interceptor.test/${name}.json`;

beforeEach(() => {
  errorState.value = { message: "", details: "", severity: "info" };
});

afterEach(async () => {
  await commands.stopServingFiles();
});

describe("failed requests", () => {
  test("names the file and the status, keeping the request in the details", async () => {
    await commands.serveResponses({
      "missing.json": { status: 404, body: '{"detail":"no such collection"}' },
    });

    await expect(axios.get(url("missing"))).rejects.toThrow();

    expect(errorState.value.message).toBe(
      "Failed to fetch the missing.json (404 Not Found).",
    );
    expect(errorState.value.details).toContain(`GET ${url("missing")}`);
    expect(errorState.value.details).toContain("no such collection");
    // nothing references it, so the user is assumed to have lost what they asked for
    expect(errorState.value.severity).toBe("error");
  });

  test("hands the caller the untouched AxiosError", async () => {
    // sentinelhub-endpoint.js branches on `.response.status` to refresh a token
    await commands.serveResponses({ "expired.json": { status: 401 } });

    await expect(axios.get(url("expired"))).rejects.toMatchObject({
      isAxiosError: true,
      response: { status: 401 },
    });
  });

  test("names the method of a POST in the details", async () => {
    await commands.serveResponses({ "posted.json": { status: 500 } });

    await expect(axios.post(url("posted"), {})).rejects.toThrow();

    expect(errorState.value.message).toBe(
      "Failed to fetch the posted.json (500 Internal Server Error).",
    );
    expect(errorState.value.details).toContain(`POST ${url("posted")}`);
  });

  test("points at the url and CORS when no response arrives", async () => {
    await commands.serveResponses({ "unreachable.json": "abort" });

    await expect(axios.get(url("unreachable"))).rejects.toThrow();

    expect(errorState.value.message).toContain(
      "no response, check the URL and its CORS headers",
    );
  });
});

describe("unparseable payloads", () => {
  test("rejects a body axios could not parse, keeping it in the details", async () => {
    await commands.serveResponses({
      "broken.json": { body: '{"mark": "line",' },
    });

    // the interceptor is the origin here, so it still rejects axios-shaped
    await expect(axios.get(url("broken"))).rejects.toMatchObject({
      isAxiosError: true,
      response: { status: 200 },
    });

    expect(errorState.value.message).toBe(
      "Failed to parse the broken.json (not valid JSON).",
    );
    expect(errorState.value.details).toContain('{"mark": "line",');
  });

  test("reports an html page as unparseable, keeping the markup in the details", async () => {
    await commands.serveResponses({
      "landing.json": {
        body: "<!doctype html>\n<html><body>Not Found</body></html>",
        contentType: "text/html",
      },
    });

    await expect(axios.get(url("landing"))).rejects.toThrow();

    expect(errorState.value.message).toBe(
      "Failed to parse the landing.json (not valid JSON).",
    );
    expect(errorState.value.details).toContain("<!doctype html>");
  });

  test("passes a string body through when the caller asked for text", async () => {
    await commands.serveResponses({
      "template.json": { body: "not json at all", contentType: "text/plain" },
    });

    const { data } = await axios.get(url("template"), { responseType: "text" });

    expect(data).toBe("not json at all");
    expect(errorState.value.message).toBe("");
  });
});

describe("blob urls", () => {
  // parquet items are turned into blob links, so these bypass the network
  test("resolves a blob url without reporting anything", async () => {
    const blobUrl = URL.createObjectURL(
      new Blob(['{"id":"i1"}'], { type: "application/json" }),
    );

    const { data } = await axios.get(blobUrl);

    expect(data).toEqual({ id: "i1" });
    expect(errorState.value.message).toBe("");
    URL.revokeObjectURL(blobUrl);
  });

  test("reports a revoked blob url as a failed fetch", async () => {
    const blobUrl = URL.createObjectURL(new Blob(["{}"]));
    URL.revokeObjectURL(blobUrl);

    await expect(axios.get(blobUrl)).rejects.toThrow();

    expect(errorState.value.details).toContain(`GET ${blobUrl}`);
  });
});

describe("described resources", () => {
  /** @param {Record<string, any>} extra */
  const collection = (extra) =>
    JSON.stringify({
      type: "Collection",
      stac_version: "1.0.0",
      id: "coll",
      links: [],
      ...extra,
    });

  test("names the style link and degrades to a warning", async () => {
    await commands.serveResponses({
      "styled.json": {
        body: collection({
          links: [{ rel: "style", href: url("theme") }],
        }),
      },
      "theme.json": { status: 404 },
    });
    await axios.get(url("styled"));

    await expect(axios.get(url("theme"))).rejects.toThrow();

    expect(errorState.value.message).toContain(
      "Failed to fetch the layer style",
    );
    // the layer still renders, unstyled
    expect(errorState.value.severity).toBe("warning");
  });

  test.each([
    ["eodash:vegadefinition", "chart definition", "warning"],
    ["eodash:jsonform", "process form definition", "error"],
  ])(
    "names %s the %s and reports it as %s",
    async (property, label, severity) => {
      const target = property.replace(":", "-");
      const referrer = `${target}-referrer`;
      await commands.serveResponses({
        [`${referrer}.json`]: { body: collection({ [property]: url(target) }) },
        [`${target}.json`]: { status: 404 },
      });
      await axios.get(url(referrer));

      await expect(axios.get(url(target))).rejects.toThrow();

      expect(errorState.value.message).toContain(
        `Failed to fetch the ${label}`,
      );
      expect(errorState.value.severity).toBe(severity);
    },
  );

  test("still names it after the child collections have been fetched", async () => {
    // updateEodashCollections fetches every child collection after the
    // indicator, so the referencing document is no longer the latest one
    await commands.serveResponses({
      "indicator.json": {
        body: collection({ "eodash:jsonform": url("form") }),
      },
      "child-a.json": { body: collection({ id: "a" }) },
      "child-b.json": { body: collection({ id: "b" }) },
      "form.json": { status: 404 },
    });
    await axios.get(url("indicator"));
    await axios.get(url("child-a"));
    await axios.get(url("child-b"));

    await expect(axios.get(url("form"))).rejects.toThrow();

    expect(errorState.value.message).toContain(
      "Failed to fetch the process form definition",
    );
  });
});

describe("swallowed failures", () => {
  test("a caller that catches and degrades still shows the user the failure", async () => {
    await commands.serveResponses({ "agg.json": { status: 404 } });

    // fetchPreAggregations catches, warns, and falls back to the item links
    const result = await fetchPreAggregations(
      /** @type {any} */ ({
        id: "coll",
        links: [
          {
            rel: "pre-aggregation",
            "aggregation:interval": "daily",
            href: url("agg"),
          },
        ],
      }),
      "https://interceptor.test/collection.json",
    );

    expect(result).toBeNull();
    expect(errorState.value.message).toBe(
      "Failed to fetch the agg.json (404 Not Found).",
    );
  });
});

describe("aborted requests", () => {
  test("leaves a deliberate cancellation untouched and unreported", async () => {
    await commands.serveResponses({ "cancelled.json": { body: "{}" } });
    const controller = new AbortController();

    const request = axios.get(url("cancelled"), {
      signal: controller.signal,
    });
    controller.abort();

    // filters.js matches on this name to keep the previous catalog items
    await expect(request).rejects.toMatchObject({ name: "CanceledError" });
    expect(errorState.value.message).toBe("");
  });
});
