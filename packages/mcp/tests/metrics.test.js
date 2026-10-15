import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  recordToolCall,
  recordRpcRequest,
  setActiveConnections,
  getMetrics,
  getMetricsContentType,
  isMetricsEnabled,
  _resetMetrics,
} from "../helpers/metrics.js";

describe("Prometheus Metrics Infrastructure", () => {
  beforeEach(() => {
    _resetMetrics();
  });

  it("exports correct Prometheus content-type", () => {
    const contentType = getMetricsContentType();
    expect(contentType).toContain("text/plain");
    expect(contentType).toContain("version=0.0.4");
  });

  it("records tool calls with status and observes execution duration", async () => {
    recordToolCall("generate_map_from_stac", "success", 0.042);
    recordToolCall("generate_map_from_stac", "error", 0.015);
    recordToolCall("validate_catalog_config", "success", 0.12);

    const metrics = await getMetrics();

    expect(metrics).toContain("eodash_mcp_tool_calls_total");
    expect(metrics).toContain(
      'tool="generate_map_from_stac",status="success"} 1',
    );
    expect(metrics).toContain(
      'tool="generate_map_from_stac",status="error"} 1',
    );
    expect(metrics).toContain(
      'tool="validate_catalog_config",status="success"} 1',
    );

    expect(metrics).toContain("eodash_mcp_tool_duration_seconds_bucket");
    expect(metrics).toContain('tool="generate_map_from_stac"');
    expect(metrics).toContain("eodash_mcp_tool_duration_seconds_sum");
  });

  it("records JSON-RPC requests by method and status", async () => {
    recordRpcRequest("initialize", "success");
    recordRpcRequest("tools/list", "success");
    recordRpcRequest("tools/call", "error");

    const metrics = await getMetrics();

    expect(metrics).toContain("eodash_mcp_rpc_requests_total");
    expect(metrics).toContain('method="initialize",status="success"} 1');
    expect(metrics).toContain('method="tools/list",status="success"} 1');
    expect(metrics).toContain('method="tools/call",status="error"} 1');
  });

  it("clamps unknown or dynamic RPC methods to 'other'", async () => {
    recordRpcRequest("random_rpc_12345", "error");
    recordRpcRequest("undefined_dynamic_method", "success");

    const metrics = await getMetrics();
    expect(metrics).toContain('method="other",status="error"} 1');
    expect(metrics).toContain('method="other",status="success"} 1');
    expect(metrics).not.toContain("random_rpc_12345");
    expect(metrics).not.toContain("undefined_dynamic_method");
  });

  it("tracks active connections gauge", async () => {
    setActiveConnections(5);
    let metrics = await getMetrics();
    expect(metrics).toContain("eodash_mcp_active_connections 5");

    setActiveConnections(2);
    metrics = await getMetrics();
    expect(metrics).toContain("eodash_mcp_active_connections 2");
  });

  it("tracks active connections gauge down to 0", async () => {
    setActiveConnections(3);
    let metrics = await getMetrics();
    expect(metrics).toContain("eodash_mcp_active_connections 3");

    setActiveConnections(0);
    metrics = await getMetrics();
    expect(metrics).toContain("eodash_mcp_active_connections 0");
  });

  it("handles tool calls with failure status and omitted or invalid duration", async () => {
    recordToolCall("generate_map_from_stac", "failure");
    recordToolCall("generate_map_from_stac", "failure", Number.NaN);

    const metrics = await getMetrics();
    expect(metrics).toContain(
      'eodash_mcp_tool_calls_total{tool="generate_map_from_stac",status="failure"} 2',
    );
  });

  it("resets metrics cleanly via _resetMetrics", async () => {
    recordToolCall("custom_tool_test", "success", 0.05);
    setActiveConnections(4);

    let metrics = await getMetrics();
    expect(metrics).toContain("custom_tool_test");
    expect(metrics).toContain("eodash_mcp_active_connections 4");

    _resetMetrics();

    metrics = await getMetrics();
    expect(metrics).not.toContain("custom_tool_test");
    expect(metrics).not.toContain("eodash_mcp_active_connections 4");
  });

  it("includes default Node.js process metrics with eodash_mcp_ prefix", async () => {
    const metrics = await getMetrics();
    expect(metrics).toContain("eodash_mcp_process_cpu_user_seconds_total");
    expect(metrics).toContain("eodash_mcp_nodejs_heap_size_total_bytes");
  });

  describe("ENABLE_PROMETHEUS_METRICS toggle", () => {
    afterEach(() => {
      delete process.env.ENABLE_PROMETHEUS_METRICS;
    });

    it("is enabled by default and disabled when set to 'false'", () => {
      delete process.env.ENABLE_PROMETHEUS_METRICS;
      expect(isMetricsEnabled()).toBe(true);

      process.env.ENABLE_PROMETHEUS_METRICS = "false";
      expect(isMetricsEnabled()).toBe(false);

      process.env.ENABLE_PROMETHEUS_METRICS = "true";
      expect(isMetricsEnabled()).toBe(true);
    });

    it("no-ops recordings and rejects getMetrics when disabled", async () => {
      process.env.ENABLE_PROMETHEUS_METRICS = "false";

      recordToolCall("generate_map_from_stac", "success", 0.05);
      recordRpcRequest("tools/call", "success");
      setActiveConnections(10);

      await expect(getMetrics()).rejects.toThrow("Prometheus metrics disabled");

      // Re-enable and check that no metrics were recorded while disabled
      process.env.ENABLE_PROMETHEUS_METRICS = "true";
      const metrics = await getMetrics();
      expect(metrics).not.toContain("generate_map_from_stac");
      expect(metrics).not.toContain("tools/call");
    });
  });
});
