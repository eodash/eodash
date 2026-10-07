import pino from "pino";
import pinoHttp from "pino-http";

const isTest = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);
const defaultLevel =
  process.env.LOG_LEVEL ||
  (isTest
    ? "silent"
    : process.env.NODE_ENV === "production"
      ? "info"
      : "debug");

/**
 * Root Pino logger writing to stderr to keep stdout clean for stdio JSON-RPC transport
 */
export const logger = pino(
  {
    level: defaultLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "headers.authorization",
        "headers.cookie",
        "authorization",
        "cookie",
      ],
      censor: "[REDACTED]",
    },
  },
  process.stderr,
);

/**
 * Express HTTP access logging middleware
 */
export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    // Avoid noisy K8s liveness/readiness probe logs
    ignore: (req) => req.url === "/health",
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req, res, responseTime) => {
    return `${req.method} ${req.url} ${res.statusCode} (${Math.round(responseTime)}ms)`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
  customAttributeKeys: {
    responseTime: "duration_ms",
  },
});

/**
 * Summarize input params to prevent logging huge JSON documents
 */
function summarizeParams(params) {
  if (!params || typeof params !== "object") return params;
  const summary = { ...params };
  if (summary.stac_object) {
    summary.stac_object = {
      type: summary.stac_object.type,
      id: summary.stac_object.id,
      size_bytes: JSON.stringify(summary.stac_object).length,
    };
  }
  if (summary.config) {
    summary.config = {
      type:
        typeof summary.config === "string"
          ? "raw_json_string"
          : summary.config?.type,
      id: typeof summary.config === "object" ? summary.config?.id : undefined,
      size_bytes: JSON.stringify(summary.config).length,
    };
  }
  return summary;
}

/**
 * Extract semantic metrics from tool output
 */
function extractResultMetrics(toolName, result) {
  if (!result?.content?.[0]?.text) return undefined;
  try {
    const text = result.content[0].text;
    const parsed = JSON.parse(text);
    if (toolName === "generate_map_from_stac") {
      return {
        layers_count: Array.isArray(parsed.layers) ? parsed.layers.length : 0,
        projection: parsed.viewProjection || parsed.projection,
        has_time_control: Boolean(parsed.timeControl),
        legends_count: Array.isArray(parsed.legends)
          ? parsed.legends.length
          : 0,
      };
    }
    if (toolName === "validate_catalog_config") {
      return {
        valid: parsed.valid,
        schema: parsed.schema,
        errors_count: Array.isArray(parsed.errors) ? parsed.errors.length : 0,
      };
    }
    if (toolName === "find_examples") {
      return {
        matches_count: Array.isArray(parsed) ? parsed.length : 0,
      };
    }
    if (toolName === "list_widgets") {
      return {
        widgets_count: Array.isArray(parsed) ? parsed.length : 0,
      };
    }
    if (toolName === "get_widget_details") {
      return {
        widget: parsed.name,
        category: parsed.category,
      };
    }
  } catch {
    // Non-JSON outputs ignored
  }
  return undefined;
}

function extractErrorText(result) {
  if (!result?.content?.[0]?.text) return "Unknown error";
  try {
    const parsed = JSON.parse(result.content[0].text);
    return parsed.error || parsed.message || result.content[0].text;
  } catch {
    return result.content[0].text;
  }
}

/**
 * Higher-order function to instrument an MCP tool handler with timing, metrics, and structured logs
 * @param {string} toolName
 * @param {Function} handler
 * @returns {Function}
 */
export function instrumentTool(toolName, handler) {
  return async (params) => {
    const start = performance.now();
    logger.debug({
      event: "tool_start",
      tool: toolName,
      params: summarizeParams(params),
    });

    try {
      const result = await handler(params);
      const durationMs = Math.round(performance.now() - start);

      if (result?.isError) {
        logger.warn({
          event: "tool_call",
          tool: toolName,
          status: "error",
          duration_ms: durationMs,
          params: summarizeParams(params),
          error: extractErrorText(result),
        });
      } else {
        logger.info({
          event: "tool_call",
          tool: toolName,
          status: "success",
          duration_ms: durationMs,
          params: summarizeParams(params),
          metrics: extractResultMetrics(toolName, result),
        });
      }

      return result;
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      logger.error({
        event: "tool_call",
        tool: toolName,
        status: "failure",
        duration_ms: durationMs,
        params: summarizeParams(params),
        error: err.message,
        stack: err.stack,
      });
      throw err;
    }
  };
}
