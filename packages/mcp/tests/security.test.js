import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "node:http";
import {
  isPrivateOrReservedIP,
  validateUrlIsSafe,
} from "../helpers/safe-fetch.js";
import {
  hasCircularReference,
  sanitizeText,
  countGeoJsonVertices,
} from "../helpers/security.js";
import { buildStacMap } from "../generators/stac-map.js";
import { createExpressApp } from "../server.js";

describe("MCP Security Hardening & Defenses", () => {
  describe("Task 1: SSRF Guard & IP Validation", () => {
    it("identifies private and reserved IPv4 and IPv6 addresses", () => {
      // Loopback
      expect(isPrivateOrReservedIP("127.0.0.1")).toBe(true);
      expect(isPrivateOrReservedIP("127.255.255.255")).toBe(true);
      expect(isPrivateOrReservedIP("::1")).toBe(true);

      // Cloud metadata / link-local
      expect(isPrivateOrReservedIP("169.254.169.254")).toBe(true);
      expect(isPrivateOrReservedIP("fe80::1")).toBe(true);

      // RFC 1918 Private ranges
      expect(isPrivateOrReservedIP("10.0.0.1")).toBe(true);
      expect(isPrivateOrReservedIP("172.16.0.1")).toBe(true);
      expect(isPrivateOrReservedIP("172.31.255.255")).toBe(true);
      expect(isPrivateOrReservedIP("192.168.1.100")).toBe(true);

      // IPv6 ULA
      expect(isPrivateOrReservedIP("fc00::1")).toBe(true);
      expect(isPrivateOrReservedIP("fd12:3456::1")).toBe(true);

      // Public IPs allowed
      expect(isPrivateOrReservedIP("8.8.8.8")).toBe(false);
      expect(isPrivateOrReservedIP("1.1.1.1")).toBe(false);
      expect(isPrivateOrReservedIP("172.32.0.1")).toBe(false);
      expect(isPrivateOrReservedIP("2606:4700:4700::1111")).toBe(false);
    });

    it("rejects non-http/https protocols", async () => {
      await expect(validateUrlIsSafe("file:///etc/passwd")).rejects.toThrow(
        /Forbidden protocol "file:"/,
      );
      await expect(validateUrlIsSafe("ftp://server/data")).rejects.toThrow(
        /Forbidden protocol "ftp:"/,
      );
      await expect(validateUrlIsSafe("gopher://server/data")).rejects.toThrow(
        /Forbidden protocol "gopher:"/,
      );
    });

    it("rejects requests to localhost and private cloud metadata IPs", async () => {
      await expect(
        validateUrlIsSafe("http://169.254.169.254/latest/meta-data"),
      ).rejects.toThrow(/Forbidden target IP address/);

      await expect(
        validateUrlIsSafe("http://localhost:8080/secret"),
      ).rejects.toThrow(/Forbidden hostname "localhost"/);

      await expect(
        validateUrlIsSafe("http://service.internal/api"),
      ).rejects.toThrow(/Forbidden hostname "service.internal"/);
    });
  });

  describe("Task 2: Inbound Payload Limits (Express 1MB)", () => {
    let server;
    let baseUrl;

    beforeAll(async () => {
      const app = createExpressApp(() => ({
        connect: async () => {},
      }));
      await new Promise((resolve) => {
        server = http.createServer(app).listen(0, () => {
          const port = server.address().port;
          baseUrl = `http://127.0.0.1:${port}`;
          resolve();
        });
      });
    });

    afterAll(async () => {
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
    });

    it("returns 413 Payload Too Large when request body exceeds 1MB", async () => {
      // Create a payload larger than 1MB (~1.2MB string)
      const largePayload = JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: "generate_map_from_stac",
          arguments: {
            stac_object: {
              data: "A".repeat(1.2 * 1024 * 1024),
            },
          },
        },
        id: 1,
      });

      const res = await fetch(`${baseUrl}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: largePayload,
      });

      expect(res.status).toBe(413);
      const json = await res.json();
      expect(json.error.message).toContain("1MB limit");
    });
  });

  describe("Task 3: Circular Object Detection & Crawl Limits", () => {
    it("detects circular references in in-memory STAC objects", () => {
      const normalObj = { a: 1, b: { c: [1, 2, 3] } };
      expect(hasCircularReference(normalObj)).toBe(false);

      const circularObj = { name: "test", links: [] };
      circularObj.selfRef = circularObj;
      expect(hasCircularReference(circularObj)).toBe(true);

      const nestedCircular = { a: { b: { c: {} } } };
      nestedCircular.a.b.c.loop = nestedCircular.a;
      expect(hasCircularReference(nestedCircular)).toBe(true);
    });

    it("throws a clear error when buildStacMap receives a circular STAC object", async () => {
      const circularObj = {
        type: "Collection",
        id: "circular_col",
      };
      circularObj.cycle = circularObj;

      await expect(buildStacMap({ stac_object: circularObj })).rejects.toThrow(
        /circular references detected/,
      );
    });
  });

  describe("Task 4: Text Sanitization & Character Limits", () => {
    it("strips null bytes, non-printable control characters, and zero-width Unicode", () => {
      const dirty =
        "Test\x00Description\x1FWith\x08Control\u200BZero\u200CWidth\uFEFFChars\nPreserves\tTabs";
      const cleaned = sanitizeText(dirty, 1000);
      expect(cleaned).toBe(
        "TestDescriptionWithControlZeroWidthChars\nPreserves\tTabs",
      );
    });

    it("truncates description strings exceeding max length", () => {
      const longText = "x".repeat(1500);
      const truncated = sanitizeText(longText, 1000);
      expect(truncated.length).toBe(1000);
    });

    it("sanitizes mapConfig indicator.description when generated", async () => {
      const dirtyDescription =
        "Dirty\x00Description\u200Bwith\uFEFFzero-width" + "a".repeat(1200);
      const collectionObj = {
        type: "Collection",
        id: "col_sanitized",
        title: "Test Title\x00Clean",
        description: dirtyDescription,
        extent: {
          spatial: { bbox: [[-180, -90, 180, 90]] },
          temporal: {
            interval: [["2020-01-01T00:00:00Z", "2020-01-02T00:00:00Z"]],
          },
        },
        links: [{ rel: "self", href: "https://example.com/collection.json" }],
      };

      const mapConfig = await buildStacMap({ stac_object: collectionObj });
      if (mapConfig.indicator?.description) {
        expect(mapConfig.indicator.description).not.toContain("\x00");
        expect(mapConfig.indicator.description).not.toContain("\u200B");
        expect(mapConfig.indicator.description.length).toBeLessThanOrEqual(
          1000,
        );
      }
    });

    it("detects and rejects massive GeoJSON vertex flood (>50,000 vertices)", async () => {
      // Normal geometry
      const normalGeom = {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0],
          ],
        ],
      };
      expect(countGeoJsonVertices(normalGeom)).toBe(5);

      // Huge coordinates
      const hugeCoords = [];
      for (let i = 0; i < 50_001; i++) {
        hugeCoords.push([i, i]);
      }
      const floodGeom = {
        type: "LineString",
        coordinates: hugeCoords,
      };

      const floodItem = {
        type: "Feature",
        id: "flood_item",
        geometry: floodGeom,
        properties: { datetime: "2025-01-01T00:00:00Z" },
        links: [],
      };

      await expect(buildStacMap({ stac_object: floodItem })).rejects.toThrow(
        /geometry exceeds maximum allowed vertex limit/,
      );
    });
  });

  describe("Task 5: SSE / Connection Limiter per IP and Global Cap", () => {
    let server;
    let baseUrl;

    beforeAll(async () => {
      // Set limit to 2 connections for this test
      process.env.MAX_CONNECTIONS_PER_IP = "2";
      process.env.MAX_SSE_CONNECTIONS = "5";
      const app = createExpressApp(() => ({
        connect: async () => {},
      }));
      await new Promise((resolve) => {
        server = http.createServer(app).listen(0, () => {
          const port = server.address().port;
          baseUrl = `http://127.0.0.1:${port}`;
          resolve();
        });
      });
    });

    afterAll(async () => {
      delete process.env.MAX_CONNECTIONS_PER_IP;
      delete process.env.MAX_SSE_CONNECTIONS;
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
    });

    it("allows requests under the concurrency threshold", async () => {
      const res1 = await fetch(`${baseUrl}/health`);
      expect(res1.status).toBe(200);

      const res2 = await fetch(`${baseUrl}/health`);
      expect(res2.status).toBe(200);
    });
  });
});
