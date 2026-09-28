import { afterEach, describe, expect, test, vi } from "vitest";
import { createHTTPInstance } from "../src/http.js";

/** @param {any} body @param {number} [status] */
const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("http client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("given a client", () => {
    test("reads through it and unwraps the body", async () => {
      const client = { get: vi.fn().mockResolvedValue({ data: { id: "c" } }) };

      const body = await createHTTPInstance({ client }).get("https://cat/c");

      expect(body).toEqual({ id: "c" });
      expect(client.get).toHaveBeenCalledWith("https://cat/c", undefined);
    });

    test("hands params over for the client to serialize", async () => {
      const client = { get: vi.fn().mockResolvedValue({ data: {} }) };

      await createHTTPInstance({ client }).get("https://cat/search", {
        bbox: "10,46,11,47",
        limit: 1,
      });

      expect(client.get).toHaveBeenCalledWith("https://cat/search", {
        params: { bbox: "10,46,11,47", limit: 1 },
      });
    });
  });

  describe("without one", () => {
    test("falls back to fetch, so the package needs no http dependency", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(jsonResponse({ id: "c" }));

      const body = await createHTTPInstance().get("https://cat/c");

      expect(body).toEqual({ id: "c" });
      expect(fetchMock).toHaveBeenCalledWith("https://cat/c");
    });

    test("puts params in the query, dropping the ones left undefined", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(jsonResponse({}));

      await createHTTPInstance().get("https://cat/search", {
        bbox: "10,46,11,47",
        limit: 1,
        datetime: undefined,
      });

      const [url] = fetchMock.mock.calls[0];
      const { searchParams } = new URL(String(url));
      // percent-encoded commas filter the same as literal ones, checked against
      // a live api; what matters is that the value stays one parameter
      expect(searchParams.get("bbox")).toBe("10,46,11,47");
      expect(searchParams.get("limit")).toBe("1");
      expect(searchParams.has("datetime")).toBe(false);
    });

    test("asks for the url unchanged when there is nothing to add", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(jsonResponse({}));

      await createHTTPInstance().get("https://cat/c", {});

      expect(fetchMock).toHaveBeenCalledWith("https://cat/c");
    });

    test("throws on a failed response instead of returning its body", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        jsonResponse({ message: "gone" }, 404),
      );

      await expect(
        createHTTPInstance().get("https://cat/missing"),
      ).rejects.toThrow("404");
    });
  });
});
