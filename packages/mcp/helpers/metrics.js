import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from "@prometheus-io/client";

export const register = new Registry();

let defaultMetricsInitialized = false;

/**
 * Known JSON-RPC / MCP methods.
 * Any unlisted method is categorized as "other".
 */
export const KNOWN_RPC_METHODS = new Set([
  "initialize",
  "notifications/initialized",
  "notifications/cancelled",
  "ping",
  "tools/list",
  "tools/call",
  "resources/list",
  "resources/read",
  "resources/templates/list",
  "prompts/list",
  "prompts/get",
  "logging/setLevel",
  "completion/complete",
]);

/**
 * Initialize collection of default Node.js process metrics with eodash_mcp_ prefix.
 * Only runs if Prometheus metrics are enabled and runs once.
 */
export function initDefaultMetrics() {
  if (!isMetricsEnabled() || defaultMetricsInitialized) return;
  collectDefaultMetrics({
    register,
    prefix: "eodash_mcp_",
  });
  defaultMetricsInitialized = true;
}

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
 * Record a JSON-RPC request by method and HTTP status.
 * Unrecognized or dynamic methods are clamped to "other".
 * @param {string} method
 * @param {"success" | "error"} status
 */
export function recordRpcRequest(method, status) {
  if (!isMetricsEnabled()) return;
  const safeMethod =
    typeof method === "string" && KNOWN_RPC_METHODS.has(method)
      ? method
      : "other";
  rpcRequestsTotal.inc({ method: safeMethod, status });
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
  initDefaultMetrics();
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
