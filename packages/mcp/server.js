import express from "express";
import cors from "cors";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getMetadata, generateLandingPage } from "./helpers.js";
import { logger, httpLogger } from "./helpers/logger.js";

/**
 * Creates and configures the Express HTTP application for the MCP server
 * @param {() => import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} createServerFn
 */
export function createExpressApp(createServerFn) {
  const app = express();

  let activeGlobalConnections = 0;
  const ipConnections = new Map();
  const maxConnectionsPerIp = parseInt(
    process.env.MAX_CONNECTIONS_PER_IP || "10",
    10,
  );
  const maxGlobalConnections = parseInt(
    process.env.MAX_SSE_CONNECTIONS || "50",
    10,
  );
  const idleTimeoutMs = parseInt(process.env.IDLE_TIMEOUT_MS || "120000", 10);

  app.use(cors({ origin: "*" }));
  app.use(httpLogger);

  // Limit concurrent connections globally (max 50) and per IP (max 10), with idle timeout
  app.use((req, res, next) => {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";

    if (activeGlobalConnections >= maxGlobalConnections) {
      logger.warn({
        event: "rate_limit_exceeded",
        limit_type: "global",
        active_global: activeGlobalConnections,
        max_global: maxGlobalConnections,
        ip: clientIp,
      });
      return res.status(429).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: `Too Many Requests: server reached maximum global concurrent connections (${maxGlobalConnections})`,
        },
        id: null,
      });
    }

    const currentCount = ipConnections.get(clientIp) || 0;
    if (currentCount >= maxConnectionsPerIp) {
      logger.warn({
        event: "rate_limit_exceeded",
        limit_type: "per_ip",
        client_count: currentCount,
        max_per_ip: maxConnectionsPerIp,
        ip: clientIp,
      });
      return res.status(429).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: `Too Many Requests: exceeded maximum concurrent connections (${maxConnectionsPerIp}) per IP`,
        },
        id: null,
      });
    }

    activeGlobalConnections += 1;
    ipConnections.set(clientIp, currentCount + 1);

    // Idle connection reaper: terminates socket if inactive for idleTimeoutMs
    req.setTimeout(idleTimeoutMs, () => {
      if (!res.writableEnded) {
        logger.info({
          event: "idle_connection_reaped",
          ip: clientIp,
          idle_timeout_ms: idleTimeoutMs,
        });
        res.destroy(
          new Error(`Connection closed due to ${idleTimeoutMs}ms idle timeout`),
        );
      }
    });

    res.on("close", () => {
      activeGlobalConnections = Math.max(0, activeGlobalConnections - 1);
      const count = ipConnections.get(clientIp) || 1;
      if (count <= 1) {
        ipConnections.delete(clientIp);
      } else {
        ipConnections.set(clientIp, count - 1);
      }
    });

    next();
  });

  app.use(express.json({ limit: "1mb" }));

  // Handle malformed JSON body errors and payload size limits in standard JSON-RPC format
  app.use((err, req, res, next) => {
    if (err.type === "entity.too.large") {
      logger.warn({
        event: "payload_too_large",
        ip: req.ip,
        limit: "1mb",
      });
      return res.status(413).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Payload Too Large: request body exceeds 1MB limit",
        },
        id: null,
      });
    }
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      logger.warn({
        event: "malformed_json_body",
        ip: req.ip,
        error: err.message,
      });
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32700,
          message: "Parse error: malformed JSON",
        },
        id: null,
      });
    }
    next(err);
  });

  app.get("/health", (_req, res) => {
    res.json({ message: "eodash MCP Server is running" });
  });

  app.get("/ui", (_req, res) => {
    const { widgetsData, architectureData, examplesCount } = getMetadata();
    const serverInstance = createServerFn();
    const tools = Object.entries(serverInstance._registeredTools || {}).map(
      ([name, def]) => ({
        name,
        description: def.description,
      }),
    );
    res.setHeader("Content-Type", "text/html");
    res.send(
      generateLandingPage(widgetsData, architectureData, {
        tools,
        examplesCount,
      }),
    );
  });

  app.get("/", (_req, res) => {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32600,
        message:
          "Method Not Allowed: MCP endpoint requires POST requests. Access UI landing page at /ui.",
      },
      id: null,
    });
  });

  app.post("/", async (req, res) => {
    const origin = req.headers.origin;
    if (origin) {
      try {
        const parsedUrl = new URL(origin);
        const host = parsedUrl.hostname;
        const allowedOrigins = process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
          : [];
        const isAllowedExplicit =
          allowedOrigins.includes(origin) || allowedOrigins.includes(host);
        if (
          !isAllowedExplicit &&
          host !== "localhost" &&
          host !== "127.0.0.1" &&
          host !== "[::1]"
        ) {
          logger.warn({
            event: "cors_rejected",
            origin,
            origin_host: host,
            ip: req.ip,
          });
          return res.status(403).json({
            jsonrpc: "2.0",
            error: {
              code: -32600,
              message:
                "Forbidden: cross-origin requests from untrusted origins are not permitted",
            },
            id: null,
          });
        }
      } catch {
        logger.warn({
          event: "cors_invalid_origin",
          origin,
          ip: req.ip,
        });
        return res.status(403).json({
          jsonrpc: "2.0",
          error: {
            code: -32600,
            message: "Forbidden: invalid Origin header",
          },
          id: null,
        });
      }
    }

    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });
      const server = createServerFn();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      logger.error({
        event: "mcp_request_error",
        ip: req.ip,
        error: err.message,
        stack: err.stack,
      });
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || "Internal server error" });
      }
    }
  });

  app.delete("/", (_req, res) => {
    res.status(200).json({ message: "Stateless session closed" });
  });

  return app;
}
