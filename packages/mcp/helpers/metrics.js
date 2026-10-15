import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from "@prometheus-io/client";

export const register = new Registry();

// Default process metrics with eodash_mcp_ prefix
collectDefaultMetrics({
  register,
  prefix: "eodash_mcp_",
});

// Custom metrics
export const toolCallsTotal = new Counter({
  name: "eodash_mcp_tool_calls_total",
  help: "Total number of MCP tool calls executed",
  labelNames: ["tool", "status"],
  registers: [register],
});

export const toolDurationSeconds = new Histogram({
  name: "eodash_mcp_tool_duration_seconds",
  help: "Duration of MCP tool executions in seconds",
  labelNames: ["tool"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export const rpcRequestsTotal = new Counter({
  name: "eodash_mcp_rpc_requests_total",
  help: "Total number of JSON-RPC requests by method and status",
  labelNames: ["method", "status"],
  registers: [register],
});

export const activeConnections = new Gauge({
  name: "eodash_mcp_active_connections",
  help: "Current number of active HTTP/SSE connections",
  registers: [register],
});

/**
 * Check whether Prometheus metrics are enabled.
 * Defaults to true; can be opted out via ENABLE_PROMETHEUS_METRICS="false".
 * @returns {boolean}
 */
export function isMetricsEnabled() {
  return process.env.ENABLE_PROMETHEUS_METRICS !== "false";
}

/**
 * Record an MCP tool execution
 * @param {string} toolName
 * @param {"success" | "error" | "failure"} status
 * @param {number} [durationSeconds]
 */
export function recordToolCall(toolName, status, durationSeconds) {
  if (!isMetricsEnabled()) return;
  toolCallsTotal.inc({ tool: toolName, status });
  if (typeof durationSeconds === "number" && !Number.isNaN(durationSeconds)) {
    toolDurationSeconds.observe({ tool: toolName }, durationSeconds);
  }
}

/**
 * Record a JSON-RPC request by method and HTTP status
 * @param {string} method
 * @param {"success" | "error"} status
 */
export function recordRpcRequest(method, status) {
  if (!isMetricsEnabled()) return;
  rpcRequestsTotal.inc({ method, status });
}

/**
 * Update the active connections gauge
 * @param {number} count
 */
export function setActiveConnections(count) {
  if (!isMetricsEnabled()) return;
  activeConnections.set(count);
}

/**
 * Get Prometheus metrics text output
 * @returns {Promise<string>}
 */
export async function getMetrics() {
  if (!isMetricsEnabled()) {
    throw new Error("Prometheus metrics disabled");
  }
  return register.metrics();
}

/**
 * Get content-type for Prometheus metrics response
 * @returns {string}
 */
export function getMetricsContentType() {
  return register.contentType;
}

/**
 * Reset all metrics (for tests)
 */
export function _resetMetrics() {
  register.resetMetrics();
}
