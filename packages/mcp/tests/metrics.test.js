import { describe, it, expect, beforeEach } from "vitest";
import {
  recordToolCall,
  recordRpcRequest,
  setActiveConnections,
  getMetrics,
  getMetricsContentType,
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
    expect(metrics).toContain('tool="generate_map_from_stac",status="success"} 1');
    expect(metrics).toContain('tool="generate_map_from_stac",status="error"} 1');
    expect(metrics).toContain('tool="validate_catalog_config",status="success"} 1');

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

  it("tracks active connections gauge", async () => {
    setActiveConnections(5);
    let metrics = await getMetrics();
    expect(metrics).toContain("eodash_mcp_active_connections 5");

    setActiveConnections(2);
    metrics = await getMetrics();
    expect(metrics).toContain("eodash_mcp_active_connections 2");
  });

  it("includes default Node.js process metrics with eodash_mcp_ prefix", async () => {
    const metrics = await getMetrics();
    expect(metrics).toContain("eodash_mcp_process_cpu_user_seconds_total");
    expect(metrics).toContain("eodash_mcp_nodejs_heap_size_total_bytes");
  });
});
