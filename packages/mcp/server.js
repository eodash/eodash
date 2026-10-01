import express from "express";
import cors from "cors";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getMetadata, generateLandingPage } from "./helpers.js";

/**
 * Creates and configures the Express HTTP application for the MCP server
 * @param {() => import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} createServerFn
 */
export function createExpressApp(createServerFn) {
  const app = express();

  app.use(cors({ origin: "*" }));
  app.use(express.json());

  // Handle malformed JSON body errors in standard JSON-RPC format
  app.use((err, _req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
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
    const { widgetsData, architectureData } = getMetadata();
    const serverInstance = createServerFn();
    const tools = Object.entries(serverInstance._registeredTools || {}).map(
      ([name, def]) => ({
        name,
        description: def.description,
      }),
    );
    res.setHeader("Content-Type", "text/html");
    res.send(generateLandingPage(widgetsData, architectureData, { tools }));
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
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });
      const server = createServerFn();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("Error handling MCP request:", err);
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
