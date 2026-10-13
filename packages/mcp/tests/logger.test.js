import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger, httpLogger, instrumentTool } from "../helpers/logger.js";
import express from "express";
import http from "node:http";

describe("Logger & Observability Infrastructure", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Base Pino Logger", () => {
    it("exports initialized logger with configured properties", () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.debug).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.error).toBe("function");
    });
  });

  describe("HTTP Access Logging (pino-http)", () => {
    it("ignores /health endpoint from request logging", async () => {
      const app = express();
      app.use(httpLogger);
      app.get("/health", (_req, res) => res.json({ status: "ok" }));

      const server = http.createServer(app);
      await new Promise((resolve) => server.listen(0, resolve));
      const port = server.address().port;

      const logSpy = vi.spyOn(logger, "info");

      try {
        const res = await fetch(`http://127.0.0.1:${port}/health`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toEqual({ status: "ok" });

        // autoLogging ignore should not call logger for /health
        const healthLogs = logSpy.mock.calls.filter(
          ([obj, msg]) =>
            obj?.req?.url === "/health" ||
            (typeof msg === "string" && msg.includes("/health")),
        );
        expect(healthLogs.length).toBe(0);
      } finally {
        await new Promise((resolve) => server.close(resolve));
      }
    });

    it("logs non-health requests with status and timing", async () => {
      const app = express();
      app.use(httpLogger);
      app.get("/api/test", (_req, res) => res.json({ result: "done" }));

      const server = http.createServer(app);
      await new Promise((resolve) => server.listen(0, resolve));
      const port = server.address().port;

      const logSpy = vi.spyOn(logger, "info");

      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/test`);
        expect(res.status).toBe(200);

        // Wait a tick for res.on('finish') log callback to complete
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(logSpy).toHaveBeenCalled();
        const match = logSpy.mock.calls.some(
          ([obj, msg]) =>
            obj?.req?.url === "/api/test" ||
            (typeof msg === "string" && msg.includes("/api/test")),
        );
        expect(match).toBe(true);
      } finally {
        await new Promise((resolve) => server.close(resolve));
      }
    });
  });

  describe("Tool Instrumentation (instrumentTool)", () => {
    it("instruments successful tool call with timing, params, and metrics", async () => {
      const infoSpy = vi.spyOn(logger, "info");
      const mockHandler = vi.fn().mockResolvedValue({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              layers: [{ id: "layer1" }, { id: "layer2" }],
              viewProjection: "EPSG:3857",
            }),
          },
        ],
      });

      const wrapped = instrumentTool("generate_map_from_stac", mockHandler);
      const result = await wrapped({
        url: "https://example.com/stac",
        query: "NO2",
      });

      expect(mockHandler).toHaveBeenCalledWith({
        url: "https://example.com/stac",
        query: "NO2",
      });
      expect(result).toBeDefined();

      expect(infoSpy).toHaveBeenCalled();
      const toolLog = infoSpy.mock.calls.find(
        (args) => args[0]?.event === "tool_call",
      )?.[0];

      expect(toolLog).toBeDefined();
      expect(toolLog.tool).toBe("generate_map_from_stac");
      expect(toolLog.status).toBe("success");
      expect(typeof toolLog.duration_ms).toBe("number");
      expect(toolLog.params.url).toBe("https://example.com/stac");
      expect(toolLog.metrics).toEqual({
        layers_count: 2,
        projection: "EPSG:3857",
        has_time_control: false,
        legends_count: 0,
      });
    });

    it("summarizes large stac_object and config payloads in log parameters", async () => {
      const infoSpy = vi.spyOn(logger, "info");
      const mockHandler = vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "{}" }],
      });

      const largeObject = {
        type: "Feature",
        id: "item-123",
        geometry: { type: "Polygon", coordinates: [] },
        properties: { a: 1, b: 2, c: 3 },
      };

      const wrapped = instrumentTool("generate_map_from_stac", mockHandler);
      await wrapped({ stac_object: largeObject });

      const toolLog = infoSpy.mock.calls.find(
        (args) => args[0]?.event === "tool_call",
      )?.[0];

      expect(toolLog).toBeDefined();
      expect(toolLog.params.stac_object).toBeDefined();
      expect(toolLog.params.stac_object.type).toBe("Feature");
      expect(toolLog.params.stac_object.id).toBe("item-123");
      expect(typeof toolLog.params.stac_object.size_bytes).toBe("number");
      expect(toolLog.params.stac_object.size_bytes).toBeGreaterThan(10);
    });

    it("logs error warning when tool returns isError: true", async () => {
      const warnSpy = vi.spyOn(logger, "warn");
      const mockHandler = vi.fn().mockResolvedValue({
        isError: true,
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: "Ambiguous query",
              message: "Multiple matches found",
            }),
          },
        ],
      });

      const wrapped = instrumentTool("generate_map_from_stac", mockHandler);
      const result = await wrapped({ query: "air" });

      expect(result.isError).toBe(true);
      expect(warnSpy).toHaveBeenCalled();

      const errorLog = warnSpy.mock.calls.find(
        (args) => args[0]?.event === "tool_call",
      )?.[0];

      expect(errorLog).toBeDefined();
      expect(errorLog.status).toBe("error");
      expect(errorLog.error).toBe("Ambiguous query");
    });

    it("logs failure and re-throws when tool throws an unhandled exception", async () => {
      const errorSpy = vi.spyOn(logger, "error");
      const mockHandler = vi
        .fn()
        .mockRejectedValue(new Error("Network timeout"));

      const wrapped = instrumentTool("generate_map_from_stac", mockHandler);

      await expect(wrapped({ url: "https://fail.com" })).rejects.toThrow(
        "Network timeout",
      );

      expect(errorSpy).toHaveBeenCalled();
      const failLog = errorSpy.mock.calls.find(
        (args) => args[0]?.event === "tool_call",
      )?.[0];

      expect(failLog).toBeDefined();
      expect(failLog.status).toBe("failure");
      expect(failLog.error).toBe("Network timeout");
      expect(failLog.stack).toBeDefined();
    });
  });
});
