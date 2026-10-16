import pino from "pino";
import pinoHttp from "pino-http";
import { recordToolCall } from "./metrics.js";

const isTest = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);
const defaultLevel =
  process.env.LOG_LEVEL ||
  (isTest
    ? "silent"
    : process.env.NODE_ENV === "production"
      ? "info"
      : "debug");

const SENSITIVE_QUERY_KEYS = new Set([
  "token",
  "key",
  "apikey",
  "api_key",
  "secret",
  "sig",
  "signature",
  "password",
  "auth",
  "access_token",
  "x-api-key",
  "code",
  "sp",
  "st",
  "se",
  "sr",
  "sv",
  "sastoken",
  "x-amz-security-token",
  "x-amz-signature",
  "x-amz-credential",
  "x-goog-signature",
]);

/**
 * Redacts sensitive tokens/keys from URLs for secure logging
 * @param {string} urlString
 * @returns {string}
 */
export function sanitizeUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return urlString;
  try {
    const isRelative = urlString.startsWith("/");
    const parsed = new URL(urlString, "http://localhost");
    let changed = false;
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
        parsed.searchParams.set(key, "[REDACTED]");
        changed = true;
      }
    }
    if (!changed) return urlString;
    return isRelative
      ? `${parsed.pathname}${parsed.search}`
      : parsed.toString();
  } catch {
    return urlString;
  }
}

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
        "req.headers['x-api-key']",
        "req.headers['api-key']",
        "req.headers['x-auth-token']",
        "req.headers['proxy-authorization']",
        "headers.authorization",
        "headers.cookie",
        "headers['x-api-key']",
        "headers['api-key']",
        "headers['x-auth-token']",
        "headers['proxy-authorization']",
        "authorization",
        "cookie",
        "apiKey",
        "api_key",
        "token",
        "secret",
        "password",
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
  serializers: {
    req: (req) => {
      const serialized = pinoHttp.stdSerializers.req(req);
      if (serialized.url) {
        serialized.url = sanitizeUrl(serialized.url);
      }
      return serialized;
    },
  },
  autoLogging: {
    // Avoid noisy probe logs and Prometheus scrapers
    ignore: (req) =>
      req.url === "/health" ||
      (req.method === "HEAD" && req.url === "/") ||
      req.url === "/metrics",
  },
  customProps: (req) => {
    const props = {};
    if (req.mcpMethod) props.rpc_method = req.mcpMethod;
    if (req.mcpTool) props.tool = req.mcpTool;
    if (req.mcpClient) props.client = req.mcpClient;
    return props;
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req, res, responseTime) => {
    const timeMs = Math.round(responseTime);
    const sanitizedUrl = sanitizeUrl(req.url);
    if (req.mcpTool) {
      return `POST / tools/call ${req.mcpTool} ${res.statusCode} (${timeMs}ms)`;
    }
    if (req.mcpMethod) {
      return `POST / ${req.mcpMethod} ${res.statusCode} (${timeMs}ms)`;
    }
    return `${req.method} ${sanitizedUrl} ${res.statusCode} (${timeMs}ms)`;
  },
  customErrorMessage: (req, res, err) => {
    const sanitizedUrl = sanitizeUrl(req.url);
    if (req.mcpTool) {
      return `POST / tools/call ${req.mcpTool} ${res.statusCode} - ${err.message}`;
    }
    if (req.mcpMethod) {
      return `POST / ${req.mcpMethod} ${res.statusCode} - ${err.message}`;
    }
    return `${req.method} ${sanitizedUrl} ${res.statusCode} - ${err.message}`;
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

  if (summary.url) {
    summary.url = sanitizeUrl(summary.url);
  }

  if (summary.stac_object && typeof summary.stac_object === "object") {
    summary.stac_object = {
      type: summary.stac_object.type,
      id: summary.stac_object.id,
      has_geometry: Boolean(summary.stac_object.geometry),
      has_features: Array.isArray(summary.stac_object.features),
    };
  }
  if (summary.config) {
    summary.config = {
      type:
        typeof summary.config === "string"
          ? "raw_json_string"
          : summary.config?.type,
      id: typeof summary.config === "object" ? summary.config?.id : undefined,
      size_chars:
        typeof summary.config === "string" ? summary.config.length : undefined,
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
        recordToolCall(toolName, "error", durationMs / 1000);
        logger.warn({
          event: "tool_call",
          tool: toolName,
          status: "error",
          duration_ms: durationMs,
          params: summarizeParams(params),
          error: extractErrorText(result),
        });
      } else {
        recordToolCall(toolName, "success", durationMs / 1000);
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
      recordToolCall(toolName, "failure", durationMs / 1000);
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
